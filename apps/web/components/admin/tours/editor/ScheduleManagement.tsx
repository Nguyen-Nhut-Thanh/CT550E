"use client";

import { ScheduleStartFields } from "@/components/admin/schedules/editor/ScheduleStartFields";
import { ScheduleDepartureCard } from "@/components/admin/schedules/editor/ScheduleDepartureCard";
import { buildSchedulePayload, createDefaultScheduleForm } from "@/lib/admin/schedules/forms";
import { getAdminLocations } from "@/lib/admin/locations/api";
import { getAdminTourDetail } from "@/lib/admin/tours/api";
import Link from "next/link";
import { AdminPagination } from "@/components/admin/common/AdminPagination";
import { AdminStatusBadge } from "@/components/admin/common/AdminStatusBadge";
import { ConfirmDialog } from "@/components/common/overlays/ConfirmDialog";
import InlineNotice from "@/components/common/feedback/InlineNotice";
import { PriceInput } from "@/components/common/forms/PriceInput";
import { createTourSchedule, deleteTourSchedule, getTourSchedules } from "@/lib/admin/schedules/api";
import { useToast } from "@/lib/notifications/useToast";
import { formatVND } from "@/lib/utils/currency";
import { AlertTriangle, ArrowRight, CalendarDays, DollarSign, Plus, Trash2, Users, X, } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ScheduleManagementItem as Schedule, LocationOption, TourInfo } from 'shared';

function getBookedCount(schedule: Schedule) {
  return schedule._count?.bookings || 0;
}

function isActiveSchedule(schedule: Schedule) {
  return schedule.status === 1 && new Date(schedule.start_date).getTime() >= Date.now();
}

function getUsagePercent(schedule: Schedule) {
  if (!schedule.quota) {
    return 0;
  }

  return Math.min(100, Math.round((getBookedCount(schedule) / schedule.quota) * 100));
}

