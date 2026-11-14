import { useMemo } from "react";
import {
  calculateCancellationEstimate,
  DEFAULT_CANCELLATION_TIERS,
  type CancellationEstimate,
} from "shared";
import { parseViDateTime } from "@/lib/utils/dateTime";
import type { CancelRequestDetails } from "./BookingCancelRequestCard";

export interface BookingCancelPolicyTheme {
  badgeText: string;
  badgeClass: string;
  headerBg: string;
  headerIconBg: string;
  cardBorder: string;
  cardBg: string;
  timeColor: string;
  clockColor: string;
  penaltyPill: string;
  penaltyPillText: string;
  ruleBg: string;
  activeTierClass: string;
  submitBtnClass: string;
  submitText: string;
}

export interface UseBookingCancelPolicyOptions {
  referenceDate?: Date | null;
  cancelDetails?: CancelRequestDetails | null;
}

export interface UseBookingCancelPolicyReturn {
  isPaid: boolean;
  startDate: Date;
  totalAmount: number;
  estimate: CancellationEstimate;
  theme: BookingCancelPolicyTheme;
}

export function useBookingCancelPolicy(
  booking: any,
  options?: UseBookingCancelPolicyOptions,
): UseBookingCancelPolicyReturn {
  // Xác định trạng thái thanh toán
  const isPaid = useMemo(() => {
    if (!booking) return false;
    const status = String(booking.status || "").toLowerCase();
    const paymentStatus = String(booking.paymentStatus || "").toLowerCase();
    return (
      ["paid", "confirmed", "completed"].includes(status) ||
      paymentStatus === "paid" ||
      (Array.isArray(booking.payments) &&
        booking.payments.some((p: any) =>
          ["completed", "paid", "success"].includes(String(p.status).toLowerCase())
        ))
    );
  }, [booking]);

  // Xác định ngày khởi hành
  const startDate = useMemo(() => {
    if (!booking) return new Date();
    const raw =
      booking.tour_schedules?.start_date ||
      booking.start_date ||
      booking.startDate;
    return raw ? new Date(raw) : new Date();
  }, [booking]);

  // Tổng số tiền
  const totalAmount = useMemo(() => {
    if (!booking) return 0;
    return Number(booking.total_amount ?? booking.price ?? 0);
  }, [booking]);

  // Xác định mốc thời gian căn cứ tính chính sách
  // Nếu có thông tin yêu cầu hủy của khách, ưu tiên lấy thời điểm khách gửi đơn
  const effectiveRefDate = useMemo(() => {
    if (options?.referenceDate) return options.referenceDate;
    if (options?.cancelDetails?.requestedAt) {
      return parseViDateTime(options.cancelDetails.requestedAt);
    }
    return null;
  }, [options?.referenceDate, options?.cancelDetails?.requestedAt]);

  // Tính toán chính sách hủy
  const estimate = useMemo<CancellationEstimate>(() => {
    const baseEstimate = calculateCancellationEstimate({
      startDate,
      totalAmount,
      isPaid,
      now: effectiveRefDate || undefined,
    });

    const cancelDetails = options?.cancelDetails;
    if (!cancelDetails) {
      return baseEstimate;
    }

    // Khi đã có chi tiết yêu cầu hủy được chốt từ database (lúc khách gửi yêu cầu),
    // đối chiếu và đồng bộ tuyệt đối để tránh lệch múi giờ hay sai số làm tròn
    let matchedTier = baseEstimate.tier;
    if (cancelDetails.tierPenalty) {
      const percentMatch = cancelDetails.tierPenalty.match(/(\d+)%/);
      if (percentMatch) {
        const penaltyPercent = parseInt(percentMatch[1], 10);
        const foundTier = DEFAULT_CANCELLATION_TIERS.find(
          (t) => t.penaltyPercent === penaltyPercent
        );
        if (foundTier) matchedTier = foundTier;
      }
    }

    let penaltyAmount = baseEstimate.penaltyAmount;
    if (cancelDetails.penaltyAmount) {
      const digits = cancelDetails.penaltyAmount.replace(/[^\d]/g, "");
      if (digits) penaltyAmount = Number(digits);
    }

    let refundAmount = baseEstimate.refundAmount;
    if (
      cancelDetails.numericRefundAmount !== undefined &&
      !Number.isNaN(cancelDetails.numericRefundAmount)
    ) {
      refundAmount = cancelDetails.numericRefundAmount;
    } else if (cancelDetails.refundEstimated) {
      const digits = cancelDetails.refundEstimated.replace(/[^\d]/g, "");
      if (digits) refundAmount = Number(digits);
    }

    let daysRemaining = baseEstimate.daysRemaining;
    if (cancelDetails.daysRemaining) {
      const dayMatch = cancelDetails.daysRemaining.match(/(\d+)\s*ng[àa]y/i);
      if (dayMatch) {
        daysRemaining = parseInt(dayMatch[1], 10);
      }
    }

    return {
      ...baseEstimate,
      daysRemaining,
      tier: matchedTier,
      penaltyAmount,
      refundAmount,
    };
  }, [startDate, totalAmount, isPaid, effectiveRefDate, options?.cancelDetails]);

  // Giao diện / Tone màu sắc tương ứng
  const theme = useMemo<BookingCancelPolicyTheme>(() => {
    if (!isPaid) {
      return {
        badgeText: "YÊU CẦU HỦY ĐƠN ĐẶT TOUR",
        badgeClass: "bg-white/95 text-sky-800 border-sky-300",
        headerBg:
          "border-sky-200 bg-[linear-gradient(135deg,#f0f7ff_0%,#e8f3ff_60%,#dcecff_100%)]",
        headerIconBg: "bg-sky-600",
        cardBorder: "border-sky-300",
        cardBg: "bg-gradient-to-br from-sky-50/80 via-blue-50/40 to-sky-50/80",
        timeColor: "text-sky-950",
        clockColor: "text-sky-600",
        penaltyPill: "bg-white/90 border border-sky-300 text-sky-900",
        penaltyPillText: "Mức phạt: 0% · Miễn phí hủy",
        ruleBg: "bg-white/80 border border-sky-200 text-sky-900",
        activeTierClass:
          "bg-sky-100 border-2 border-sky-500 font-bold text-sky-950 ring-1 ring-sky-400 shadow-sm",
        submitBtnClass: "bg-sky-600 hover:bg-sky-700 shadow-sky-600/30",
        submitText: "Gửi yêu cầu hủy đơn",
      };
    }

    if (estimate.tier.penaltyPercent === 0) {
      return {
        badgeText: "YÊU CẦU HỦY TOUR & HOÀN TIỀN",
        badgeClass: "bg-white/95 text-emerald-800 border-emerald-300",
        headerBg:
          "border-emerald-200 bg-[linear-gradient(135deg,#f0fdf4_0%,#ecfdf5_60%,#d1fae5_100%)]",
        headerIconBg: "bg-emerald-600",
        cardBorder: "border-emerald-300",
        cardBg: "bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-emerald-50/80",
        timeColor: "text-emerald-950",
        clockColor: "text-emerald-600",
        penaltyPill: "bg-white/90 border border-emerald-300 text-emerald-900",
        penaltyPillText: "Mức phạt: 0% · Hoàn: 100%",
        ruleBg: "bg-white/80 border border-emerald-200 text-emerald-900",
        activeTierClass:
          "bg-emerald-100 border-2 border-emerald-500 font-bold text-emerald-950 ring-1 ring-emerald-400 shadow-sm",
        submitBtnClass: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30",
        submitText: "Gửi yêu cầu hủy & hoàn tiền",
      };
    }

    if (estimate.tier.penaltyPercent <= 50) {
      return {
        badgeText: "YÊU CẦU HỦY TOUR & HOÀN TIỀN",
        badgeClass: "bg-white/95 text-amber-900 border-amber-300",
        headerBg:
          "border-amber-200 bg-[linear-gradient(135deg,#fffbf0_0%,#fff7e6_60%,#ffeed0_100%)]",
        headerIconBg: "bg-amber-500",
        cardBorder: "border-amber-300",
        cardBg: "bg-gradient-to-br from-amber-50/80 via-yellow-50/40 to-amber-50/80",
        timeColor: "text-amber-950",
        clockColor: "text-amber-600",
        penaltyPill: "bg-white/90 border border-amber-300 text-amber-900",
        penaltyPillText: `Mức phạt: ${estimate.tier.penaltyPercent}% · Hoàn: ${estimate.tier.refundPercent}%`,
        ruleBg: "bg-white/80 border border-amber-200 text-amber-900",
        activeTierClass:
          "bg-amber-100 border-2 border-amber-400 font-bold text-amber-950 ring-1 ring-amber-400 shadow-sm",
        submitBtnClass: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30",
        submitText: "Gửi yêu cầu hủy & hoàn tiền",
      };
    }

    // Mức phạt 80% - 100%
    return {
      badgeText: "YÊU CẦU HỦY TOUR & HOÀN TIỀN",
      badgeClass: "bg-white/95 text-amber-900 border-amber-300",
      headerBg:
        "border-amber-200 bg-[linear-gradient(135deg,#fffbf0_0%,#fff7e6_60%,#ffeed0_100%)]",
      headerIconBg: "bg-[#ea580c]",
      cardBorder: "border-amber-300",
      cardBg: "bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-amber-50/80",
      timeColor: "text-amber-950",
      clockColor: "text-amber-600",
      penaltyPill: "bg-white/90 border border-amber-300 text-amber-900",
      penaltyPillText: `Mức phạt: ${estimate.tier.penaltyPercent}% · Hoàn: ${estimate.tier.refundPercent}%`,
      ruleBg: "bg-white/80 border border-amber-200 text-amber-900",
      activeTierClass:
        "bg-amber-100 border-2 border-amber-400 font-bold text-amber-950 ring-1 ring-amber-400 shadow-sm",
      submitBtnClass: "bg-[#ea580c] hover:bg-[#c2410c] shadow-orange-600/30",
      submitText: "Gửi yêu cầu hủy & hoàn tiền",
    };
  }, [isPaid, estimate]);

  return {
    isPaid,
    startDate,
    totalAmount,
    estimate,
    theme,
  };
}

