"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Users } from "lucide-react";
import { ImageWithFallback } from "@/components/common/media/ImageWithFallback";
import { AdminPagination } from "@/components/admin/common/AdminPagination";
import {
  buildBookingsCsv,
  formatBookingDate,
  getBookingGuestCount,
  getBookingStatusLabel,
} from "@/lib/admin/bookings/management";
import { formatVND } from "@/lib/utils/currency";
import type { AdminBooking } from "shared";
import { BookingRowActions } from "./BookingRowActions";

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
  onAction: (item: AdminBooking, type: "detail" | "approve" | "reject") => void;
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
  return (
    <section
      className="ui-booking-management-tableCard [border:1px_solid_#e1eaf7] rounded-[16px] [background:white] overflow-hidden min-w-0"
      aria-label="Danh sách booking"
      aria-busy={loading}
    >
      <div className="ui-booking-management-tableHead flex items-center justify-between gap-[15px] p-[16px_18px] [&_h2]:text-[16px] [&_h2]:font-[750] [&_h2]:text-[#15264a] [&>div]:flex [&>div]:items-center [&>div]:gap-[12px] admin-max-750:flex-wrap admin-max-750:p-[14px] admin-max-750:[&_h2]:text-[14px] admin-max-750:[&>div]:ml-[auto]">
        <h2>
          Danh sách booking <span>({total.toLocaleString("vi-VN")})</span>
        </h2>
        <div>
          {selected.length > 0 && (
            <span className="ui-booking-management-selected text-[11px] text-[#6380ac]">
              Đã chọn {selected.length}
            </span>
          )}
          <button
            type="button"
            onClick={exportCsv}
            disabled={loading || !items.length}
            className="ui-booking-management-export flex items-center gap-[8px] [border:1px_solid_#e1e9f6] [background:white] rounded-[9px] p-[8px_11px] text-[12px] text-[#59759d] [&:hover:enabled]:[background:#f0f6ff] [&:hover:enabled]:text-[#075bff] [&:disabled]:opacity-[.4] [&:disabled]:cursor-not-allowed"
          >
            <Download size={16} />
            {selected.length ? "Xuất mục đã chọn" : "Xuất trang này"}
          </button>
        </div>
      </div>
      <div className="ui-booking-management-tableScroll overflow-x-auto [&_table]:border-collapse [&_table]:w-full [&_table]:text-left [&_table]:whitespace-nowrap [&_table]:text-[12px] [&_th]:[background:linear-gradient(#f9fbfe,_#f2f6fa)] [&_th]:p-[13px_14px] [&_th]:text-[10px] [&_th]:uppercase [&_th]:tracking-[.25px]! [&_th]:font-[650] [&_th]:text-[#7d91b0] [&_th]:[border-top:1px_solid_#e7eef8] [&_th]:[border-bottom:1px_solid_#e7eef8] [&_td]:p-[12px_14px] [&_td]:[border-bottom:1px_solid_#edf2f9] [&_td]:[vertical-align:middle] [&_td]:text-[#5b7398] [&_th:first-child]:pr-[0] [&_th:first-child]:pl-[18px] [&_th:first-child]:w-[34px] [&_td:first-child]:pr-[0] [&_td:first-child]:pl-[18px] [&_td:first-child]:w-[34px] [&_input]:w-[15px] [&_input]:h-[15px] [&_input]:[accent-color:#075bff] [&_input]:[vertical-align:middle] [&_tbody_tr:hover]:[background:#f8fbff] [&_tr[data-selected=true]]:[background:#f8fbff] [&_td.ui-booking-management-amount]:font-[750] [&_td.ui-booking-management-amount]:text-[#172747] admin-max-1250:[&_td]:pl-[12px] admin-max-1250:[&_td]:pr-[12px] admin-max-1250:[&_th]:pl-[12px] admin-max-1250:[&_th]:pr-[12px] min-[1400px]:[&_table]:text-[13px]">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  ref={checkbox}
                  type="checkbox"
                  aria-label="Chọn tất cả booking trong trang"
                  disabled={loading || !items.length}
                  checked={all}
                  onChange={() =>
                    setSelected(all ? [] : items.map((item) => item.booking_id))
                  }
                />
              </th>
              {[
                "Mã",
                "Khách hàng",
                "Tour",
                "Ngày đi",
                "Số người",
                "Tổng tiền",
                "Trạng thái",
                "Ngày đặt",
                "Thao tác",
              ].map((label) => (
                <th key={label} scope="col">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 6 }, (_, index) => (
                  <tr key={index} aria-hidden="true">
                    {Array.from({ length: 10 }, (_, col) => (
                      <td key={col}>
                        <span className="ui-booking-management-skeleton block h-[42px] min-w-[30px] rounded-[7px] [background:linear-gradient(90deg,_#f0f5fb,_#fafcff,_#f0f5fb)] [background-size:200%_100%] animate-admin-shimmer motion-reduce:animate-none" />
                      </td>
                    ))}
                  </tr>
                ))
              : items.map((item) => (
                  <tr
                    key={item.booking_id}
                    data-selected={selected.includes(item.booking_id)}
                  >
                    <td>
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
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="ui-booking-management-bookingCode text-[#075bff] font-[750] text-[12px] [&:hover]:underline min-[1400px]:text-[13px]"
                        disabled={busy}
                        onClick={() => onAction(item, "detail")}
                      >
                        #BK{String(item.booking_id).padStart(5, "0")}
                      </button>
                    </td>
                    <td>
                      <strong className="ui-booking-management-customer block max-w-[160px] overflow-hidden text-ellipsis text-[12px] font-[650] text-[#1c3153] min-[1400px]:text-[13px]">
                        {item.contact_name || "—"}
                      </strong>
                      <span className="ui-booking-management-subtext block text-[11px] text-[#93a4bd] mt-[4px] max-w-[170px] overflow-hidden text-ellipsis">
                        {item.contact_phone || item.contact_email || "—"}
                      </span>
                    </td>
                    <td>
                      <div className="ui-booking-management-tour flex items-center gap-[10px] min-w-[200px] max-w-[255px] [&_img]:w-[43px] [&_img]:h-[42px] [&_img]:object-cover [&_img]:rounded-[7px] [&_img]:shrink-0 [&_img]:[background:#edf4fc] [&>div]:min-w-0 [&_strong]:block [&_strong]:overflow-hidden [&_strong]:text-ellipsis [&_strong]:text-[12px] [&_strong]:font-semibold [&_strong]:text-[#243a5e] [&_span]:block [&_span]:text-[#92a5c0] [&_span]:text-[10px] [&_span]:mt-[4px] min-[1400px]:[&_strong]:text-[13px]">
                        <ImageWithFallback
                          src={
                            item.tour_schedules?.tours?.tour_images?.[0]
                              ?.image_url
                          }
                          alt=""
                        />
                        <div>
                          <strong
                            title={
                              item.tour_schedules?.tours?.name ?? undefined
                            }
                          >
                            {item.tour_schedules?.tours?.name || "—"}
                          </strong>
                          <span>{item.tour_schedules?.tours?.code || "—"}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {formatBookingDate(item.tour_schedules?.start_date)}
                    </td>
                    <td>
                      <span className="ui-booking-management-guests inline-flex items-center gap-[8px] text-[#5e7aa5] [&_svg]:text-[#8da3c1]">
                        <Users size={15} />
                        {getBookingGuestCount(item)}
                      </span>
                    </td>
                    <td className="ui-booking-management-amount">
                      {formatVND(item.total_amount ?? 0)}
                    </td>
                    <td>
                      <span
                        className="ui-booking-management-status inline-block p-[5px_8px] rounded-[20px] [border:1px_solid_#e1e8f2] [background:#f1f5f9] text-[#6a7f9e] text-[9px] font-[650] uppercase [&[data-status=pending]]:[background:#fff9e8] [&[data-status=pending]]:[border-color:#ffebbd] [&[data-status=pending]]:text-[#d8880e] [&[data-status=paid]]:[background:#eafbf3] [&[data-status=paid]]:[border-color:#c4efdf] [&[data-status=paid]]:text-[#0aa376] [&[data-status=completed]]:[background:#eff7ff] [&[data-status=completed]]:[border-color:#cee5ff] [&[data-status=completed]]:text-[#0867ee] [&[data-status='cancel\_requested']]:[background:#fff0f3] [&[data-status='cancel\_requested']]:[border-color:#ffd4df] [&[data-status='cancel\_requested']]:text-[#dc4868] [&[data-status=cancelled]]:[background:#f0f3f7] [&[data-status=cancelled]]:text-[#8b9ab0] min-[1400px]:text-[10px] [&[data-status=confirmed]]:[background:#f0f1ff] [&[data-status=confirmed]]:[border-color:#dce0ff] [&[data-status=confirmed]]:text-[#5868b2]"
                        data-status={item.status}
                      >
                        {getBookingStatusLabel(item.status)}
                      </span>
                    </td>
                    <td>
                      <span>{formatBookingDate(item.created_at)}</span>
                      <span className="ui-booking-management-subtext block text-[11px] text-[#93a4bd] mt-[4px] max-w-[170px] overflow-hidden text-ellipsis">
                        {formatBookingDate(item.created_at, true)}
                      </span>
                    </td>
                    <td>
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
        <div className="ui-booking-management-empty text-center p-[50px_20px] text-[#8297b5] text-[13px] [&_strong]:block [&_strong]:text-[#617b9e] [&_strong]:mb-[8px]">
          <strong>Không tìm thấy booking phù hợp</strong>
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
