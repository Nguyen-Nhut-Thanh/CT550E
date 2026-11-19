"use client";

import { formatVND } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dateTime";
import { ArrowRight, Briefcase, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { DashboardRecentBookingsProps } from "shared";
import { useState } from "react";
import { BookingDetailModal } from "@/components/booking/manage_booking/AdminBookingDetailModal";

export function DashboardRecentBookings({
  bookings,
  onShowStatus,
}: DashboardRecentBookingsProps & { onShowStatus?: () => void }) {
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
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
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
    },
    cancel_requested: {
      label: "Yêu cầu hủy",
      badge: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
    },
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status.toLowerCase()] || {
      label: status,
      badge: "bg-slate-50 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg border px-1.5 py-0.5 text-[11px] font-[650] ${config.badge}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-w-0 rounded-[14px] border border-[#e1edfc] bg-white overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 pb-3 border-b border-[#edf2fb] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-5.5 w-5.5 shrink-0 items-center justify-center text-[#075bff]">
              <Briefcase size={22} />
            </div>
            <h2 className="text-[16px] font-[750] leading-[1.5] text-[#0b1747]">
              Đơn Đặt Tour Gần Đây
            </h2>
          </div>
          <p className="mt-[3px] text-[12px] leading-[1.5] text-[#7387aa]">
            Các giao dịch đặt tour mới nhất cần theo dõi hoặc xử lý.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
        {onShowStatus && <button type="button" onClick={onShowStatus} className="inline-flex min-h-9 items-center rounded-lg border border-[#d3e4ff] bg-white px-3 py-2 text-[12px] font-[650] text-[#075bff] hover:bg-[#f1f7ff]">Trạng Thái Đơn Hàng</button>}
        <Link
          href="/admin/bookings"
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#d3e4ff] bg-white px-3 py-2 text-[12px] font-[650] text-[#075bff] transition-colors duration-180 hover:bg-[#f1f7ff] motion-reduce:transition-none"
        >
          Xem tất cả đơn
          <ArrowRight size={14} />
        </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#edf2fb] bg-slate-50/75 text-[12px] font-[650] text-[#7387aa]">
              <th className="px-4 py-3">Mã Đơn</th>
              <th className="px-4 py-3">Khách Hàng</th>
              <th className="px-4 py-3">Tour & Khởi Hành</th>
              <th className="px-4 py-3">Số Khách</th>
              <th className="px-4 py-3">Tổng Tiền</th>
              <th className="px-4 py-3">Trạng Thái</th>
              <th className="px-4 py-3 text-right">Chi Tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf2fb] text-[13px]">
            {bookings.map((booking) => {
              const firstLetter = booking.customer
                ? booking.customer.charAt(0).toUpperCase()
                : "K";

              return (
                <tr
                  key={booking.id}
                  className="transition-colors hover:bg-slate-50/60"
                >
                  {/* Booking ID */}
                  <td className="px-4 py-3 font-[650] text-[#075bff]">
                    {booking.id}
                  </td>

                  {/* Customer details */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {firstLetter}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[#0b1747] truncate max-w-[160px]">
                          {booking.customer}
                        </p>
                        <p className="text-[12px] text-[#7387aa] truncate max-w-[160px]">
                          {booking.customerPhone !== "N/A"
                            ? booking.customerPhone
                            : booking.customerEmail}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Tour title & departure */}
                  <td className="px-4 py-3">
                    <div className="min-w-0 max-w-[240px]">
                      <p
                        className="font-bold text-[#0b1747] truncate"
                        title={booking.tour}
                      >
                        {booking.tour}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[#7387aa]">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-600">
                          {booking.tourCode}
                        </span>
                        {booking.departureDate && (
                          <span className="flex items-center gap-1 text-[#7387aa]">
                            <Calendar size={11} />
                            {formatDate(booking.departureDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Pax count */}
                  <td className="px-4 py-3 font-semibold text-slate-600 whitespace-nowrap">
                    {booking.paxCount} khách
                  </td>

                  {/* Total amount */}
                  <td className="px-4 py-3 font-bold text-[#0b1747] whitespace-nowrap">
                    {formatVND(booking.amount)}
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {getStatusBadge(booking.status)}
                  </td>

                  {/* Link action */}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedBookingId(booking.bookingId)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#eff7ff] text-[#075bff] transition-colors duration-180 hover:bg-[#e2efff] motion-reduce:transition-none"
                      title="Xem chi tiết đơn"
                      aria-label={`Xem chi tiết booking ${booking.id}`}
                    >
                      <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}

            {bookings.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="h-60 p-6 text-center text-[#7387aa]"
                >
                  <Briefcase className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  Chưa có đơn đặt tour nào phát sinh gần đây.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <BookingDetailModal
        bookingId={selectedBookingId}
        open={selectedBookingId !== null}
        onClose={() => setSelectedBookingId(null)}
      />
    </div>
  );
}
