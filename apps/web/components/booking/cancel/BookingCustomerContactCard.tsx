"use client";

import { Mail, Phone, User } from "lucide-react";
import type { AdminBooking } from "shared";

export interface BookingCustomerContactCardProps {
  booking: AdminBooking;
  className?: string;
}

export function BookingCustomerContactCard({
  booking,
  className = "",
}: BookingCustomerContactCardProps) {
  const customerName =
    booking.contact_name || booking.users?.full_name || "Khách hàng";
  const customerPhone = booking.contact_phone || booking.users?.phone || "—";
  const customerEmail =
    booking.contact_email || booking.users?.accounts?.email;

  return (
    <div
      className={`space-y-2 text-xs text-slate-600 bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs ${className}`}
    >
      <div className="flex items-center gap-2">
        <User size={13.5} className="text-slate-400 shrink-0" />
        <span className="text-slate-500 shrink-0 font-medium">Khách đặt:</span>
        <strong className="text-slate-900 font-bold">{customerName}</strong>
      </div>
      <div className="flex items-center gap-2">
        <Phone size={13.5} className="text-slate-400 shrink-0" />
        <span className="text-slate-500 shrink-0 font-medium">Số điện thoại:</span>
        <strong className="text-slate-900 font-mono font-bold">
          {customerPhone}
        </strong>
      </div>
      {customerEmail ? (
        <div className="flex items-center gap-2">
          <Mail size={13.5} className="text-slate-400 shrink-0" />
          <span className="text-slate-500 shrink-0 font-medium">Email:</span>
          <span className="text-slate-800 font-mono text-[11.5px] font-semibold">
            {customerEmail}
          </span>
        </div>
      ) : null}
    </div>
  );
}

