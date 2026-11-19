"use client";

import { Clock } from "lucide-react";
import { formatVND } from "@/lib/utils/currency";
import {
  DEFAULT_CANCELLATION_TIERS,
  type CancellationEstimate,
} from "shared";
import type { BookingCancelPolicyTheme } from "@/lib/booking/client/useBookingCancelPolicy";

export interface BookingCancelPolicySectionProps {
  estimate: CancellationEstimate;
  isPaid: boolean;
  totalAmount: number;
  theme: BookingCancelPolicyTheme;
  refundLabel?: string;
  className?: string;
}

export function BookingCancelPolicySection({
  estimate,
  isPaid,
  totalAmount,
  theme,
  refundLabel = "Số tiền thực nhận",
  className = "",
}: BookingCancelPolicySectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Thẻ đếm ngược thời gian & 3 ô phân tích chi phí */}
      <div
        className={`rounded-[14px] border ${theme.cardBorder} ${theme.cardBg} p-4.5 shadow-2xs space-y-3.5`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className={`flex items-center gap-1.5 font-bold ${theme.timeColor}`}>
            <Clock size={16} className={theme.clockColor} />
            {estimate.daysRemaining > 0
              ? `Còn ${estimate.daysRemaining} ngày trước giờ khởi hành`
              : "Tour khởi hành trong vòng 24h hoặc đã qua ngày"}
          </span>
          <span className={`rounded-full px-3 py-1 font-extrabold ${theme.penaltyPill}`}>
            {theme.penaltyPillText}
          </span>
        </div>

        {/* Bảng phân tích chi phí 3 ô */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
          {/* Ô 1: Đã thanh toán / Giá trị đơn */}
          <div className="rounded-lg bg-white/95 p-3 border border-slate-200/80 shadow-2xs">
            <span className="block text-[11px] text-slate-500 font-medium truncate">
              {isPaid ? "Đã thanh toán" : "Giá trị đơn"}
            </span>
            <span className="block text-xs sm:text-sm font-extrabold text-slate-800 mt-0.5">
              {formatVND(isPaid ? estimate.paidAmount : totalAmount)}
            </span>
          </div>

          {/* Ô 2: Phí hủy */}
          <div
            className={`rounded-lg p-3 border shadow-2xs ${
              isPaid && estimate.penaltyAmount > 0
                ? "bg-rose-50/90 border-rose-200 text-rose-700"
                : "bg-white/95 border-slate-200/80 text-slate-700"
            }`}
          >
            <span className="block text-[11px] font-medium truncate">
              {isPaid
                ? `Phí hủy (${estimate.tier.penaltyPercent}%)`
                : "Phí hủy (0%)"}
            </span>
            <span
              className={`block text-xs sm:text-sm font-extrabold mt-0.5 ${
                isPaid && estimate.penaltyAmount > 0
                  ? "text-rose-600"
                  : "text-slate-800"
              }`}
            >
              {isPaid && estimate.penaltyAmount > 0
                ? `-${formatVND(estimate.penaltyAmount)}`
                : "0 đ"}
            </span>
          </div>

          {/* Ô 3: Số tiền thực nhận / Hoàn theo quy định / Cần thanh toán */}
          <div className="rounded-lg bg-emerald-50/95 p-3 border border-emerald-300 shadow-2xs text-emerald-800">
            <span className="block text-[11px] font-bold truncate">
              {isPaid ? refundLabel : "Cần thanh toán"}
            </span>
            <span className="block text-xs sm:text-sm font-black text-emerald-600 mt-0.5">
              {formatVND(isPaid ? estimate.refundAmount : 0)}
            </span>
          </div>
        </div>

        {/* Diễn giải lưu ý / chính sách áp dụng */}
        <p className={`text-[11px] leading-relaxed p-2.5 rounded-lg border ${theme.ruleBg}`}>
          <strong>Lưu ý:</strong>{" "}
          {isPaid
            ? `${estimate.tier.description}.`
            : "Đơn hàng chưa thanh toán nên có thể hủy bất cứ lúc nào mà không mất bất kỳ khoản phí nào."}
        </p>
      </div>

      {/* BẢNG QUY ĐỊNH HOÀN HỦY TOUR (Dô loại nào thì active loại đó) */}
      <div className="rounded-[14px] border border-[#e1edfc] bg-slate-50/60 p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Bảng quy định hoàn hủy tour
          </span>
          {!isPaid && (
            <span className="text-[10px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
              Chưa thanh toán: Miễn phí hủy
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
          {DEFAULT_CANCELLATION_TIERS.map((tier) => {
            const isCurrent = tier.id === estimate.tier.id;
            return (
              <div
                key={tier.id}
                className={`rounded-lg p-2 border transition ${
                  isCurrent
                    ? theme.activeTierClass
                    : "bg-white border-slate-200 text-slate-600 opacity-75"
                }`}
              >
                <span className="block font-semibold">
                  {tier.minDaysBefore >= 15
                    ? "≥ 15 ngày"
                    : tier.minDaysBefore === 7
                    ? "7 - 14 ngày"
                    : tier.minDaysBefore === 4
                    ? "4 - 6 ngày"
                    : tier.minDaysBefore === 1
                    ? "1 - 3 ngày"
                    : "< 24 giờ"}
                </span>
                <span
                  className={`block font-black mt-0.5 ${
                    tier.penaltyPercent === 0
                      ? "text-emerald-600"
                      : tier.penaltyPercent === 100
                      ? "text-rose-600"
                      : "text-amber-700"
                  }`}
                >
                  Phạt {tier.penaltyPercent}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

