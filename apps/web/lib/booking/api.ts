import { publicFetch } from "@/lib/http/publicFetch";
import { requestWithToken } from "@/lib/http/requestWithToken";
import { getToken } from "@/lib/auth/session";
import type { BookingExtraService, BookingPayload, PaymentStatusResponse, PaymentUrlResponse, PublicTourDetail, VoucherValidationApiResponse } from "shared";

export function getBookingExtraServices() {
  return publicFetch<BookingExtraService[]>("/public/booking-services", { cache: "no-store" });
}

export function getBookingTourDetail(tourId: string | number) {
  return publicFetch<PublicTourDetail>(`/tours/public/${tourId}`);
}

export function validatePublicVoucher(code: string, amount: number, customerId?: number) {
  const query = new URLSearchParams({
    code,
    amount: String(amount),
  });

  if (getToken()) return requestWithToken<VoucherValidationApiResponse>(
    customerId ? `/admin/membership/customers/${customerId}/vouchers/validate?${query.toString()}` : `/membership/vouchers/validate?${query.toString()}`,
  );
  return publicFetch<VoucherValidationApiResponse>(
    `/public/vouchers/validate?${query.toString()}`,
  );
}

export function getStaffBookingCustomer(id: number) {
  return requestWithToken<{full_name: string; phone: string | null; email: string}>(`/bookings/admin/customer/${id}`);
}

export function checkBookingConflicts(payload: {
  tour_schedule_id: number;
  travelers: Array<{ fullName: string; idNumber?: string }>;
}) {
  return requestWithToken<{
    hasConflict: boolean;
    conflicts: Array<{
      travelerName: string;
      idNumber: string;
      tourName: string;
      startDate: string;
      endDate: string;
      bookingId: number;
    }>;
  }>("/bookings/check-conflicts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
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

export function createPaymentUrl(bookingId: number) {
  return requestWithToken<PaymentUrlResponse>("/payment/create-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bookingId }),
  });
}

export function getPaymentStatus(reference: string, signal?: AbortSignal) {
  return requestWithToken<PaymentStatusResponse>(`/payment/status?${new URLSearchParams({ reference })}`, { signal, cache: 'no-store' });
}

export function getBookingDetail(id: number, signal?: AbortSignal) {
  return requestWithToken<import("shared").BookingDetail | null>(`/bookings/${id}`, { signal });
}
