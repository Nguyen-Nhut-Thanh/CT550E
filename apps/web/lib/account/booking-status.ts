import { getVietnamDateString } from "@/lib/utils/dateTime";
import { BOOKING_PENDING_EXPIRY_MS, getCancelledBookingLabel, type BookingItemUI } from "shared";

/** Trip progress uses calendar days in Vietnam, including the full last day. */
export function getBookingTripStatus(
  booking: {
    status?: string | null;
    created_at?: string | Date | null;
    tour_schedules?: { start_date?: string | null; end_date?: string | null } | null;
    note?: string | null;
  },
  now = new Date(),
): Pick<BookingItemUI, "status" | "statusText"> {
  const status = booking.status?.trim().toLowerCase() || "";

  // 1. Đơn đã hủy: Phân loại rõ theo nguyên nhân và đối tượng hủy
  if (["cancelled", "canceled", "đã hủy", "đã huỷ"].includes(status)) {
    return { status: "cancelled", statusText: getCancelledBookingLabel(booking) };
  }

  // 2. Đơn đang yêu cầu hủy
  if (status === "cancel_requested") {
    return { status: "unknown", statusText: "Đang yêu cầu hủy" };
  }

  // 3. Đơn CHỜ THANH TOÁN (pending): Áp dụng giới hạn 15 phút hoặc thời điểm khởi hành
  if (status === "pending") {
    const createdAt = booking.created_at ? new Date(booking.created_at) : null;
    const startDate = booking.tour_schedules?.start_date
      ? new Date(booking.tour_schedules.start_date)
      : null;
    const isDeparted = Boolean(startDate && startDate.getTime() <= now.getTime());

    if (isDeparted) {
      return {
        status: "cancelled",
        statusText: "Đã hủy (Quá giờ đi)",
      };
    }

    if (createdAt && !Number.isNaN(createdAt.getTime())) {
      let expiryTime = createdAt.getTime() + BOOKING_PENDING_EXPIRY_MS;
      if (startDate && startDate.getTime() < expiryTime) {
        expiryTime = startDate.getTime();
      }

      const diffLeftMs = expiryTime - now.getTime();
      if (diffLeftMs <= 0) {
        return {
          status: "cancelled",
          statusText: startDate && now.getTime() >= startDate.getTime()
            ? "Đã hủy (Quá giờ đi)"
            : "Đã hủy (Hết hạn 15p)",
        };
      }

      const minsLeft = Math.max(1, Math.ceil(diffLeftMs / 60000));
      return {
        status: "upcoming",
        statusText: `Chờ thanh toán (còn ${minsLeft}p)`,
      };
    }

    return { status: "upcoming", statusText: "Chờ thanh toán" };
  }

  // 4. Đơn đã hoàn thành
  if (["completed", "đã hoàn thành"].includes(status)) {
    return { status: "completed", statusText: "Đã hoàn thành" };
  }

  // 5. Đơn ĐÃ THANH TOÁN / ĐÃ XÁC NHẬN: Tính tiến trình theo ngày thực tế
  const today = getVietnamDateString(now);
  const start = getVietnamDateString(booking.tour_schedules?.start_date);
  const end = getVietnamDateString(booking.tour_schedules?.end_date);
  if (!today || !start || (end && end < start)) return { status: "unknown", statusText: "Chưa xác định lịch trình" };
  if (today < start) return { status: "upcoming", statusText: "Sắp diễn ra" };
  if (end && today > end) return { status: "completed", statusText: "Đã hoàn thành" };
  if (end || today === start) return { status: "ongoing", statusText: "Đang diễn ra" };
  return { status: "unknown", statusText: "Chưa xác định ngày kết thúc" };
}

export function getBookingPaymentStatus(booking: {
  status?: string | null;
  payments?: { status?: string | null }[] | null;
}): Pick<BookingItemUI, "paymentStatus" | "paymentStatusText"> {
  const status = booking.status?.trim().toLowerCase() || "";
  const payments = booking.payments || [];
  const hasSuccessfulPayment = payments.some((p) =>
    ["success", "paid", "completed"].includes(p.status?.toLowerCase() || "")
  );
  const isRefunded = payments.some((p) =>
    ["refunded", "đã hoàn tiền"].includes(p.status?.toLowerCase() || "")
  );

  if (isRefunded) {
    return { paymentStatus: "refunded", paymentStatusText: "Đã hoàn tiền" };
  }

  if (hasSuccessfulPayment || ["paid", "completed"].includes(status)) {
    return { paymentStatus: "paid", paymentStatusText: "Đã thanh toán" };
  }

  return { paymentStatus: "unpaid", paymentStatusText: "Chưa thanh toán" };
}
