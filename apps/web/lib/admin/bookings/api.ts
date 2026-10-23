import { requestWithToken } from "@/lib/http/requestWithToken";

export function getAdminBookingList<T>(page: number, limit = 10) {
  return requestWithToken<T>(
    `/bookings/admin/list?page=${page}&limit=${limit}`,
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
