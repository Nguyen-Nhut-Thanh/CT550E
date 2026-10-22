import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { formatDate, formatVND } from "@/lib/client/utils/utils";
import { BadgeCheck, Loader2, Luggage } from "lucide-react";
import type { BookingOrderSummaryProps } from 'shared';

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
    <aside className="relative lg:sticky lg:top-24 lg:self-start">
      <div>
        <div className="flex flex-col rounded-2xl border border-blue-100/60 bg-white p-4 shadow-[0_4px_24px_rgba(37,99,235,0.04)]">
          <div className="flex items-center justify-between gap-2"><h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Luggage className="h-5 w-5 text-blue-700" />Tóm tắt đơn hàng</h2><a href="#booking-passengers" className="text-xs font-semibold text-blue-600">Chỉnh sửa</a></div>
          <ImageWithFallback src={tour.tour_images?.[0]?.image_url || undefined} fallback="/images/account/cover-images.png" alt={tour.name} className="mt-3 h-20 w-full shrink-0 rounded-xl object-cover" />
          <p className="mt-2 text-sm font-bold text-slate-900">{tour.name}</p>
          <p className="mt-1 text-xs text-slate-500">{tour.duration_days} ngày {tour.duration_nights} đêm</p>
          <div className="mt-3 space-y-2.5 [&_span:first-child]:font-medium">
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-slate-500">Khởi hành</span>
              <span className="text-right text-sm font-semibold text-blue-700">
                {formatDate(selectedSchedule.start_date)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-slate-500">Số khách</span>
              <span className="text-right text-sm font-semibold text-slate-900">
                {totalGuests}
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Người lớn x {adultCount}</span>
                  <span className="font-semibold text-[#ef3b2d]">
                    {formatVND(pricing.adultUnitPrice * adultCount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Trẻ em x {childCount}</span>
                  <span className="font-semibold text-[#ef3b2d]">
                    {formatVND(pricing.childUnitPrice * childCount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Em bé x {infantCount}</span>
                  <span className="font-semibold text-[#ef3b2d]">
                    {formatVND(pricing.infantUnitPrice * infantCount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Phụ thu phòng đơn x {pricing.singleRoomCount}</span>
                  <span className="font-semibold text-[#ef3b2d]">
                    {formatVND(pricing.singleRoomSurcharge)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 border-t border-slate-100 pt-2.5 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Tạm tính</span>
                <span className="font-semibold text-[#ef3b2d]">
                  {formatVND(pricing.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600"><span>Dịch vụ bổ sung</span><span className="font-semibold text-[#ef3b2d]">{formatVND(pricing.servicesTotal)}</span></div>
              <div className="flex items-center justify-between text-emerald-600">
                <span>Giảm giá</span>
                <span className="font-semibold">
                  - {formatVND(pricing.discount)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex shrink-0 items-center justify-between gap-2 rounded-xl bg-blue-50 p-2.5 text-sm font-bold text-blue-900">
            <span>Tổng thanh toán</span><span className="text-lg text-blue-700">{formatVND(pricing.total)}</span>
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
