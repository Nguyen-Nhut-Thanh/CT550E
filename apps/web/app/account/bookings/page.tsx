"use client";

import { AccountContent } from "@/components/account/AccountContent";

import { useAccountResource } from "@/components/account/useAccountResource";
import { AlertCircle, Loader2 } from "lucide-react";
import { getMyBookings } from "@/lib/client/api/authApi";
import { AccountBookingsTab } from "@/components/account";
import type { AccountBooking } from "shared";

export default function BookingsHistoryAccountPage() {
  const { data: bookings = [], loading, error } = useAccountResource("bookings", getMyBookings);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#f6f8fb]">
        <div className="rounded-2xl border border-slate-100 bg-white px-10 py-12 text-center shadow-sm">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-slate-600">Đang tải lịch sử đặt tour...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#f6f8fb] px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto mb-4 h-14 w-14 text-rose-500" />
          <h2 className="mb-2 text-xl font-bold text-slate-900">Đã có lỗi xảy ra</h2>
          <p className="mb-6 text-sm text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>

      <AccountContent>
        <AccountBookingsTab bookings={bookings} />
      </AccountContent>
    </div>
  );
}
