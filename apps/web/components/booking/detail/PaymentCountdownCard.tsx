"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock, XCircle } from "lucide-react";
import { formatVND } from "@/lib/utils/currency";
import { BookingPaymentButton } from "@/components/booking/checkout/BookingPaymentButton";
import type { BookingDetail } from "shared";

const money = (value: number | string | null | undefined) => formatVND(Number(value) || 0);

export interface PaymentCountdownCardProps {
  booking: BookingDetail;
  payments: Array<{ status?: string }>;
}

export function PaymentCountdownCard({
  booking,
  payments,
}: PaymentCountdownCardProps) {
  const createdAt = booking.created_at
    ? new Date(booking.created_at).getTime()
    : Date.now();
  const expiresAt = createdAt + 15 * 60 * 1000;
  const isDeparted =
    booking.tour_schedules?.start_date &&
    new Date(booking.tour_schedules.start_date).getTime() <= Date.now();

  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)),
  );

  useEffect(() => {
    if (secondsLeft <= 0 || isDeparted) return;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, secondsLeft, isDeparted]);

  const hasReviewPayment = payments.some((item) => item.status === "review");

  if (hasReviewPayment) {
    return (
      <section
        aria-label="Thanh toán đơn đặt tour"
        className="space-y-3 rounded-2xl border border-blue-100 bg-white p-5 shadow-2xs"
      >
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Giao dịch đang được đối soát
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Vui lòng liên hệ hỗ trợ để kiểm tra giao dịch trước khi thanh toán thêm.
          </p>
        </div>
      </section>
    );
  }

  const isExpired = secondsLeft <= 0 || isDeparted;

  if (isExpired) {
    const tourId = (booking.tour_schedules?.tours as { tour_id?: number } | undefined)?.tour_id;
    return (
      <section
        aria-label="Đơn hết hạn thanh toán"
        className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 sm:p-5 shadow-2xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
              <XCircle size={22} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-rose-950">
                Đơn đặt tour đã hết hạn thanh toán (quá 15 phút)
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-rose-800">
                Thời hạn giữ chỗ 15 phút cho đơn hàng này đã kết thúc. Hệ thống đã tự động hủy đơn đặt tour này.
              </p>
            </div>
          </div>
          {tourId && (
            <div className="shrink-0 self-start sm:self-center">
              <Link
                href={`/tours/${tourId}`}
                className="inline-flex items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white transition shadow-xs whitespace-nowrap cursor-pointer"
              >
                Đặt lại tour này
              </Link>
            </div>
          )}
        </div>
      </section>
    );
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeFormatted = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  return (
    <section
      aria-label="Thanh toán đơn đặt tour"
      className="space-y-3.5 rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50/90 via-yellow-50/50 to-amber-50/90 p-5 shadow-2xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <Clock size={20} />
          </span>
          <div>
            <h2 className="text-sm font-bold text-amber-950">
              Đơn đang chờ thanh toán (Giữ chỗ 15 phút)
            </h2>
            <p className="text-[11px] text-amber-800">
              Vui lòng thanh toán trong vòng 15 phút để đảm bảo giữ chỗ của bạn.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 font-mono text-sm font-black text-rose-600 border border-amber-300 shadow-2xs">
          <span className="text-xs font-sans font-bold text-slate-500">Còn lại:</span>
          <span>{timeFormatted}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <p className="text-xs text-slate-700">
          Thanh toán <strong>{money(booking.total_amount)}</strong> qua VNPay để hoàn tất đặt tour.
        </p>
        <BookingPaymentButton bookingId={booking.booking_id} />
      </div>
    </section>
  );
}

