import { requestWithToken } from "@/lib/http/requestWithToken";
import type { AdminBookingFilters } from "shared";

export function getAdminBookingList<T>(page: number, limit = 10, filters: AdminBookingFilters = {}) {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  for (const [key, value] of Object.entries(filters)) if (value && value !== "all") query.set(key, value);
  return requestWithToken<T>(
    `/bookings/admin/list?${query}`,
  );
}

export function getAdminBookingDetail<T>(bookingId: number) {
  return requestWithToken<T>(`/bookings/admin/${bookingId}`);
}

export function runAdminBookingAction<T>(
  bookingId: number,
  action: "approve-cancel" | "reject-cancel",
  payload: Record<string, unknown>,
) {
  return requestWithToken<T>(`/bookings/admin/${bookingId}/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function cancelPendingBooking<T = unknown>(bookingId: number, reason?: string) {
  return requestWithToken<T>(`/bookings/admin/${bookingId}/cancel-pending`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });
}

export interface AdminCancelBookingPayload {
  reason?: string;
  refundAmount?: number;
  note?: string;
  cancelType?: "operator_fault" | "customer_request";
  resolutionOption?: "full_refund" | "reschedule";
  newScheduleId?: number;
}

export function adminCancelBooking<T = unknown>(
  bookingId: number,
  payload: AdminCancelBookingPayload,
) {
  return requestWithToken<T>(`/bookings/admin/${bookingId}/cancel-booking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}
