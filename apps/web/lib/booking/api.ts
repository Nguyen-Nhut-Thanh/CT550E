import { publicFetch } from "@/lib/http/publicFetch";
import { requestWithToken } from "@/lib/http/requestWithToken";
import type { BookingExtraService, BookingPayload, PublicTourDetail, VoucherValidationApiResponse } from "shared";

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

export function getStaffBookingCustomer(id: number) {
  return requestWithToken<{full_name: string; phone: string | null; email: string}>(`/bookings/admin/customer/${id}`);
}

export function createBooking(payload: BookingPayload, customerId?: number) {
  return requestWithToken<{ booking_id?: number; id?: number }>(customerId ? `/bookings/admin/customer/${customerId}` : "/bookings", {
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
