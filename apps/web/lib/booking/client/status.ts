import { getVietnamDateString } from "@/lib/utils/dateTime";
import {
  BOOKING_PENDING_EXPIRY_MS,
  getCancelledBookingReason,
  type BookingItemUI,
} from "shared";

/** Trip progress uses calendar days in Vietnam, including the full last day. */
export function getBookingTripStatus(
  booking: {
    status?: string | null;
    created_at?: string | Date | null;
    tour_schedules?: { start_date?: string | null; end_date?: string | null } | null;
    note?: string | null;
    cancellation_meta?: any;
  },
  now = new Date(),
): Pick<BookingItemUI, "status" | "statusText" | "statusReason" | "isCancelUnapproved"> {
  const status = booking.status?.trim().toLowerCase() || "";

  // 1. Đơn đã hủy: Giữ chữ "Đã hủy" gọn gàng không vỡ layout, lý do hiển thị qua Tooltip
  if (["cancelled", "canceled", "đã hủy", "đã huỷ"].includes(status)) {
    const reason = getCancelledBookingReason(booking);
    return {
      status: "cancelled",
      statusText: "Đã hủy",
      statusReason: reason || "Đơn đặt tour đã bị hủy",
    };
  }

  // 1.1. Đơn đang chờ chuyển tiền hoàn (sau khi khách đồng ý nhận hoàn tiền sự cố)
  if (status === "refund_pending") {
    return {
      status: "cancelled",
      statusText: "Chờ hoàn tiền",
      statusReason: "Đang chờ bộ phận kế toán thực hiện chuyển tiền hoàn về tài khoản của bạn",
    };
  }

  // 1.2. Đơn có đề xuất giải quyết hủy/đổi lịch từ Ban quản trị
  if (status === "cancel_proposed") {
    return {
      status: "unknown",
      statusText: "Đề xuất hủy/đổi lịch",
      statusReason: "Ban quản trị đã gửi phương án hủy/đổi lịch. Vui lòng bấm Xem chi tiết để chọn phương án.",
    };
  }

  // 2. Đơn CHỜ THANH TOÁN (pending): Áp dụng giới hạn 15 phút hoặc thời điểm khởi hành
  if (status === "pending") {
    const createdAt = booking.created_at ? new Date(booking.created_at) : null;
    const startDate = booking.tour_schedules?.start_date
      ? new Date(booking.tour_schedules.start_date)
      : null;
    const isDeparted = Boolean(startDate && startDate.getTime() <= now.getTime());

    if (isDeparted) {
      return {
        status: "cancelled",
        statusText: "Đã hủy",
        statusReason: "Chưa thanh toán trước giờ khởi hành",
      };
    }

    if (createdAt && !Number.isNaN(createdAt.getTime())) {
      let expiryTime = createdAt.getTime() + BOOKING_PENDING_EXPIRY_MS;
      if (startDate && startDate.getTime() < expiryTime) {
        expiryTime = startDate.getTime();
      }

      const diffLeftMs = expiryTime - now.getTime();
      if (diffLeftMs <= 0) {
        const isPastDeparture = Boolean(startDate && now.getTime() >= startDate.getTime());
        return {
          status: "cancelled",
          statusText: "Đã hủy",
          statusReason: isPastDeparture
            ? "Chưa thanh toán trước giờ khởi hành"
            : "Hết hạn thanh toán 15 phút",
        };
      }

      const minsLeft = Math.max(1, Math.ceil(diffLeftMs / 60000));
      return {
        status: "upcoming",
        statusText: "Chờ thanh toán",
        statusReason: `Đơn giữ chỗ còn lại ${minsLeft} phút để thanh toán`,
      };
    }

    return { status: "upcoming", statusText: "Chờ thanh toán" };
  }

  // 3. Đơn đang yêu cầu hủy
  if (status === "cancel_requested") {
    const today = getVietnamDateString(now);
    const start = getVietnamDateString(booking.tour_schedules?.start_date);
    const end = getVietnamDateString(booking.tour_schedules?.end_date);

    // Nếu đã tới hoặc qua ngày khởi hành mà yêu cầu hủy chưa được duyệt:
    // Chuyển sang tiến trình thực tế, nhưng gắn cờ isCancelUnapproved (đổi màu vàng) và tooltip lý do
    if (today && start && today >= start) {
      const isCompleted = Boolean(end && today > end);
      return {
        status: isCompleted ? "completed" : "ongoing",
        statusText: isCompleted ? "Đã hoàn thành" : "Đang diễn ra",
        isCancelUnapproved: true,
        statusReason: "Yêu cầu hủy không được duyệt (chuyến đi đã khởi hành theo lịch trình)",
      };
    }

    // Nếu chưa tới ngày khởi hành: vẫn đang chờ admin duyệt hủy
    return {
      status: "unknown",
      statusText: "Đang yêu cầu hủy",
      statusReason: "Yêu cầu hủy của bạn đang được ban quản trị xem xét giải quyết",
    };
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
