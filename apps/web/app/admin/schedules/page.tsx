"use client";

import { ScheduleEmptyState } from "@/components/admin/schedules/listing/ScheduleEmptyState";
import { SchedulePageHeader } from "@/components/admin/schedules/listing/SchedulePageHeader";

import { ScheduleTablePanel } from "@/components/admin/schedules/listing/ScheduleTablePanel";
import { TourListPanel } from "@/components/admin/schedules/tour-picker/TourListPanel";
import { ConfirmDialog } from "@/components/common/overlays/ConfirmDialog";
import {
  deleteAdminSchedule,
  getTourSchedules,
  updateAdminScheduleStatus,
} from "@/lib/admin/schedules/api";
import { matchesScheduleStatusFilter } from "@/lib/admin/schedules/status";
import { getAdminTours } from "@/lib/admin/tours/api";
import {
  matchesTourSearch,
  matchesTourTypeFilter,
} from "@/lib/admin/tours/filters";
import { useToast } from "@/lib/notifications/useToast";
import { confirmAction } from "@/lib/utils/confirm";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type {
  AdminSchedule as Schedule,
  ScheduleOverviewTour as Tour,
} from "shared";

export default function AdminSchedulesPage() {
  const pageSize = 10;
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [tours, setTours] = useState<Tour[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tourTypeFilter, setTourTypeFilter] = useState<string>("all");
  const [tourError, setTourError] = useState(false);
  const [scheduleError, setScheduleError] = useState(false);
  const [tourRetry, setTourRetry] = useState(0);
  const [scheduleRetry, setScheduleRetry] = useState(0);
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const mutations = useRef(new Set<number>());
  const [scheduleStatusFilter, setScheduleStatusFilter] =
    useState<string>("upcoming");
  const [tourPage, setTourPage] = useState(1);
  const [schedulePage, setSchedulePage] = useState(1);
  const [pendingDeleteScheduleId, setPendingDeleteScheduleId] = useState<
    number | null
  >(null);

  const selectedTour = tours.find((tour) => tour.tour_id === selectedTourId);

  useEffect(() => {
    let active = true;
    async function loadTours() {
      setLoadingTours(true);
      setTourError(false);
      try {
        const data = await getAdminTours<Tour>();
        if (!active) return;
        setTours(data.items || []);
        setSelectedTourId(
          (current) => current ?? data.items?.[0]?.tour_id ?? null,
        );
      } catch {
        if (active) setTourError(true);
      } finally {
        if (active) setLoadingTours(false);
      }
    }

    void loadTours();
    return () => {
      active = false;
    };
  }, [tourRetry]);

  useEffect(() => {
    if (!selectedTourId) return;
    let active = true;

    async function loadSchedules() {
      setLoadingSchedules(true);
      setScheduleError(false);
      setSchedules([]);
      try {
        const items = await getTourSchedules<Schedule>(selectedTourId!);
        if (active) setSchedules(items);
      } catch {
        if (active) setScheduleError(true);
      } finally {
        if (active) setLoadingSchedules(false);
      }
    }

    void loadSchedules();
    return () => {
      active = false;
    };
  }, [selectedTourId, scheduleRetry]);

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (mutations.current.has(scheduleId)) return;
    mutations.current.add(scheduleId);
    setPendingIds([...mutations.current]);
    try {
      await deleteAdminSchedule(scheduleId);
      success("Đã xóa lịch khởi hành thành công");
      setSchedules((current) =>
        current.filter((schedule) => schedule.tour_schedule_id !== scheduleId),
      );
      setPendingDeleteScheduleId(null);
    } catch (requestError) {
      showError(
        requestError instanceof Error
          ? requestError.message
          : "Lỗi khi xóa dữ liệu",
      );
    } finally {
      mutations.current.delete(scheduleId);
      setPendingIds([...mutations.current]);
    }
  };

  const handleToggleStatus = async (
    scheduleId: number,
    currentStatus: number,
    bookedCount: number,
  ) => {
    if (mutations.current.has(scheduleId)) return;
    if (currentStatus === 1 && bookedCount > 0) {
      const confirmHide = confirmAction(
        `CẢNH BÁO: Đợt khởi hành này đã có ${bookedCount} khách đặt chỗ.

` +
          "Việc ẩn sẽ khiến tour không còn hiển thị trên website cho người mới.\n\n" +
          "Bạn có chắc chắn muốn ngừng nhận khách cho đợt này không?",
      );
      if (!confirmHide) return;
    }

    const nextStatus = currentStatus === 1 ? 0 : 1;
    mutations.current.add(scheduleId);
    setPendingIds([...mutations.current]);
    try {
      await updateAdminScheduleStatus(scheduleId, nextStatus);
      success(`Đã ${nextStatus === 1 ? "hiện" : "ẩn"} lịch khởi hành`);
      setSchedules((current) =>
        current.map((schedule) =>
          schedule.tour_schedule_id === scheduleId
            ? { ...schedule, status: nextStatus }
            : schedule,
        ),
      );
    } catch (requestError) {
      showError(
        requestError instanceof Error
          ? requestError.message
          : "Lỗi khi cập nhật trạng thái",
      );
    } finally {
      mutations.current.delete(scheduleId);
      setPendingIds([...mutations.current]);
    }
  };

  const filteredTours = tours.filter(
    (tour) =>
      matchesTourSearch(tour, searchTerm) &&
      matchesTourTypeFilter(tour, tourTypeFilter),
  );
  const filteredSchedules = schedules.filter((schedule) =>
    matchesScheduleStatusFilter(schedule, scheduleStatusFilter),
  );

  const tourTotalPages = Math.max(
    1,
    Math.ceil(filteredTours.length / pageSize),
  );
  const scheduleTotalPages = Math.max(
    1,
    Math.ceil(filteredSchedules.length / pageSize),
  );
  const paginatedTours = filteredTours.slice(
    (tourPage - 1) * pageSize,
    tourPage * pageSize,
  );
  const paginatedSchedules = filteredSchedules.slice(
    (schedulePage - 1) * pageSize,
    schedulePage * pageSize,
  );

  useEffect(() => {
    setTourPage(1);
  }, [searchTerm, tourTypeFilter]);

  useEffect(() => {
    setSchedulePage(1);
  }, [selectedTourId, scheduleStatusFilter]);

  useEffect(() => {
    if (tourPage > tourTotalPages) {
      setTourPage(tourTotalPages);
    }
  }, [tourPage, tourTotalPages]);

  useEffect(() => {
    if (schedulePage > scheduleTotalPages) {
      setSchedulePage(scheduleTotalPages);
    }
  }, [schedulePage, scheduleTotalPages]);

  return (
    <div className="ui-schedule-overview-page flex flex-col gap-[12px] min-w-0 text-[#112246] [&_:is(a,_button,_input):focus-visible]:[outline:2px_solid_#3b82f6] [&_:is(a,_button,_input):focus-visible]:outline-offset-[3px] min-[901px]:h-full min-[901px]:min-h-0 admin-max-600:gap-[14px]">
      <SchedulePageHeader />

      <div className="ui-schedule-overview-columns grid grid-cols-[minmax(320px,_.9fr)_minmax(0,_1.65fr)] gap-[16px] [align-items:start] min-[901px]:[flex:1] min-[901px]:min-h-0 min-[901px]:items-stretch min-[1600px]:grid-cols-[minmax(400px,_.95fr)_minmax(0,_1.55fr)] admin-max-1100:grid-cols-[minmax(280px,_.85fr)_minmax(0,_1.3fr)] admin-max-900:grid-cols-[1fr]">
        {tourError ? (
          <div
            role="alert"
            className="ui-schedule-overview-error flex items-center justify-between gap-[12px] [background:#fff3f4] text-[#bd3751] p-[16px] rounded-[12px] text-[13px] [&_button]:font-bold [&_button]:underline"
          >
            Không thể tải danh sách tour.
            <button
              type="button"
              onClick={() => setTourRetry((current) => current + 1)}
            >
              Tải lại
            </button>
          </div>
        ) : (
          <TourListPanel
            loading={loadingTours}
            tours={paginatedTours}
            selectedTourId={selectedTourId}
            searchTerm={searchTerm}
            tourTypeFilter={tourTypeFilter}
            currentPage={tourPage}
            totalPages={tourTotalPages}
            totalItems={filteredTours.length}
            pageSize={pageSize}
            onSearchChange={setSearchTerm}
            onFilterChange={setTourTypeFilter}
            onSelectTour={(id) => {
              if (id !== selectedTourId) {
                setSchedules([]);
                setScheduleError(false);
                setLoadingSchedules(true);
                setSelectedTourId(id);
              }
            }}
            onPageChange={setTourPage}
          />
        )}

        <div className="ui-schedule-overview-scheduleColumn min-w-0 min-[901px]:flex min-[901px]:min-h-0">
          {!selectedTourId ? (
            <ScheduleEmptyState />
          ) : scheduleError ? (
            <div
              role="alert"
              className="ui-schedule-overview-error flex items-center justify-between gap-[12px] [background:#fff3f4] text-[#bd3751] p-[16px] rounded-[12px] text-[13px] [&_button]:font-bold [&_button]:underline"
            >
              Không thể tải lịch khởi hành.
              <button
                type="button"
                onClick={() => setScheduleRetry((current) => current + 1)}
              >
                Tải lại
              </button>
            </div>
          ) : (
            <ScheduleTablePanel
              selectedTourId={selectedTourId}
              selectedTour={selectedTour}
              schedules={paginatedSchedules}
              loading={loadingSchedules}
              scheduleStatusFilter={scheduleStatusFilter}
              currentPage={schedulePage}
              totalPages={scheduleTotalPages}
              totalItems={filteredSchedules.length}
              pageSize={pageSize}
              onFilterChange={setScheduleStatusFilter}
              onCreate={() =>
                router.push(`/admin/schedules/new?tourId=${selectedTourId}`)
              }
              onEdit={(scheduleId) =>
                router.push(`/admin/schedules/${scheduleId}`)
              }
              onDelete={setPendingDeleteScheduleId}
              onToggleStatus={handleToggleStatus}
              onPageChange={setSchedulePage}
              pendingIds={pendingIds}
            />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pendingDeleteScheduleId !== null}
        icon={<AlertTriangle size={32} />}
        title="Xóa lịch khởi hành?"
        description="Đợt khởi hành này sẽ bị xóa nếu chưa có khách đặt. Hành động này không thể hoàn tác."
        confirmLabel={
          pendingDeleteScheduleId !== null &&
          pendingIds.includes(pendingDeleteScheduleId)
            ? "Đang xóa..."
            : "Xác nhận xóa"
        }
        cancelLabel="Hủy bỏ"
        onConfirm={() => {
          if (pendingDeleteScheduleId !== null) {
            void handleDeleteSchedule(pendingDeleteScheduleId);
          }
        }}
        onCancel={() => {
          if (
            pendingDeleteScheduleId === null ||
            !pendingIds.includes(pendingDeleteScheduleId)
          )
            setPendingDeleteScheduleId(null);
        }}
      />
    </div>
  );
}
