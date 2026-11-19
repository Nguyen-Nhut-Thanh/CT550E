import { ImageWithFallback } from "@/components/common/dialogs_and_feedback/media/ImageWithFallback";
import { formatVND } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dateTime";
import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  Coins,
  Gift,
  Loader2,
  Sparkles,
  Tag,
  Ticket,
  UsersRound,
} from "lucide-react";
import type { BookingOrderSummaryProps } from "shared";

export function BookingOrderSummary({
  tour,
  selectedSchedule,
  adultCount,
  childCount,
  infantCount,
  totalGuests,
  pricing,
  submitting,
  onSubmitBooking,
}: BookingOrderSummaryProps) {
  return (
    <aside className="relative lg:sticky lg:top-20 lg:self-start">
      <div>
        <div className="flex flex-col rounded-2xl border border-blue-100/60 bg-white p-4 shadow-[0_4px_24px_rgba(37,99,235,0.04)]">
          <ImageWithFallback
            src={tour.tour_images?.[0]?.image_url || undefined}
            fallback="/images/shared/travel-cover.png"
            alt={tour.name}
            className="h-24 w-full shrink-0 rounded-xl object-cover"
          />
          <p className="mt-2 text-sm font-bold text-slate-900">{tour.name}</p>
          <div className="mt-3 grid grid-cols-3 divide-x divide-blue-100 rounded-xl bg-blue-50/70 px-2 py-2.5">
            <div className="flex min-w-0 items-center gap-1.5 pr-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="truncate text-[11px] font-semibold text-slate-800">
                {formatDate(selectedSchedule.start_date)}
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-1.5 px-2">
              <Clock3 className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="truncate text-[11px] font-semibold text-slate-800">
                {tour.duration_days} ngày {tour.duration_nights} đêm
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-1.5 pl-2">
              <UsersRound className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="truncate text-[11px] font-semibold text-blue-700">
                {totalGuests} khách
              </span>
            </div>
          </div>
          <div className="mt-3.5 space-y-3">
            {/* Passenger Breakdown Card */}
            <div className="rounded-2xl bg-[#f4f7fe] p-3.5">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 shrink-0 fill-blue-600 text-blue-600" />
                    <span className="text-slate-800">Người lớn x {adultCount}</span>
                  </div>
                  <span
                    className={
                      pricing.adultUnitPrice * adultCount > 0
                        ? "font-bold text-blue-700"
                        : "font-semibold text-slate-800"
                    }
                  >
                    {formatVND(pricing.adultUnitPrice * adultCount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="pl-6 text-slate-800">Trẻ em x {childCount}</span>
                  <span
                    className={
                      pricing.childUnitPrice * childCount > 0
                        ? "font-bold text-blue-700"
                        : "font-semibold text-slate-800"
                    }
                  >
                    {formatVND(pricing.childUnitPrice * childCount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="pl-6 text-slate-800">Em bé x {infantCount}</span>
                  <span
                    className={
                      pricing.infantUnitPrice * infantCount > 0
                        ? "font-bold text-blue-700"
                        : "font-semibold text-slate-800"
                    }
                  >
                    {formatVND(pricing.infantUnitPrice * infantCount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="pl-6 text-slate-800">
                    Phụ thu phòng đơn x {pricing.singleRoomCount}
                  </span>
                  <span
                    className={
                      pricing.singleRoomSurcharge > 0
                        ? "font-bold text-blue-700"
                        : "font-semibold text-slate-800"
                    }
                  >
                    {formatVND(pricing.singleRoomSurcharge)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Summary List */}
            <div className="space-y-2.5 px-0.5 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <Coins className="h-4 w-4 shrink-0 text-blue-600" />
                  <span>Tạm tính</span>
                </div>
                <span className="font-bold text-blue-700">
                  {formatVND(pricing.subtotal)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <Tag className="h-4 w-4 shrink-0 fill-blue-600 text-blue-600" />
                  <span>Dịch vụ bổ sung</span>
                </div>
                <span
                  className={
                    pricing.servicesTotal > 0
                      ? "font-bold text-blue-700"
                      : "font-semibold text-slate-800"
                  }
                >
                  {formatVND(pricing.servicesTotal)}
                </span>
              </div>

              {!!(pricing.voucherDiscount ?? pricing.discount) && (
                <div className="flex items-center justify-between text-emerald-600">
                  <div className="flex items-center gap-2 font-medium">
                    <Ticket className="h-4 w-4 shrink-0 fill-emerald-600 text-emerald-600" />
                    <span>Voucher</span>
                  </div>
                  <span className="font-bold">
                    – {formatVND(pricing.voucherDiscount ?? pricing.discount)}
                  </span>
                </div>
              )}

              {!!pricing.tourDiscount && (
                <div className="flex items-center justify-between text-emerald-600">
                  <div className="flex items-center gap-2 font-medium">
                    <Gift className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Ưu đãi hạng {pricing.membershipName || "thành viên"}</span>
                  </div>
                  <span className="font-bold">
                    – {formatVND(pricing.tourDiscount)}
                  </span>
                </div>
              )}

              {!!pricing.serviceDiscount && (
                <div className="flex items-center justify-between text-emerald-600">
                  <div className="flex items-center gap-2 font-medium">
                    <Sparkles className="h-4 w-4 shrink-0 text-emerald-600" />
                    <span>Ưu đãi dịch vụ</span>
                  </div>
                  <span className="font-bold">
                    – {formatVND(pricing.serviceDiscount)}
                  </span>
                </div>
              )}

              {!!pricing.tourDiscount && (
                <p className="text-[10px] leading-4 text-slate-400 pl-6">
                  Giảm theo hạng trên tiền tour sau khi trừ voucher.
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 flex shrink-0 items-center justify-between gap-2 rounded-xl bg-blue-50 p-2.5 text-sm font-bold text-blue-900">
            <span>Tổng thanh toán</span>
            <span className="text-lg text-blue-700">
              {formatVND(pricing.total)}
            </span>
          </div>
          <button
            type="button"
            onClick={onSubmitBooking}
            disabled={submitting}
            className="mt-3 flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BadgeCheck className="h-4 w-4" />
            )}
            Xác nhận đặt tour
          </button>
        </div>
      </div>
    </aside>
  );
}
