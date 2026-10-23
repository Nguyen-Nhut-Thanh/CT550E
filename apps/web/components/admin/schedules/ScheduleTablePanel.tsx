"use client";

import { ScheduleTableSkeleton } from "@/components/admin/schedules/ScheduleTableSkeleton";

import { AdminPagination } from "@/components/common/AdminPagination";
import { AdminStatusBadge } from "@/components/common/AdminStatusBadge";
import { getScheduleBookedCount, getScheduleStatusMeta } from "@/lib/admin/schedules/status";
import { formatVND } from "@/lib/utils/currency";
import { AlertCircle, Calendar, Edit, Eye, EyeOff, Plus, Trash2, Users } from "lucide-react";
import type { ScheduleTablePanelProps as Props } from 'shared';

export function ScheduleTablePanel({
  selectedTour,
  schedules,
  loading,
  scheduleStatusFilter,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onFilterChange,
  onCreate,
  onEdit,
  onDelete,
  onToggleStatus,
  onPageChange,
}: Props) {
  const filterOptions = [
    {
      id: "upcoming",
      label: "Sắp khởi hành",
      activeClass: "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100",
    },
    {
      id: "past",
      label: "Đã đi",
      activeClass: "bg-slate-500 text-white border-slate-500 shadow-lg shadow-slate-100",
    },
    {
      id: "full",
      label: "Hết chỗ",
      activeClass: "bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-100",
    },
    {
      id: "hidden",
      label: "Đang ẩn",
      activeClass: "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-100",
    },
    {
      id: "all",
      label: "Tất cả",
      activeClass: "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-6 shadow-sm duration-300">
        <div>
          <h2 className="text-xl font-bold leading-none text-slate-900">Các đợt khởi hành</h2>
          <div className="mt-4 flex items-center gap-1.5">
            {filterOptions.slice(0, 4).map((option) => (
              <button
                key={option.id}
                onClick={() => onFilterChange(option.id)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                  scheduleStatusFilter === option.id
                    ? option.activeClass
                    : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
            <div className="mx-1 h-4 w-px bg-slate-200" />
            <button
              onClick={() => onFilterChange("all")}
              className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                scheduleStatusFilter === "all"
                  ? filterOptions[4].activeClass
                  : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              Tất cả
            </button>
          </div>
        </div>

        <button
          onClick={onCreate}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-xl shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0"
        >
          <Plus size={18} /> Thêm đợt mới
        </button>
      </div>

      <div className="min-h-[400px] overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        {loading ? (
          <ScheduleTableSkeleton />
        ) : schedules.length === 0 ? (
          <div className="space-y-3 p-20 text-center">
            <AlertCircle size={48} className="mx-auto text-slate-100" />
            <p className="text-sm font-medium text-slate-500">
              Không có lịch khởi hành nào trong mục này.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-medium text-slate-500">
                    Thời gian & giá đợt
                  </th>
                  <th className="min-w-[120px] px-6 py-4 text-center text-xs font-medium text-slate-500">
                    Đã đặt
                  </th>
                  <th className="min-w-[150px] px-6 py-4 text-xs font-medium text-slate-500">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {schedules.map((schedule) => {
                  const bookedCount = getScheduleBookedCount(schedule);
                  const isParentHidden = selectedTour?.status === 0;
                  const statusMeta = getScheduleStatusMeta(schedule, { isParentHidden });
                  const isPast = statusMeta.label === "Đã khởi hành";
                  const isFull = statusMeta.label === "Đã hết chỗ";

                  return (
                    <tr
                      key={schedule.tour_schedule_id}
                      className="group transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-xl border opacity-80 shadow-sm ${
                              isPast
                                ? "border-slate-100 bg-slate-50 text-slate-300"
                                : isParentHidden
                                  ? "border-slate-200 bg-slate-100 text-slate-400"
                                  : "border-blue-100 bg-blue-50 text-blue-500"
                            }`}
                          >
                            <Calendar size={18} />
                          </div>
                          <div>
                            <div className="flex flex-col text-sm font-medium text-slate-700">
                              <div className={`flex items-center gap-2 ${isPast ? "text-slate-400" : ""}`}>
                                <span className={isPast ? "text-slate-400" : "text-blue-600"}>
                                  {new Date(schedule.start_date).toLocaleTimeString("vi-VN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                                {new Date(schedule.start_date).toLocaleDateString("vi-VN")}
                              </div>
                              <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
                                Đến:
                                {new Date(schedule.end_date).toLocaleTimeString("vi-VN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}{" "}
                                {new Date(schedule.end_date).toLocaleDateString("vi-VN")}
                              </div>
                            </div>
                            <div
                              className={`mt-1 w-fit rounded-lg border px-2 py-0.5 text-xs font-medium opacity-90 ${
                                isPast
                                  ? "border-slate-100 bg-slate-50 text-slate-400"
                                  : "border-blue-100 bg-blue-50/50 text-blue-500"
                              }`}
                            >
                              {formatVND(schedule.price)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-1.5 text-xs font-medium shadow-sm ${
                            isPast
                              ? "border-slate-100 bg-slate-50 text-slate-300"
                              : isFull
                                ? "border-amber-100 bg-amber-50 text-amber-600"
                                : "border-slate-100 bg-slate-50 text-slate-600"
                          }`}
                        >
                          <Users
                            size={12}
                            className={
                              isPast ? "text-slate-200" : isFull ? "text-amber-400" : "text-slate-400"
                            }
                          />
                          {bookedCount} / {schedule.quota}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <AdminStatusBadge
                          tone={statusMeta.tone}
                          className="whitespace-nowrap px-3 py-1 text-xs font-medium normal-case tracking-normal"
                        >
                          {statusMeta.label}
                        </AdminStatusBadge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex translate-x-1 items-center justify-end gap-1.5 px-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                          <button
                            onClick={() =>
                              onToggleStatus(schedule.tour_schedule_id, schedule.status, bookedCount)
                            }
                            className={`rounded-lg border p-2 shadow-sm transition-all ${
                              schedule.status === 1
                                ? "border-slate-200 bg-white text-slate-900 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                                : "border-slate-900 bg-slate-900 text-white hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
                            }`}
                            title={schedule.status === 1 ? "Ẩn lịch trình" : "Hiện lịch trình"}
                          >
                            {schedule.status === 1 ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                          <button
                            onClick={() => onEdit(schedule.tour_schedule_id)}
                            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-900 shadow-sm transition-all hover:bg-blue-600 hover:text-white"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => onDelete(schedule.tour_schedule_id)}
                            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-900 shadow-sm transition-all hover:bg-rose-600 hover:text-white"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && schedules.length > 0 && (
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            itemLabel="lịch khởi hành"
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}
