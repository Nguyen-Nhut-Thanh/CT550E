"use client";

import { formatVND } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dateTime";
import { ArrowRight, Briefcase, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { DashboardRecentBookingsProps } from 'shared';

export function DashboardRecentBookings({ bookings }: DashboardRecentBookingsProps) {
  const statusConfig: Record<
    string,
    { label: string; badge: string; dot: string }
  > = {
    confirmed: {
      label: "Đã xác nhận",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
    },
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
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${config.badge}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-blue-100/80 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col gap-2 p-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Briefcase size={18} />
            </div>
            <h2 className="text-base font-black tracking-tight text-slate-900">
              Đơn Đặt Tour Gần Đây
            </h2>
          </div>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Các giao dịch đặt tour mới nhất cần theo dõi hoặc xử lý.
          </p>
        </div>

        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 hover:text-blue-600 self-start sm:self-auto"
        >
          Xem tất cả đơn
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-black uppercase tracking-wider text-slate-400">
              <th className="px-3 py-3">Mã Đơn</th>
              <th className="px-3 py-3">Khách Hàng</th>
              <th className="px-3 py-3">Tour & Khởi Hành</th>
              <th className="px-3 py-3">Số Khách</th>
              <th className="px-3 py-3">Tổng Tiền</th>
              <th className="px-3 py-3">Trạng Thái</th>
              <th className="px-3 py-3 text-right">Chi Tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
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
                  <td className="px-3 py-3 font-mono font-bold text-blue-600">
                    {booking.id}
                  </td>

                  {/* Customer details */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
                        {firstLetter}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate max-w-[160px]">
                          {booking.customer}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[160px]">
                          {booking.customerPhone !== "N/A"
                            ? booking.customerPhone
                            : booking.customerEmail}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Tour title & departure */}
                  <td className="px-3 py-3">
                    <div className="min-w-0 max-w-[240px]">
                      <p className="font-bold text-slate-800 truncate" title={booking.tour}>
                        {booking.tour}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span className="rounded bg-slate-100 px-1 py-0.2 font-mono text-[10px] font-bold text-slate-600">
                          {booking.tourCode}
                        </span>
                        {booking.departureDate && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar size={11} />
                            {formatDate(booking.departureDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Pax count */}
                  <td className="px-3 py-3 font-semibold text-slate-600 whitespace-nowrap">
                    {booking.paxCount} khách
                  </td>

                  {/* Total amount */}
                  <td className="px-3 py-3 font-black text-slate-900 whitespace-nowrap">
                    {formatVND(booking.amount)}
                  </td>

                  {/* Status badge */}
                  <td className="px-3 py-3 whitespace-nowrap">
                    {getStatusBadge(booking.status)}
                  </td>

                  {/* Link action */}
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <Link
                      href={`/admin/bookings?search=${booking.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                      title="Xem chi tiết đơn"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </td>
                </tr>
              );
            })}

            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  <Briefcase className="mx-auto mb-2 h-8 w-8 text-slate-300" />
                  Chưa có đơn đặt tour nào phát sinh gần đây.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
