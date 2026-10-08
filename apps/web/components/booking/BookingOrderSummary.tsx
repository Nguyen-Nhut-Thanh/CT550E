import { BadgeCheck, Loader2 } from "lucide-react";
import { formatDate, formatVND } from "@/lib/client/utils/utils";
import type { PublicTourDetail, TourSchedule } from "shared";

interface PricingSummary {
  adultUnitPrice: number;
  childUnitPrice: number;
  infantUnitPrice: number;
  singleRoomUnitPrice: number;
  singleRoomCount: number;
  singleRoomSurcharge: number;
  subtotal: number;
  discount: number;
  total: number;
}

interface BookingOrderSummaryProps {
  tour: PublicTourDetail;
  selectedSchedule: TourSchedule;
  adultCount: number;
  childCount: number;
  infantCount: number;
  totalGuests: number;
  pricing: PricingSummary;
  submitting: boolean;
  onSubmitBooking: () => void;
}

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
    <aside className="relative lg:block">
      <div className="sticky top-6 space-y-5 lg:top-24">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Tóm tắt đơn hàng
          </h2>
          <div className="mt-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-slate-500">Tour</span>
              <span
                title={tour.name}
                className="max-w-[190px] text-right text-sm font-semibold text-slate-900 line-clamp-2 break-words"
              >
                {tour.name}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-slate-500">Khởi hành</span>
              <span className="text-right text-sm font-semibold text-sky-700">
                {formatDate(selectedSchedule.start_date)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-sm text-slate-500">Số khách</span>
              <span className="text-right text-sm font-semibold text-slate-900">
                {totalGuests}
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="space-y-2 text-sm">
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
                  <span>Phụ thu phòng đơn</span>
                  <span className="font-semibold text-[#ef3b2d]">
                    {formatVND(pricing.singleRoomSurcharge)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Tạm tính</span>
                <span className="font-semibold text-[#ef3b2d]">
                  {formatVND(pricing.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Phụ thu phòng đơn</span>
                <span className="font-semibold text-[#ef3b2d]">
                  {formatVND(pricing.singleRoomSurcharge)}
                </span>
              </div>
              <div className="flex items-center justify-between text-emerald-600">
                <span>Giảm giá</span>
                <span className="font-semibold">
                  - {formatVND(pricing.discount)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 text-base font-bold text-slate-900">
                <span>Tổng thanh toán</span>
                <span className="text-[#ef3b2d]">
                  {formatVND(pricing.total)}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onSubmitBooking}
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-4 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-70"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BadgeCheck className="h-4 w-4" />
            )}
            Xác nhận thông tin booking
          </button>
        </div>
      </div>
    </aside>
  );
}
