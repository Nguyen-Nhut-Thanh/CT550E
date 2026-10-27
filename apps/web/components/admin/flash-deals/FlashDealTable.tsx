"use client";
import { CalendarDays, Flame, Pencil, Plus, Trash2, Zap } from "lucide-react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { AdminRowActions } from "@/components/common/AdminRowActions";
import { AdminPagination } from "@/components/common/AdminPagination";
import {
  getFlashDealSeats,
  getFlashDealStatus,
} from "@/lib/admin/flash-deals/management";
import { previewFlashDealPrice } from "@/lib/admin/flash-deals/forms";
import { formatVND } from "@/lib/utils/currency";
import type { FlashDealSchedule } from "shared";

export function FlashDealTable({
  items,
  loading,
  busy,
  now,
  page,
  onPageChange,
  onEdit,
  onDelete,
}: {
  items: FlashDealSchedule[];
  loading: boolean;
  busy: boolean;
  now: number;
  page: number;
  onPageChange: (page: number) => void;
  onEdit: (schedule: FlashDealSchedule) => void;
  onDelete: (schedule: FlashDealSchedule) => void;
}) {
  const size = 10;
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(page, pages);
  return (
    <section
      className="ui-flash-deal-management-tableCard overflow-hidden min-w-0 [border:1px_solid_#e1ebfa] rounded-[16px] [background:white] [box-shadow:0_8px_30px_#4777ad05]"
      aria-label="Danh sách flash deal"
      aria-busy={loading}
    >
      <div className="ui-flash-deal-management-tableScroll overflow-x-auto">
        <table className="ui-flash-deal-management-table w-full border-collapse text-left whitespace-nowrap text-[12px] [&_th]:[background:linear-gradient(#fbfdff,_#f5f8fc)] [&_th]:p-[16px_18px] [&_th]:[border-bottom:1px_solid_#e8eff8] [&_th]:text-[#7489ac] [&_th]:text-[10px] [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-[.3px]! [&_td]:p-[14px_18px] [&_td]:[border-bottom:1px_solid_#edf2fa] [&_td]:[vertical-align:middle] [&_th:not(:first-child)]:text-center [&_td:not(:first-child)]:text-center [&_th:nth-child(3)]:text-right [&_td:nth-child(3)]:text-right [&_th:nth-child(5)]:text-right [&_td:nth-child(5)]:text-right [&_th:last-child]:w-[80px] [&_td:last-child]:w-[80px] [&_tbody_tr:hover]:[background:#f8fbff] admin-max-650:[&_th]:p-[13px] admin-max-650:[&_td]:p-[13px]">
          <caption className="sr-only">Flash deals theo lịch khởi hành</caption>
          <thead>
            <tr>
              {[
                "Tour & lịch trình",
                "Chỗ trống",
                "Giá gốc",
                "Ưu đãi",
                "Giá deal",
                "Trạng thái",
                "Thao tác",
              ].map((label) => (
                <th key={label} scope="col">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }, (_, row) => (
                <tr key={row}>
                  {Array.from({ length: 7 }, (_, column) => (
                    <td key={column}>
                      <div className="ui-flash-deal-management-skeleton h-[52px] min-w-[40px] rounded-[8px] [background:linear-gradient(90deg,_#eef4fc,_#f9fbff,_#eef4fc)] [background-size:200%_100%] animate-admin-shimmer motion-reduce:animate-none" />
                    </td>
                  ))}
                </tr>
              ))
            ) : !items.length ? (
              <tr>
                <td colSpan={7}>
                  <div className="ui-flash-deal-management-empty p-[55px_20px] text-center text-[#8496b2] [&_svg]:m-[0_auto_12px] [&_svg]:text-[#a9c4e7] [&_strong]:block [&_strong]:text-[14px] [&_strong]:text-[#526d94] [&_p]:mt-[6px] [&_p]:text-[12px]">
                    <Flame size={32} />
                    <strong>Chưa có lịch khởi hành phù hợp</strong>
                    <p>
                      Thử đổi bộ lọc hoặc thêm lịch khởi hành để thiết lập ưu
                      đãi.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              items
                .slice((current - 1) * size, current * size)
                .map((schedule) => {
                  const deal = schedule.flash_deals;
                  const status = getFlashDealStatus(schedule, now);
                  const seats = getFlashDealSeats(schedule);
                  return (
                    <tr key={schedule.tour_schedule_id}>
                      <td>
                        <div className="ui-flash-deal-management-tour flex items-center gap-[14px] min-w-[285px] max-w-[410px] [&>div]:min-w-0 [&_strong]:block [&_strong]:overflow-hidden [&_strong]:text-ellipsis [&_strong]:text-[#10234c] [&_strong]:text-[13px] [&_strong]:font-[750] admin-max-650:min-w-[260px]">
                          <ImageWithFallback
                            src={
                              schedule.cover_image_url ||
                              schedule.tours?.tour_images?.[0]?.image_url ||
                              undefined
                            }
                            alt={schedule.tours?.name || "Ảnh tour"}
                            className="ui-flash-deal-management-thumbnail w-[92px] h-[66px] shrink-0 rounded-[10px] object-cover [background:#eaf3ff] admin-max-650:w-[76px] admin-max-650:h-[58px]"
                          />
                          <div>
                            <span className="ui-flash-deal-management-code inline-block mb-[5px] max-w-[240px] overflow-hidden text-ellipsis [border:1px_solid_#d9e8ff] rounded-[5px] p-[2px_7px] [background:#edf5ff] text-[#136bff] text-[9px] font-[750] tracking-[.35px]! [vertical-align:middle]">
                              {schedule.tours?.code ||
                                `LỊCH ${schedule.tour_schedule_id}`}
                            </span>
                            <strong title={schedule.tours?.name || undefined}>
                              {schedule.tours?.name || "Tour chưa có tên"}
                            </strong>
                            <span className="ui-flash-deal-management-departure flex items-center gap-[6px] mt-[7px] text-[#8195b7] text-[11px]">
                              <CalendarDays size={13} />
                              Khởi hành:{" "}
                              {new Date(schedule.start_date).toLocaleDateString(
                                "vi-VN",
                                { timeZone: "Asia/Bangkok" },
                              )}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="ui-flash-deal-management-seats text-[#172c55] text-[13px] font-[750] [font-variant-numeric:tabular-nums] [&[data-full=true]]:text-[#d68715]"
                          data-full={seats === 0}
                        >
                          {seats} / {schedule.quota}
                        </span>
                      </td>
                      <td>
                        <span
                          className="ui-flash-deal-management-original text-[#8a9cba] text-[12px] italic [&[data-discount=true]]:line-through"
                          data-discount={!!deal}
                        >
                          {formatVND(schedule.price)}
                        </span>
                      </td>
                      <td>
                        {deal ? (
                          <span className="ui-flash-deal-management-discount inline-flex items-center gap-[6px] rounded-[20px] [background:#fff0e9] p-[7px_10px] text-[#ff642c] text-[11px] font-[750]">
                            <Zap size={13} fill="currentColor" />
                            {deal.discount_type === "percentage"
                              ? `-${Number(deal.discount_value)}%`
                              : `-${formatVND(deal.discount_value)}`}
                          </span>
                        ) : (
                          <span className="ui-flash-deal-management-dash text-[#b0bed2]">
                            —
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="ui-flash-deal-management-price text-[#0763ff] text-[15px] font-extrabold [font-variant-numeric:tabular-nums] admin-max-650:text-[14px]">
                          {deal
                            ? formatVND(
                                previewFlashDealPrice(
                                  Number(schedule.price),
                                  deal.discount_type,
                                  Number(deal.discount_value),
                                ),
                              )
                            : "—"}
                        </span>
                      </td>
                      <td>
                        <span
                          className="ui-flash-deal-management-status inline-flex items-center gap-[6px] rounded-[20px] p-[7px_10px] [background:#eef2f7] text-[#7890af] text-[10px] font-[650] [&:before]:[content:''] [&:before]:w-[5px] [&:before]:h-[5px] [&:before]:rounded-[50%] [&:before]:[background:currentColor] [&[data-status=active]]:[background:#e6f9f1] [&[data-status=active]]:text-[#009b70] [&[data-status=scheduled]]:[background:#edf3ff] [&[data-status=scheduled]]:text-[#507ad0] [&[data-status=paused]]:[background:#fff5e5] [&[data-status=paused]]:text-[#c58a22] [&[data-status=soldout]]:[background:#fff5e5] [&[data-status=soldout]]:text-[#c58a22]"
                          data-status={status.key}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td>
                        <div className="ui-flash-deal-management-actions flex justify-center">
                          <AdminRowActions
                            label={`Thao tác với ${schedule.tours?.name || "lịch khởi hành"}`}
                            disabled={busy}
                            actions={
                              deal
                                ? [
                                    {
                                      label: "Sửa deal",
                                      icon: <Pencil size={16} />,
                                      onClick: () => onEdit(schedule),
                                    },
                                    {
                                      label: "Xóa deal",
                                      icon: <Trash2 size={16} />,
                                      danger: true,
                                      onClick: () => onDelete(schedule),
                                    },
                                  ]
                                : [
                                    {
                                      label: "Tạo deal",
                                      icon: <Plus size={16} />,
                                      onClick: () => onEdit(schedule),
                                    },
                                  ]
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
      {!loading && (
        <AdminPagination
          variant="numbered"
          showSinglePage
          currentPage={current}
          totalPages={pages}
          totalItems={items.length}
          pageSize={size}
          itemLabel="lịch khởi hành"
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
}
