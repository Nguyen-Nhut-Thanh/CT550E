"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Users } from "lucide-react";
import { ImageWithFallback } from "@/components/common/dialogs_and_feedback/media/ImageWithFallback";
import { AdminPagination } from "@/components/common/admin_shared/tables/AdminPagination";
import {
  buildBookingsCsv,
  formatBookingDate,
  getBookingGuestCount,
  getBookingStatusLabel,
} from "@/lib/booking/admin/management";
import { formatVND } from "@/lib/utils/currency";
import type { AdminBooking } from "shared";
import { BookingRowActions, type BookingActionType } from "@/components/booking/manage_booking/AdminBookingRowActions";

const statusConfig: Record<
  string,
  { label: string; badge: string; dot: string }
> = {
  paid: {
    label: "Đã thanh toán",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
  completed: {
    label: "Hoàn tất",
    badge: "bg-teal-50 text-teal-700 border-teal-200",
    dot: "bg-teal-500",
  },
  pending: {
    label: "Chờ thanh toán",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  cancelled: {
    label: "Đã hủy",
    badge: "bg-slate-50 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
  cancel_requested: {
    label: "Yêu cầu hủy",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
  },
};

export function BookingManagementTable({
  items,
  total,
  page,
  totalPages,
  loading,
  busy,
  onPage,
  onAction,
}: {
  items: AdminBooking[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
  busy: boolean;
  onPage: (page: number) => void;
  onAction: (item: AdminBooking, type: BookingActionType) => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const all =
    items.length > 0 &&
    items.every((item) => selected.includes(item.booking_id));
  const checkbox = useRef<HTMLInputElement>(null);
  useEffect(() => setSelected([]), [items]);
  useEffect(() => {
    if (checkbox.current)
      checkbox.current.indeterminate = !all && selected.length > 0;
  }, [all, selected]);
  const exportCsv = () => {
    const rows = selected.length
      ? items.filter((item) => selected.includes(item.booking_id))
      : items;
    const url = URL.createObjectURL(
      new Blob([buildBookingsCsv(rows)], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "booking.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const getStatusBadge = (status: string, note?: string | null) => {
    const normalized = String(status).toLowerCase();
    const config = statusConfig[normalized] || {
      label: getBookingStatusLabel(status, note),
      badge: "bg-slate-50 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
    };
    const label = getBookingStatusLabel(status, note) || config.label;

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-[650] ${config.badge}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        {label}
      </span>
    );
  };

  return (
    <section
      className="ui-booking-management-tableCard rounded-[14px] border border-[#e1edfc] bg-white shadow-2xs overflow-hidden min-w-0"
      aria-label="Danh sách booking"
      aria-busy={loading}
    >
      <div className="ui-booking-management-tableHead flex flex-wrap items-center justify-between gap-3 px-4 pt-4 pb-3 border-b border-[#edf2fb]">
        <h2 className="text-[16px] font-[750] leading-[1.5] text-[#0b1747]">
          Danh sách booking{" "}
          <span className="text-[14px] font-semibold text-[#7387aa]">
            ({total.toLocaleString("vi-VN")})
          </span>
        </h2>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <span className="ui-booking-management-selected text-[11px] font-semibold text-[#6380ac]">
              Đã chọn {selected.length}
            </span>
          )}
          <button
            type="button"
            onClick={exportCsv}
            disabled={loading || !items.length}
            className="ui-booking-management-export inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#d3e4ff] bg-white px-3 py-2 text-[12px] font-[650] text-[#075bff] transition-colors hover:bg-[#f1f7ff] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={15} />
            {selected.length ? "Xuất mục đã chọn" : "Xuất trang này"}
          </button>
        </div>
      </div>

      <div className="ui-booking-management-tableScroll overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap text-[13px]">
          <thead>
            <tr className="border-b border-[#edf2fb] bg-slate-50/75 text-[12px] font-[650] text-[#7387aa]">
              <th className="px-3 py-2.5 w-[36px]">
                <input
                  ref={checkbox}
                  type="checkbox"
                  aria-label="Chọn tất cả booking trong trang"
                  disabled={loading || !items.length}
                  checked={all}
                  onChange={() =>
                    setSelected(all ? [] : items.map((item) => item.booking_id))
                  }
                  className="rounded border-slate-300 text-[#075bff] focus:ring-blue-500"
                />
              </th>
              {[
                "Mã",
                "Khách hàng",
                "Tour",
                "Ngày đi / Đặt",
                "Số người",
                "Tổng tiền",
                "Trạng thái",
                "Thao tác",
              ].map((label) => (
                <th key={label} scope="col" className="px-3 py-2.5">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf2fb] text-[13px]">
            {loading
              ? Array.from({ length: 6 }, (_, index) => (
                  <tr key={index} aria-hidden="true">
                    {Array.from({ length: 9 }, (_, col) => (
                      <td key={col} className="px-3 py-2.5">
                        <span className="block h-9 min-w-[30px] rounded-lg bg-slate-100 animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : items.map((item) => (
                  <tr
                    key={item.booking_id}
                    data-selected={selected.includes(item.booking_id)}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        aria-label={`Chọn booking ${item.booking_id}`}
                        checked={selected.includes(item.booking_id)}
                        onChange={(event) =>
                          setSelected(
                            event.target.checked
                              ? [...selected, item.booking_id]
                              : selected.filter((id) => id !== item.booking_id),
                          )
                        }
                        className="rounded border-slate-300 text-[#075bff] focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        className="ui-booking-management-bookingCode font-[650] text-[#075bff] text-[13px] hover:underline cursor-pointer"
                        disabled={busy}
                        onClick={() => onAction(item, "detail")}
                      >
                        #BK{String(item.booking_id).padStart(5, "0")}
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      <strong className="ui-booking-management-customer block max-w-[170px] truncate text-[13px] font-bold text-[#0b1747]">
                        {item.contact_name || "—"}
                      </strong>
                      {item.membership_snapshot?.priorityReservation && (
                        <span className="mt-0.5 inline-block rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200/80">
                          Ưu tiên giữ chỗ · {item.membership_snapshot.name}
                        </span>
                      )}
                      <span className="ui-booking-management-subtext block text-[11px] text-[#7387aa] mt-0.5 max-w-[170px] truncate">
                        {item.contact_phone || item.contact_email || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="ui-booking-management-tour flex items-center gap-2.5 min-w-[200px] max-w-[260px]">
                        <ImageWithFallback
                          src={
                            item.tour_schedules?.tours?.tour_images?.[0]
                              ?.image_url
                          }
                          alt=""
                          className="h-10 w-14 rounded-lg object-cover bg-blue-50 shrink-0"
                        />
                        <div className="min-w-0">
                          <strong
                            className="block truncate text-[13px] font-bold text-[#0b1747]"
                            title={
                              item.tour_schedules?.tours?.name ?? undefined
                            }
                          >
                            {item.tour_schedules?.tours?.name || "—"}
                          </strong>
                          <span className="block text-[11px] text-[#7387aa] mt-0.5">
                            {item.tour_schedules?.tours?.code || "—"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="text-[12.5px] font-bold text-[#0b1747]">
                        Đi: {formatBookingDate(item.tour_schedules?.start_date)}
                      </div>
                      <div className="text-[11px] text-[#7387aa] mt-0.5">
                        Đặt: {formatBookingDate(item.created_at)} · {formatBookingDate(item.created_at, true)}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="ui-booking-management-guests inline-flex items-center gap-1.5 text-slate-700 font-medium">
                        <Users size={14} className="text-[#7387aa]" />
                        {getBookingGuestCount(item)}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 ui-booking-management-amount font-bold text-[#0b1747]">
                      {formatVND(item.total_amount ?? 0)}
                    </td>
                    <td className="px-3 py-2.5">
                      {getStatusBadge(item.status, item.note)}
                    </td>
                    <td className="px-3 py-2.5">
                      <BookingRowActions
                        booking={item}
                        disabled={busy}
                        onAction={onAction}
                      />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {!loading && !items.length && (
        <div className="ui-booking-management-empty text-center py-12 px-4 text-[#7387aa] text-[13px]">
          <strong className="block text-[#0b1747] font-bold mb-1">
            Không tìm thấy booking phù hợp
          </strong>
          <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
        </div>
      )}
      {!loading && (
        <AdminPagination
          variant="numbered"
          showSinglePage
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={10}
          itemLabel="booking"
          onPageChange={onPage}
        />
      )}
    </section>
  );
}
