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
