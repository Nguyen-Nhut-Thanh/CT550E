"use client";

import { CalendarDays, CreditCard, MapPin, Users } from "lucide-react";
import { ImageWithFallback } from "@/components/common/dialogs_and_feedback/media/ImageWithFallback";
import { formatVND } from "@/lib/utils/currency";
import type { AdminBooking } from "shared";

export interface BookingTourSummaryCardProps {
  booking: AdminBooking;
  totalAmount?: number;
  isPaid?: boolean;
  className?: string;
}

export function BookingTourSummaryCard({
  booking,
  totalAmount: propTotalAmount,
  isPaid: propIsPaid,
  className = "",
}: BookingTourSummaryCardProps) {
  const schedule = booking.tour_schedules;
  const tour = schedule?.tours;
  const tourName = tour?.name || "Tour du lịch";
  const tourCode =
    tour?.code ||
    schedule?.code ||
    (tour?.tour_id ? `TOUR-${tour.tour_id}` : `BK-${booking.booking_id}`);
  const tourImage = tour?.tour_images?.[0]?.image_url || "";

  const startDateStr = schedule?.start_date
    ? new Date(schedule.start_date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;
  const endDateStr = schedule?.end_date
    ? new Date(schedule.end_date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;
  const durationText =
    tour?.duration_days && tour?.duration_nights
      ? `${tour.duration_days}N${tour.duration_nights}Đ`
      : tour?.duration_days
        ? `${tour.duration_days} ngày`
        : null;

  const departureLocation =
    booking.departure_name ||
    schedule?.departure_location?.name ||
    tour?.departure_locations?.name ||
    "Điểm đón tiêu chuẩn";

  const totalGuests =
    (booking.adult_count || 0) +
    (booking.child_count || 0) +
    (booking.infant_count || 0);

  const guestBreakdown = [
    booking.adult_count ? `${booking.adult_count} người lớn` : null,
    booking.child_count ? `${booking.child_count} trẻ em` : null,
    booking.infant_count ? `${booking.infant_count} em bé` : null,
  ]
    .filter(Boolean)
    .join(", ");

  const totalAmount =
    propTotalAmount !== undefined
      ? propTotalAmount
      : Number(booking.total_amount) || 0;

  const isPaid =
    propIsPaid !== undefined
      ? propIsPaid
      : booking.status === "paid" ||
        booking.status === "cancel_requested";

  return (
    <div
      className={`rounded-[14px] border border-[#e1edfc] bg-white p-4 shadow-2xs space-y-3.5 ${className}`}
    >
      <div className="flex gap-3.5 items-start">
        <div className="relative h-20 w-24 sm:w-28 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <ImageWithFallback
            src={tourImage}
            alt={tourName}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] font-extrabold text-[#075bff] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/80">
              #{booking.booking_id}
            </span>
            <span className="font-mono text-[11px] font-bold text-[#7387aa]">
              {tourCode}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                isPaid
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {isPaid ? "Đã thanh toán" : "Chờ thanh toán"}
            </span>
          </div>
          <h4 className="text-sm font-bold text-[#0b1747] line-clamp-2 leading-snug">
            {tourName}
          </h4>
          {durationText ? (
            <p className="text-xs text-[#7387aa] font-medium">
              Thời lượng:{" "}
              <strong className="text-slate-700">{durationText}</strong>
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2.5 border-t border-[#edf2fb] text-xs text-slate-600">
        {startDateStr ? (
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-[#075bff] shrink-0" />
            <span className="truncate">
              Khởi hành:{" "}
              <strong className="text-[#0b1747]">{startDateStr}</strong>
              {endDateStr ? ` - ${endDateStr}` : ""}
            </span>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-emerald-600 shrink-0" />
          <span className="truncate">
            Điểm đón:{" "}
            <strong className="text-[#0b1747]">{departureLocation}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Users size={14} className="text-indigo-600 shrink-0" />
          <span className="truncate">
            Số khách:{" "}
            <strong className="text-[#0b1747]">
              {totalGuests > 0
                ? `${totalGuests} khách (${guestBreakdown})`
                : "1 khách"}
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <CreditCard size={14} className="text-purple-600 shrink-0" />
          <span className="truncate">
            Tổng đơn:{" "}
            <strong className="text-[#075bff] font-extrabold">
              {formatVND(totalAmount)}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}

