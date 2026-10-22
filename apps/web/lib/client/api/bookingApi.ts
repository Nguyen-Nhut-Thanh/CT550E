import { publicFetch } from "@/lib/client/api/publicFetch";
import { requestWithToken } from "@/lib/requestWithToken";
import type { BookingExtraService, BookingPayload, PublicTourDetail, VoucherValidationApiResponse } from "shared";
export type { BookingPayload };

export function getBookingExtraServices() {
  return publicFetch<BookingExtraService[]>("/public/booking-services", { cache: "no-store" });
}

export function getBookingTourDetail(tourId: string | number) {
  return publicFetch<PublicTourDetail>(`/tours/public/${tourId}`);
}

export function validatePublicVoucher(code: string, amount: number) {
  const query = new URLSearchParams({
    code,
    amount: String(amount),
  });

  return publicFetch<VoucherValidationApiResponse>(
    `/public/vouchers/validate?${query.toString()}`,
  );
}

export function createBooking(payload: BookingPayload) {
  return requestWithToken<{ booking_id?: number; id?: number }>("/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export function createPaymentUrl(bookingId: number, amount: number) {
  return requestWithToken<{ paymentUrl?: string }>("/payment/create-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bookingId, amount }),
  });
}

export function getMyBookingDetail<T>(bookingId: string | number) {
  return requestWithToken<T>(`/bookings/${bookingId}`);
}

export function requestBookingCancel<T>(bookingId: number, reason?: string) {
  return requestWithToken<T>(`/bookings/${bookingId}/cancel-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      reason: reason?.trim() || undefined,
    }),
  });
}
