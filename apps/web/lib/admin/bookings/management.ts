import type { AdminBooking, AdminBookingFilters, AdminBookingStats } from "shared";

export const BOOKING_STATUSES = [
  { value: "all", label: "Tất cả trạng thái" }, { value: "pending", label: "Chờ thanh toán" },
  { value: "paid", label: "Đã thanh toán" }, { value: "confirmed", label: "Đã xác nhận" }, { value: "cancel_requested", label: "Yêu cầu hủy" },
  { value: "cancelled", label: "Đã hủy" }, { value: "completed", label: "Hoàn thành" },
];
export const DEFAULT_BOOKING_FILTERS: Required<AdminBookingFilters> = { search: "", status: "all", tourId: "all", scheduleId: "all", dateFrom: "", dateTo: "", dateField: "created" };
export const EMPTY_BOOKING_STATS: AdminBookingStats = { total: 0, paid: 0, pending: 0, cancelled: 0, cancelRequested: 0 };
export function parseBookingStats(value: unknown): AdminBookingStats | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  for (const key of Object.keys(EMPTY_BOOKING_STATS)) {
    if (typeof record[key] !== "number" || !Number.isSafeInteger(record[key]) || (record[key] as number) < 0) return null;
  }
  return value as AdminBookingStats;
}
export function getBookingStatusLabel(status: string) { return BOOKING_STATUSES.find(option => option.value === status)?.label ?? status; }
export function getBookingGuestCount(booking: AdminBooking) { return (booking.adult_count ?? 0) + (booking.child_count ?? 0) + (booking.infant_count ?? 0); }
export function formatBookingDate(value?: string | null, time = false) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "—";
  return time ? date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
export function buildBookingsCsv(items: AdminBooking[]) {
  const rows = [["Mã booking", "Khách hàng", "SĐT", "Mã tour", "Ngày đi", "Số người", "Tổng tiền", "Trạng thái", "Ngày đặt"], ...items.map(item => [item.booking_id, item.contact_name ?? "", item.contact_phone ?? "", item.tour_schedules?.tours?.code ?? "", formatBookingDate(item.tour_schedules?.start_date), getBookingGuestCount(item), item.total_amount ?? 0, getBookingStatusLabel(item.status), formatBookingDate(item.created_at)])];
  return "\uFEFF" + rows.map(row => row.map(cell => `"${String(cell).replace(/^[\s]*[=+@-]/, "'$&").replaceAll('"', '""')}"`).join(",")).join("\r\n");
}
