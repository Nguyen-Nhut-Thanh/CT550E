"use client";


import { ScheduleEmptyState } from "@/components/schedules/schedule_table/AdminScheduleEmptyState";
import { SchedulePageHeader } from "@/components/schedules/schedule_table/AdminSchedulePageHeader";

import { ScheduleTablePanel } from "@/components/schedules/schedule_table/AdminScheduleTablePanel";
import { ScheduleManifestModal } from "@/components/schedules/schedule_modals/AdminScheduleManifestModal";
import { SchedulePromotionModal } from "@/components/schedules/schedule_modals/AdminSchedulePromotionModal";
import { FlashDealModal } from "@/components/flash_deals/AdminFlashDealModal";
import { TourListPanel } from "@/components/schedules/tour_selector/AdminScheduleTourListPanel";
import { ConfirmDialog } from "@/components/common/dialogs_and_feedback/dialogs/ConfirmDialog";
import {
  deleteAdminSchedule,
  getTourSchedules,
  updateAdminScheduleStatus,
} from "@/lib/schedules/admin/api";
import {
  deleteAdminFlashDeal,
  saveAdminFlashDeal,
} from "@/lib/flash_deals/admin/api";
import {
  buildFlashDealForm,
  buildFlashDealPayload,
  createDefaultFlashDealForm,
} from "@/lib/flash_deals/admin/forms";
import { matchesScheduleStatusFilter } from "@/lib/schedules/admin/status";
import { reconcileScheduleListPage, restoreScheduleListView, SCHEDULE_LIST_STATE_KEY } from "@/lib/schedules/admin/view-state";
import { getAdminTours } from "@/lib/tours/admin/api";
import {
  matchesTourSearch,
  matchesTourTypeFilter,
} from "@/lib/tours/admin/filters";
import { useToast } from "@/lib/notifications/useToast";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type {
  AdminSchedule as Schedule,
  FlashDealForm,
  FlashDealSchedule,
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
  const [viewReady, setViewReady] = useState(false);
  const [loadedSchedulesTourId, setLoadedSchedulesTourId] = useState<number | null>(null);
  const [pendingDeleteScheduleId, setPendingDeleteScheduleId] = useState<
    number | null
  >(null);
  const [manifestScheduleId, setManifestScheduleId] = useState<number | null>(null);
  const [promotionSchedule, setPromotionSchedule] = useState<Schedule | null>(null);
  const [flashDealSchedule, setFlashDealSchedule] = useState<Schedule | null>(null);
  const [flashDealForm, setFlashDealForm] = useState<FlashDealForm>(createDefaultFlashDealForm);
  const [savingFlashDeal, setSavingFlashDeal] = useState(false);
  const [deletingFlashDeal, setDeletingFlashDeal] = useState(false);
  const [confirmDeleteFlashDealOpen, setConfirmDeleteFlashDealOpen] = useState(false);
  const [pendingToggleStatus, setPendingToggleStatus] = useState<{
    scheduleId: number;
    currentStatus: number;
    bookedCount: number;
  } | null>(null);

  const selectedTour = tours.find((tour) => tour.tour_id === selectedTourId);

  useEffect(() => {
    try {
      const saved = restoreScheduleListView(window.sessionStorage.getItem(SCHEDULE_LIST_STATE_KEY));
      setSelectedTourId(saved.selectedTourId);
      setTourPage(saved.tourPage);
      setSchedulePage(saved.schedulePage);
      setSearchTerm(saved.searchTerm);
      setTourTypeFilter(saved.tourTypeFilter);
      setScheduleStatusFilter(saved.scheduleStatusFilter);
    } catch {
      // Browser storage can be disabled; keep the list usable with defaults.
    }
    setViewReady(true);
  }, []);

  useEffect(() => {
    if (!viewReady) return;
    try {
      window.sessionStorage.setItem(SCHEDULE_LIST_STATE_KEY, JSON.stringify({
        selectedTourId, tourPage, schedulePage, searchTerm, tourTypeFilter, scheduleStatusFilter,
      }));
    } catch {
      // Storage restrictions must not interrupt list operations.
    }
  }, [viewReady, selectedTourId, tourPage, schedulePage, searchTerm, tourTypeFilter, scheduleStatusFilter]);

  useEffect(() => {
    if (!viewReady) return;
    let active = true;
    async function loadTours() {
      setLoadingTours(true);
      setTourError(false);
      try {
        const data = await getAdminTours<Tour>();
        if (!active) return;
        setTours(data.items || []);
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
  }, [tourRetry, viewReady]);

  useEffect(() => {
    if (!viewReady || loadingTours || tourError || selectedTour) return;
    setSelectedTourId(tours[0]?.tour_id ?? null);
    setSchedulePage(1);
  }, [viewReady, loadingTours, tourError, selectedTour, tours]);

  useEffect(() => {
    if (!viewReady || loadingTours || !selectedTour) return;
    let active = true;

    async function loadSchedules() {
      setLoadingSchedules(true);
      setScheduleError(false);
      setSchedules([]);
      setLoadedSchedulesTourId(null);
      try {
        const items = await getTourSchedules<Schedule>(selectedTourId!);
        if (active) {
          setSchedules(items);
          setLoadedSchedulesTourId(selectedTourId);
        }
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
  }, [selectedTourId, selectedTour, loadingTours, viewReady, scheduleRetry]);

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
      setPendingDeleteScheduleId(null);
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

  const handleOpenFlashDeal = (schedule: Schedule) => {
    setFlashDealSchedule(schedule);
    const flashDealItem: FlashDealSchedule = {
      ...schedule,
      tours: selectedTour
        ? {
            tour_id: selectedTour.tour_id,
            name: selectedTour.name,
            code: selectedTour.code,
          }
        : null,
      flash_deals: schedule.flash_deals ?? null,
      schedule_promotions: schedule.schedule_promotions ?? null,
    };
    setFlashDealForm(buildFlashDealForm(flashDealItem));
  };

  const handleSaveFlashDeal = async () => {
    if (!flashDealSchedule) return;
    if (
      !Number.isFinite(flashDealForm.discount_value) ||
      flashDealForm.discount_value <= 0 ||
      (flashDealForm.discount_type === "percentage"
        ? flashDealForm.discount_value > 100
        : flashDealForm.discount_value > Number(flashDealSchedule.price))
    ) {
      showError("Mức giảm cần lớn hơn 0 và không vượt quá giá gốc hoặc 100%.");
      return;
    }
    setSavingFlashDeal(true);
    try {
      const deal = flashDealSchedule.flash_deals;
      const flashDealItem: FlashDealSchedule = {
        ...flashDealSchedule,
        tours: selectedTour
          ? {
              tour_id: selectedTour.tour_id,
              name: selectedTour.name,
              code: selectedTour.code,
            }
          : null,
        flash_deals: deal ?? null,
        schedule_promotions: flashDealSchedule.schedule_promotions ?? null,
      };
      await saveAdminFlashDeal(
        deal ? `/admin/marketing/flash-deals/${deal.deal_id}` : "/admin/marketing/flash-deals",
        deal ? "PATCH" : "POST",
        buildFlashDealPayload(flashDealItem, flashDealForm),
      );
      success(deal ? "Đã cập nhật flash deal thành công" : "Đã tạo flash deal thành công");
      setFlashDealSchedule(null);
      setScheduleRetry((c) => c + 1);
    } catch (cause) {
      showError(cause instanceof Error ? cause.message : "Không thể lưu flash deal.");
    } finally {
      setSavingFlashDeal(false);
    }
  };

  const handleDeleteFlashDeal = () => {
    const deal = flashDealSchedule?.flash_deals;
    if (!deal || deletingFlashDeal) return;
    setConfirmDeleteFlashDealOpen(true);
  };

  const executeDeleteFlashDeal = async () => {
    const deal = flashDealSchedule?.flash_deals;
    if (!deal || deletingFlashDeal) return;
    setDeletingFlashDeal(true);
    try {
      await deleteAdminFlashDeal(deal.deal_id);
      success("Đã xóa flash deal thành công");
      setConfirmDeleteFlashDealOpen(false);
      setFlashDealSchedule(null);
      setScheduleRetry((c) => c + 1);
    } catch (cause) {
      showError(cause instanceof Error ? cause.message : "Không thể xóa flash deal.");
    } finally {
      setDeletingFlashDeal(false);
    }
  };

  const handleToggleStatus = (
    scheduleId: number,
    currentStatus: number,
    bookedCount: number,
  ) => {
    if (mutations.current.has(scheduleId)) return;
    if (currentStatus === 1 && bookedCount > 0) {
      setPendingToggleStatus({ scheduleId, currentStatus, bookedCount });
      return;
    }
    void executeToggleStatus(scheduleId, currentStatus);
  };

  const executeToggleStatus = async (
    scheduleId: number,
    currentStatus: number,
  ) => {
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
    const next = reconcileScheduleListPage(tourPage, tourTotalPages, viewReady && !loadingTours && !tourError);
    if (next !== tourPage) setTourPage(next);
  }, [tourPage, tourTotalPages, viewReady, loadingTours, tourError]);

  useEffect(() => {
    const next = reconcileScheduleListPage(schedulePage, scheduleTotalPages,
      viewReady && !loadingSchedules && !scheduleError && loadedSchedulesTourId !== null && loadedSchedulesTourId === selectedTourId);
    if (next !== schedulePage) setSchedulePage(next);
  }, [schedulePage, scheduleTotalPages, viewReady, loadingSchedules, scheduleError, loadedSchedulesTourId, selectedTourId]);

  return (
    <div className="flex flex-col gap-3 min-w-0 text-[#112246]">
      <SchedulePageHeader />

      <div className="grid grid-cols-[minmax(340px,_.9fr)_minmax(0,_1.65fr)] gap-3 items-stretch min-[1600px]:grid-cols-[minmax(400px,_.95fr)_minmax(0,_1.55fr)] admin-max-1100:grid-cols-[minmax(280px,_.85fr)_minmax(0,_1.3fr)] admin-max-900:grid-cols-1">
        {tourError ? (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 bg-rose-50 text-rose-700 p-4 rounded-xl border border-rose-200 text-[13px] font-medium"
          >
            <span>Không thể tải danh sách tour.</span>
            <button
              type="button"
              className="font-bold underline underline-offset-2"
              onClick={() => setTourRetry((current) => current + 1)}
            >
              Tải lại
            </button>
          </div>
        ) : (
          <TourListPanel
            loading={loadingTours || !viewReady}
            tours={paginatedTours}
            selectedTourId={selectedTourId}
            searchTerm={searchTerm}
            tourTypeFilter={tourTypeFilter}
            currentPage={tourPage}
            totalPages={tourTotalPages}
            totalItems={filteredTours.length}
            pageSize={pageSize}
            onSearchChange={(value) => { setSearchTerm(value); setTourPage(1); }}
            onFilterChange={(value) => { setTourTypeFilter(value); setTourPage(1); }}
            onSelectTour={(id) => {
              if (id !== selectedTourId) {
                setSchedules([]);
                setScheduleError(false);
                setLoadingSchedules(true);
                setSelectedTourId(id);
                setSchedulePage(1);
              }
            }}
            onPageChange={setTourPage}
          />
        )}

        <div className="min-w-0 flex flex-col h-full">
          {!selectedTourId ? (
            <ScheduleEmptyState />
          ) : scheduleError ? (
            <div
              role="alert"
              className="flex items-center justify-between gap-3 bg-rose-50 text-rose-700 p-4 rounded-xl border border-rose-200 text-[13px] font-medium"
            >
              <span>Không thể tải lịch khởi hành.</span>
              <button
                type="button"
                className="font-bold underline underline-offset-2"
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
              loading={loadingSchedules || loadedSchedulesTourId !== selectedTourId}
              scheduleStatusFilter={scheduleStatusFilter}
              currentPage={schedulePage}
              totalPages={scheduleTotalPages}
              totalItems={filteredSchedules.length}
              pageSize={pageSize}
              onFilterChange={(value) => { setScheduleStatusFilter(value); setSchedulePage(1); }}
              onCreate={() =>
                router.push(`/admin/schedules/new?tourId=${selectedTourId}`)
              }
              onEdit={(scheduleId) =>
                router.push(`/admin/schedules/${scheduleId}`)
              }
              onDelete={setPendingDeleteScheduleId}
              onToggleStatus={handleToggleStatus}
              onPageChange={setSchedulePage}
              onViewManifest={setManifestScheduleId}
              onConfigurePromotion={setPromotionSchedule}
              onConfigureFlashDeal={handleOpenFlashDeal}
              pendingIds={pendingIds}
            />
          )}
        </div>
      </div>

      <ScheduleManifestModal
        scheduleId={manifestScheduleId}
        open={manifestScheduleId !== null}
        onClose={() => setManifestScheduleId(null)}
        onUpdated={() => setScheduleRetry((c) => c + 1)}
      />

      <SchedulePromotionModal
        schedule={promotionSchedule}
        tourName={selectedTour?.name}
        open={promotionSchedule !== null}
        onClose={() => setPromotionSchedule(null)}
        onSaved={() => setScheduleRetry((c) => c + 1)}
      />

      <FlashDealModal
        open={flashDealSchedule !== null}
        saving={savingFlashDeal}
        deleting={deletingFlashDeal}
        schedule={
          flashDealSchedule
            ? {
                ...flashDealSchedule,
                tours: selectedTour
                  ? {
                      tour_id: selectedTour.tour_id,
                      name: selectedTour.name,
                      code: selectedTour.code,
                    }
                  : null,
                flash_deals: flashDealSchedule.flash_deals ?? null,
                schedule_promotions: flashDealSchedule.schedule_promotions ?? null,
              }
            : null
        }
        form={flashDealForm}
        onClose={() => setFlashDealSchedule(null)}
        onChange={(updater) => setFlashDealForm((cur) => updater(cur))}
        onSave={handleSaveFlashDeal}
        onDelete={handleDeleteFlashDeal}
      />

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

      <ConfirmDialog
        open={confirmDeleteFlashDealOpen}
        icon={<Trash2 size={32} className="text-rose-600" />}
        title="Xóa Flash Deal?"
        description="Bạn có chắc chắn muốn xóa Flash Deal của đợt khởi hành này? Đợt khởi hành sẽ trở về mức giá thông thường."
        confirmLabel={deletingFlashDeal ? "Đang xóa..." : "Xác nhận xóa"}
        cancelLabel="Hủy bỏ"
        onConfirm={() => void executeDeleteFlashDeal()}
        onCancel={() => !deletingFlashDeal && setConfirmDeleteFlashDealOpen(false)}
      />

      <ConfirmDialog
        open={pendingToggleStatus !== null}
        icon={<AlertTriangle size={32} className="text-amber-500" />}
        title="Tạm ngừng nhận khách?"
        description={`CẢNH BÁO: Đợt khởi hành này đã có ${pendingToggleStatus?.bookedCount} khách đặt chỗ.\n\nViệc ẩn sẽ khiến tour không còn hiển thị trên website cho người mới. Bạn có chắc chắn muốn ngừng nhận khách cho đợt này không?`}
        confirmLabel="Xác nhận ẩn"
        cancelLabel="Hủy bỏ"
        confirmClassName="bg-amber-600 hover:bg-amber-700 shadow-amber-200"
        onConfirm={() => {
          if (pendingToggleStatus) {
            const { scheduleId, currentStatus } = pendingToggleStatus;
            setPendingToggleStatus(null);
            void executeToggleStatus(scheduleId, currentStatus);
          }
        }}
        onCancel={() => setPendingToggleStatus(null)}
      />
    </div>
  );
}
