import type { BookingItemUI } from "shared";

const vietnamDate = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit",
});
function dayKey(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = vietnamDate.formatToParts(date);
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)?.value).join("-");
}

/** Trip progress uses calendar days in Vietnam, including the full last day. */
export function getBookingTripStatus(
  booking: { status?: string | null; tour_schedules?: { start_date?: string | null; end_date?: string | null } | null },
  now = new Date(),
): Pick<BookingItemUI, "status" | "statusText"> {
  const status = booking.status?.trim().toLowerCase() || "";
  if (["cancelled", "canceled", "đã hủy", "đã huỷ"].includes(status)) {
    return { status: "cancelled", statusText: "Đã hủy" };
  }
  if (status === "cancel_requested") return { status: "unknown", statusText: "Đang yêu cầu hủy" };
  if (["completed", "đã hoàn thành"].includes(status)) return { status: "completed", statusText: "Đã hoàn thành" };
  const today = dayKey(now.toISOString());
  const start = dayKey(booking.tour_schedules?.start_date);
  const end = dayKey(booking.tour_schedules?.end_date);
  if (!today || !start || (end && end < start)) return { status: "unknown", statusText: "Chưa xác định lịch trình" };
  if (today < start) return { status: "upcoming", statusText: "Sắp diễn ra" };
  if (end && today > end) return { status: "completed", statusText: "Đã hoàn thành" };
  if (end || today === start) return { status: "ongoing", statusText: "Đang diễn ra" };
  return { status: "unknown", statusText: "Chưa xác định ngày kết thúc" };
}
