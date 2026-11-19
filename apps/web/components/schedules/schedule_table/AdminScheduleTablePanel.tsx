"use client";

import Link from "next/link";
import { AdminPagination } from "@/components/common/admin_shared/tables/AdminPagination";
import { ImageWithFallback } from "@/components/common/dialogs_and_feedback/media/ImageWithFallback";
import {
  getScheduleBookedCount,
  getScheduleStatusMeta,
} from "@/lib/schedules/admin/status";
import { formatVND } from "@/lib/utils/currency";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Plus,
  Tag,
  Users,
} from "lucide-react";
import type { ScheduleTablePanelProps } from "shared";
import { ScheduleRowActions } from "@/components/schedules/schedule_table/AdminScheduleRowActions";
import { ScheduleTableSkeleton } from "@/components/schedules/schedule_table/AdminScheduleTableSkeleton";
import { useAdminContentReadOnly } from '@/components/common/admin_shared/guards/AdminContentPermission';
import { ADMIN_CONTENT_DENIED, applyDiscount } from 'shared';

export function ScheduleTablePanel({
  selectedTourId,
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
  onViewManifest,
  onConfigurePromotion,
  onConfigureFlashDeal,
  pendingIds = [],
}: ScheduleTablePanelProps) {
  const readOnly = useAdminContentReadOnly();
  const tabs = [
    { id: "upcoming", label: "Sắp khởi hành" },
    { id: "past", label: "Đã đi" },
    { id: "selling", label: "Đang bán" },
    { id: "full", label: "Hết chỗ" },
    { id: "hidden", label: "Tạm khóa" },
    { id: "all", label: "Tất cả" },
  ];
  return (
    <section
      className="min-w-0 rounded-[14px] border border-[#e1edfc] bg-white shadow-[0_4px_20px_#476dae06] p-4 flex flex-col h-[calc(100vh-160px)] min-h-[700px] max-h-[940px] admin-max-900:h-[600px] admin-max-900:min-h-0 overflow-hidden"
      aria-label="Các đợt khởi hành"
      aria-busy={loading}
    >
      {selectedTour && (
        <div className="flex items-center gap-3.5 rounded-xl bg-gradient-to-r from-blue-50/90 to-sky-50/50 border border-blue-100/80 p-3 mb-3.5 shrink-0">
          <ImageWithFallback
            src={selectedTour.tour_images?.[0]?.image_url}
            alt=""
            className="w-[96px] h-[72px] rounded-[8px] object-cover shrink-0 bg-blue-50 border border-slate-100"
          />
          <div className="flex-1 min-w-0">
            <span className="inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-1.5 py-0.5 rounded-md bg-blue-50 text-[#075bff] border border-blue-100 text-[10px] font-bold leading-normal">
              {selectedTour.code}
            </span>
            <h2 className="text-[#0b1747] text-[15px] font-[750] leading-snug mt-1 truncate">
              {selectedTour.name}
            </h2>
            <div className="flex items-center flex-wrap gap-x-3.5 gap-y-1 mt-1 text-[11.5px] text-[#7387aa]">
              <span className="inline-flex items-center gap-1">
                <Clock3 size={13} className="text-slate-400" />
                {selectedTour.duration_days} ngày {selectedTour.duration_nights} đêm
              </span>
              <strong className="inline-flex items-center gap-1 text-[#075bff] font-bold">
                <Tag size={13} />
                {formatVND(selectedTour.base_price)}
              </strong>
            </div>
          </div>
          <Link
            href={`/admin/tours/${selectedTourId}`}
            className="inline-flex items-center justify-center gap-1.5 bg-white border border-blue-200 text-[#075bff] rounded-lg whitespace-nowrap px-3 py-1.5 text-xs font-semibold shadow-2xs hover:bg-blue-50 transition"
          >
            <span>Xem chi tiết tour</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 mb-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="grid place-items-center shrink-0 size-10 rounded-xl bg-blue-50 text-[#075bff] border border-blue-100/80">
            <CalendarDays size={20} />
          </span>
          <div>
            <h2 className="text-[16px] font-[750] text-[#0b1747] leading-tight">Các đợt khởi hành</h2>
            <p className="text-[12px] text-[#637da5] mt-0.5 leading-normal">Danh sách các đợt khởi hành của tour này</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCreate}
          disabled={readOnly}
          title={readOnly ? ADMIN_CONTENT_DENIED : undefined}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#075bff] text-white hover:bg-[#064ecc] px-4 py-2 text-[13px] font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
        >
          <Plus size={18} />
          <span>Thêm đợt mới</span>
        </button>
      </div>

      <div
        className="flex gap-1.5 flex-wrap mb-3 shrink-0"
        role="group"
        aria-label="Lọc lịch khởi hành"
      >
        {tabs.map((tab) => {
          const isSelected = scheduleStatusFilter === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              aria-pressed={isSelected}
              onClick={() => onFilterChange(tab.id)}
              className={`inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer ${
                isSelected
                  ? "bg-[#075bff] text-white shadow-xs"
                  : "bg-slate-50 text-slate-600 border border-slate-200/80 hover:bg-blue-50 hover:text-[#075bff]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-[12px] border border-[#edf2fb] flex-1 min-h-0 flex flex-col overflow-hidden bg-white">
        {loading ? (
          <ScheduleTableSkeleton />
        ) : !schedules.length ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-2.5 p-12 text-center text-[#8ca1be]">
            <CalendarDays size={36} className="text-blue-300" />
            <strong className="text-[14px] text-[#5c769d] font-bold">Chưa có lịch khởi hành trong mục này</strong>
            <p className="text-[12px] text-slate-400">Chọn bộ lọc khác hoặc thêm một đợt khởi hành mới.</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-auto overscroll-contain">
            <table className="w-full border-collapse text-left text-[12.5px] whitespace-nowrap">
              <thead>
                <tr className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs text-[#617a9f] text-[11.5px] font-bold uppercase border-b border-[#edf2fb]">
                  {[
                    "Thời gian khởi hành",
                    "Giá đợt",
                    "Số chỗ",
                    "Trạng thái",
                    "Thao tác",
                  ].map((label) => (
                    <th scope="col" key={label} className="p-3.5 px-4 font-bold first:pl-4 last:pr-4 last:text-center">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf2fb]">
                {schedules.map((schedule) => {
                  const start = new Date(schedule.start_date);
                  const end = new Date(schedule.end_date);
                  const booked = getScheduleBookedCount(schedule);
                  const percent =
                    schedule.quota > 0
                      ? Math.min(
                          100,
                          Math.round((booked / schedule.quota) * 100),
                        )
                      : 0;
                  const status = getScheduleStatusMeta(schedule, {
                    isParentHidden: selectedTour?.status === 0,
                  });

                  // Tính giá khuyến mãi / flash deal nếu có
                  const originalPrice = Number(schedule.price) || 0;
                  const flashDeal =
                    (schedule as any).flash_deals ||
                    (schedule as any).flash_deal;
                  const promo =
                    schedule.schedule_promotions ||
                    (schedule as any).schedule_promotion;

                  let discountedPrice: number | null = null;
                  let dealBadge: {
                    icon: string;
                    text: string;
                    title?: string;
                    active: boolean;
                  } | null = null;

                  if (
                    flashDeal &&
                    (flashDeal.status === 1 || flashDeal.status === undefined) &&
                    Number(flashDeal.discount_value) > 0
                  ) {
                    discountedPrice = applyDiscount(
                      originalPrice,
                      flashDeal.discount_type,
                      Number(flashDeal.discount_value),
                    );
                    dealBadge = {
                      icon: "⚡",
                      text:
                        flashDeal.discount_type === "percentage"
                          ? `-${flashDeal.discount_value}%`
                          : `-${formatVND(Number(flashDeal.discount_value))}`,
                      active: true,
                    };
                  } else if (
                    promo &&
                    promo.is_active &&
                    Number(promo.discount_value) > 0
                  ) {
                    discountedPrice = applyDiscount(
                      originalPrice,
                      promo.discount_type,
                      Number(promo.discount_value),
                    );
                    dealBadge = {
                      icon: "🎁",
                      text:
                        promo.discount_type === "percentage"
                          ? `-${promo.discount_value}%`
                          : `-${formatVND(Number(promo.discount_value))}`,
                      title: promo.title,
                      active: true,
                    };
                  } else if (promo && !promo.is_active) {
                    dealBadge = {
                      icon: "🎁",
                      text: `${
                        promo.discount_type === "percentage"
                          ? `-${promo.discount_value}%`
                          : `-${formatVND(Number(promo.discount_value))}`
                      } (Tắt)`,
                      title: promo.title,
                      active: false,
                    };
                  }

                  return (
                    <tr key={schedule.tour_schedule_id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4 align-middle">
                        <div className="ui-schedule-overview-dateCell flex items-center gap-[12px]">
                          <div className="ui-schedule-overview-dateTile flex flex-col items-center justify-center w-[50px] h-[60px] rounded-[10px] [border:1px_solid_#dceaff] [background:linear-gradient(#f4f9ff,_#eaf3ff)] text-[#075bff] shrink-0 [&_span]:text-[10px] [&_strong]:text-[23px] [&_strong]:font-extrabold [&_strong]:leading-[1.2] [&_strong]:mt-[3px]">
                            <span>THG {start.getMonth() + 1}</span>
                            <strong>
                              {String(start.getDate()).padStart(2, "0")}
                            </strong>
                          </div>
                          <div>
                            <strong className="ui-schedule-overview-departureDate text-[13px] font-bold text-[#182d53]">
                              {start.toLocaleDateString("vi-VN", {
                                weekday: "short",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </strong>
                            <span className="ui-schedule-overview-subtext flex items-center gap-[5px] mt-[4px] text-[11px] text-[#7d93b9]">
                              Đến: {end.toLocaleDateString("vi-VN")}
                            </span>
                            <span className="mt-1 block text-xs text-sky-700">{schedule.departure_location?.name} · {schedule.pickup_points?.length || 0} điểm đón</span>
                            <span className="ui-schedule-overview-subtext flex items-center gap-[5px] mt-[4px] text-[11px] text-[#7d93b9]">
                              <Clock3 size={12} />
                              {start.toLocaleTimeString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {selectedTour
                                ? ` · ${selectedTour.duration_days} ngày ${selectedTour.duration_nights} đêm`
                                : ""}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-middle">
                        {discountedPrice !== null && discountedPrice < originalPrice ? (
                          <div>
                            <span className="text-[11px] font-medium text-slate-400 line-through block leading-tight">
                              {formatVND(originalPrice)}
                            </span>
                            <strong className="text-[13px] font-extrabold text-rose-600 block mt-0.5 leading-tight">
                              {formatVND(discountedPrice)}
                            </strong>
                            <span className="ui-schedule-overview-subtext flex items-center gap-[5px] mt-[2px] text-[10.5px] text-[#7d93b9]">
                              / khách
                            </span>
                          </div>
                        ) : (
                          <div>
                            <strong className="ui-schedule-overview-schedulePrice text-[13px] font-[750] text-[#152a4d] block">
                              {formatVND(originalPrice)}
                            </strong>
                            <span className="ui-schedule-overview-subtext flex items-center gap-[5px] mt-[3px] text-[11px] text-[#7d93b9]">
                              / khách
                            </span>
                          </div>
                        )}

                        {dealBadge && (
                          <div className="mt-1.5 flex items-center gap-1">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold shadow-2xs ${
                                dealBadge.active
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              }`}
                              title={dealBadge.title}
                            >
                              {dealBadge.icon} {dealBadge.text}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 align-middle">
                        <div className="ui-schedule-overview-capacity min-w-[114px] [&>span]:flex [&>span]:items-center [&>span]:gap-[8px] [&>span]:text-[#496d9f] [&>span_svg]:text-[#075bff]">
                          <span>
                            <Users size={16} />
                            {booked} / {schedule.quota}
                          </span>
                          <div className="ui-schedule-overview-progressRow flex items-center gap-[8px] mt-[7px] [&_small]:text-[10px] [&_small]:text-[#8296b9] [&_small]:min-w-[27px]">
                            <div
                              className="ui-schedule-overview-progress h-[7px] rounded-[10px] [background:#e5ebf5] overflow-hidden w-[85px] [&_i]:block [&_i]:h-full [&_i]:rounded-[10px] [&_i]:[background:#075bff] [&_i[data-level=high]]:[background:#ffad16] [&_i[data-level=full]]:[background:#ff3a5c]"
                              role="progressbar"
                              aria-label="Tỷ lệ chỗ đã đặt"
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={percent}
                              aria-valuetext={`${booked} trên ${schedule.quota} chỗ`}
                            >
                              <i
                                style={{ width: `${percent}%` }}
                                data-level={
                                  percent >= 100
                                    ? "full"
                                    : percent >= 75
                                      ? "high"
                                      : "normal"
                                }
                              />
                            </div>
                            <small>{percent}%</small>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-bold whitespace-nowrap uppercase ${
                            status.tone === "success"
                              ? "border-[#cff3e1] bg-[#e6fbf1] text-[#049650]"
                              : status.tone === "warning"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-slate-200 bg-slate-50 text-slate-500"
                          }`}
                        >
                          <span className="size-1.5 shrink-0 rounded-full bg-current" />
                          {status.label === "Đang hoạt động"
                            ? "Đang bán"
                            : status.label === "Đã hết chỗ"
                              ? "Hết chỗ"
                              : status.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 align-middle text-center">
                        <ScheduleRowActions
                          schedule={schedule}
                          busy={pendingIds.includes(schedule.tour_schedule_id)}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onToggleStatus={onToggleStatus}
                          onViewManifest={onViewManifest}
                          onConfigurePromotion={onConfigurePromotion}
                          onConfigureFlashDeal={onConfigureFlashDeal}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {!loading && (
          <div className="shrink-0 bg-white">
            <AdminPagination
              variant="numbered"
              showSinglePage
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              itemLabel="đợt"
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </section>
  );
}