export const ScheduleManagement = ({
  tourId,
  durationDays = 1,
}: {
  tourId: number;
  durationDays?: number;
}) => {
  const pageSize = 10;
  const { success, error: showError } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingDeleteScheduleId, setPendingDeleteScheduleId] = useState<number | null>(null);
  const [form, setForm] = useState(createDefaultScheduleForm);
  const [locations, setLocations] = useState<LocationOption[]>([]);
  useEffect(() => {
    let active = true;
    void Promise.all([getAdminLocations<LocationOption>(), getAdminTourDetail<TourInfo>(tourId)]).then(([data, tour]) => {
      if (!active) return;
      setLocations(data.items || []);
      setForm(prev => ({ ...prev, departure_location_id: prev.departure_location_id || tour.tour.departure_location || '' }));
    }).catch(() => { if (active) setError('Không thể tải nơi xuất phát. Vui lòng tải lại trang.'); });
    return () => { active = false; };
  }, [tourId]);

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      setSchedules(await getTourSchedules<Schedule>(tourId));
    } catch {
    } finally {
      setLoading(false);
    }
  }, [tourId]);

  useEffect(() => {
    void loadSchedules();
  }, [loadSchedules]);

  const filteredSchedules = useMemo(
    () => schedules.filter(isActiveSchedule),
    [schedules],
  );

  const totalPages = Math.max(1, Math.ceil(filteredSchedules.length / pageSize));
  const paginatedSchedules = filteredSchedules.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredSchedules.length]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleStartDateChange = (dateStr: string) => {
    if (!dateStr) return;

    const startDate = new Date(dateStr);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + (durationDays > 0 ? durationDays - 1 : 0));

    setForm((prev) => ({
      ...prev,
      start_date: dateStr,
      end_date: endDate.toISOString().split("T")[0],
    }));
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      if (!form.departure_location_id) throw new Error('Vui lòng chọn nơi xuất phát.');
      if (form.pickup_points.some(point => !point.name.trim() || !point.address.trim() || !point.pickup_at)) throw new Error('Vui lòng điền đầy đủ thông tin điểm đón.');
      await createTourSchedule(tourId, buildSchedulePayload(form));
      setIsCreating(false);
      setForm({ ...createDefaultScheduleForm(), departure_location_id: form.departure_location_id });
      void loadSchedules();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể tạo lịch trình");
    }
  };

  const handleDelete = async (scheduleId: number) => {
    try {
      await deleteTourSchedule(scheduleId);
      success("Đã xóa lịch trình thành công");
      setSchedules((current) =>
        current.filter((schedule) => schedule.tour_schedule_id !== scheduleId),
      );
      setPendingDeleteScheduleId(null);
    } catch {
      showError("Lỗi kết nối");
    }
  };

  return (
    <div className="relative space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <CalendarDays className="text-blue-600" size={20} />
          Lịch khởi hành
        </h3>
        <button
          onClick={() => setIsCreating((prev) => !prev)}
          className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition-all hover:bg-blue-100"
        >
          {isAdding ? <X size={16} /> : <Plus size={16} />}
          {isAdding ? "Hủy bỏ" : "Thêm lịch mới"}
        </button>
      </div>

      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="animate-in slide-in-from-top-2 rounded-2xl border border-slate-200 bg-slate-50 p-6 fade-in duration-300"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-1.5">
              <ScheduleStartFields
                dateValue={form.start_date}
                minDate={new Date().toISOString().split("T")[0]}
                dateLabel="Ngày khởi hành"
                onDateChange={handleStartDateChange}
              />
              {form.end_date && (
                <p className="ml-1 text-[10px] font-bold italic text-slate-400">
                  Ngày về: {new Date(form.end_date).toLocaleDateString("vi-VN")} ({durationDays} ngày)
                </p>
              )}
            </div>

            <div>
              <PriceInput
                label="Giá tour"
                value={form.price}
                onChange={(value) => setForm((prev) => ({ ...prev, price: value }))}
                placeholder="Ví dụ: 1.000.000"
              />
            </div>

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Tổng số chỗ
              </label>
              <input
                type="number"
                required
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-blue-500"
                value={form.quota === 0 ? "" : form.quota}
                placeholder="0"
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    quota: event.target.value === "" ? 0 : Number(event.target.value),
                  }))
                }
              />
            </div>
          </div>

          <div className="mt-6"><ScheduleDepartureCard form={form} locations={locations} disabled={false} onChange={setForm} /></div>

          {error && (
            <InlineNotice tone="error" className="mt-3 py-3 text-xs">
              {error}
            </InlineNotice>
          )}

          <div className="mt-6 flex justify-end">
            <button className="rounded-2xl bg-blue-600 px-10 py-3 text-sm font-black text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700">
              Tạo lịch trình
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-400">
              Chưa có lịch khởi hành đang nhận khách
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase text-slate-500">
                    Thời gian
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase text-slate-500">
                    Giá vé
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase text-slate-500">
                    Đã đặt / Tổng chỗ
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase text-slate-500">
                    Mức lấp đầy
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-[11px] font-bold uppercase text-slate-500">
                    Trạng thái
                  </th>
                  <th className="whitespace-nowrap px-4 py-3 text-right text-[11px] font-bold uppercase text-slate-500">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedSchedules.map((schedule) => {
                  const bookedCount = getBookedCount(schedule);
                  const usagePercent = getUsagePercent(schedule);

                  return (
                    <tr key={schedule.tour_schedule_id} className="hover:bg-slate-50/50">
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          {new Date(schedule.start_date).toLocaleDateString("vi-VN")}
                          <ArrowRight size={12} className="text-slate-300" />
                          {new Date(schedule.end_date).toLocaleDateString("vi-VN")}
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{schedule.departure_location?.name} · {schedule.pickup_points?.length || 0} điểm đón</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm font-black text-blue-600">
                        <div className="flex items-center gap-1">
                          <DollarSign size={14} className="text-slate-400" />
                          {formatVND(schedule.price)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-sm font-bold text-slate-700">
                        <div className="flex items-center gap-1">
                          <Users size={14} className="text-slate-400" />
                          <span className="text-emerald-600">{bookedCount}</span> / {schedule.quota}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="w-full max-w-[150px]">
                          <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-slate-400">
                            <span>{usagePercent}%</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full transition-all duration-1000 ${
                                usagePercent > 80 ? "bg-amber-500" : "bg-blue-500"
                              }`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <AdminStatusBadge tone="success">Đang nhận khách</AdminStatusBadge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <Link href={`/admin/schedules/${schedule.tour_schedule_id}`} className="mr-3 text-sm font-semibold text-blue-600">Chỉnh sửa</Link>
                        <button
                          onClick={() => setPendingDeleteScheduleId(schedule.tour_schedule_id)}
                          className="rounded-xl p-2 text-slate-300 transition-all hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && filteredSchedules.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSchedules.length}
            pageSize={pageSize}
            itemLabel="lịch trình"
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      <ConfirmDialog
        open={pendingDeleteScheduleId !== null}
        icon={<AlertTriangle size={32} />}
        title="Xóa lịch trình?"
        description="Lịch trình này sẽ bị xóa khỏi tour. Hành động này không thể hoàn tác."
        confirmLabel="Xác nhận xóa"
        cancelLabel="Hủy bỏ"
        onConfirm={() => {
          if (pendingDeleteScheduleId !== null) {
            void handleDelete(pendingDeleteScheduleId);
          }
        }}
        onCancel={() => setPendingDeleteScheduleId(null)}
      />
    </div>
  );
};
