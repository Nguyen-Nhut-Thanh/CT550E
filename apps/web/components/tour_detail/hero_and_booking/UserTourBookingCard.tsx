"use client";

import { openSupportChat } from "@/lib/chat/support";
import { formatVND } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dateTime";
import { buildTourBookingHref, resolvePickupPoint } from '@/lib/booking/client/departure';
import { getActiveSchedulePromotion } from "@/lib/booking/client/pricing";
import { Calendar, Clock, CreditCard, Hash, MapPin, MessageCircle, RefreshCw, ShieldCheck, Users, } from "lucide-react";
import Link from "next/link";
import type { TourBookingCardProps } from 'shared';

export default function TourBookingCard({
  tour,
  selectedSchedule = null,
  selectedPickupPointId = null,
}: TourBookingCardProps) {

  const displayPrice = Number(selectedSchedule?.price ?? tour.base_price);
  const promoInfo = getActiveSchedulePromotion(selectedSchedule);
  const remainingSeats = selectedSchedule
    ? Math.max(
        Number(selectedSchedule.quota || 0) -
          Number(selectedSchedule.booked_count || 0),
        0,
      )
    : null;
  const isSoldOut = selectedSchedule ? remainingSeats === 0 : false;

  const bookingHref = selectedSchedule
    ? buildTourBookingHref(tour.tour_id, selectedSchedule, selectedPickupPointId)
    : null;
  const selectedPickup = resolvePickupPoint(selectedSchedule, selectedPickupPointId);

  const scrollToSchedules = () => {
    const element = document.getElementById("tour-schedules");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleChatConsult = () => {
    openSupportChat({ tour_id: tour.tour_id });
  };

  return (
    <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.10)] space-y-5">
      {/* Price Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {selectedSchedule ? "Giá chuyến đã chọn" : "Giá từ"}
        </span>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-3xl font-black text-[#ef3b2d] sm:text-4xl">
            {formatVND(displayPrice)}
          </span>
          <span className="text-sm font-semibold text-slate-500">/ khách</span>
        </div>

        {/* Hàng giá gốc bị gạch & tag ưu đãi/flash deal nằm cùng hàng */}
        {((selectedSchedule?.original_price && selectedSchedule.original_price > displayPrice) || promoInfo) && (
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            {selectedSchedule?.original_price && selectedSchedule.original_price > displayPrice && (
              <span className="text-sm font-semibold text-slate-400 line-through">
                {formatVND(selectedSchedule.original_price)}
              </span>
            )}
            {promoInfo && (
              <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 border border-amber-300 px-2 py-0.5 text-xs font-bold text-amber-900 shadow-2xs">
                <span>🎁</span>
                <span>{promoInfo.title}</span>
                <span className="rounded bg-amber-500 px-1.5 py-0.5 text-[10px] text-white font-extrabold">
                  {promoInfo.discountLabel}
                </span>
              </div>
            )}
          </div>
        )}

        {promoInfo?.giftDescription && (
          <div className="mt-1">
            <span className="text-[11px] font-semibold text-amber-800">
              ✨ Quà tặng: {promoInfo.giftDescription}
            </span>
          </div>
        )}
      </div>

      {/* State 1: Đã chọn ngày khởi hành */}
      {selectedSchedule ? (
        <div className="space-y-3 rounded-2xl bg-slate-50/80 p-4 text-xs sm:text-sm text-slate-700 border border-slate-100">
          {selectedPickup && <div className="flex items-start justify-between gap-3">
            <span className="flex shrink-0 items-center gap-2 text-slate-500"><MapPin className="h-4 w-4 text-sky-600" />Điểm đón:</span>
            <span className="text-right font-bold text-slate-900">{selectedPickup.name}</span>
          </div>}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <Hash className="h-4 w-4 text-sky-600" />
              <span>Mã chương trình:</span>
            </div>
            <span className="font-bold text-slate-900">#{selectedSchedule.tour_schedule_id}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="h-4 w-4 text-sky-600" />
              <span>Khởi hành:</span>
            </div>
            <span className="font-bold text-slate-900">
              {selectedSchedule.departure_location?.name || "Chưa cập nhật"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="h-4 w-4 text-sky-600" />
              <span>Ngày khởi hành:</span>
            </div>
            <span className="font-bold text-slate-900">
              {formatDate(selectedSchedule.start_date)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock className="h-4 w-4 text-sky-600" />
              <span>Thời gian:</span>
            </div>
            <span className="font-bold text-slate-900">
              {tour.duration_days} ngày {tour.duration_nights} đêm
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <Users className="h-4 w-4 text-sky-500" />
              <span>Số chỗ còn lại:</span>
            </div>
            {isSoldOut ? (
              <span className="font-extrabold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs">
                Đã hết chỗ (0 chỗ)
              </span>
            ) : (
              <span className="font-bold text-slate-900">{remainingSeats} chỗ</span>
            )}
          </div>
        </div>
      ) : (
        /* State 2: Chưa chọn ngày khởi hành */
        <button
          type="button"
          onClick={scrollToSchedules}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-sky-300 bg-sky-50/60 px-4 py-4 text-xs sm:text-sm font-bold text-sky-700 transition hover:border-sky-400 hover:bg-sky-100/70"
        >
          <Calendar className="h-4 w-4 text-sky-600" />
          <span>Chọn ngày khởi hành để xem chi tiết</span>
        </button>
      )}

      {/* Action Buttons */}
      <div className="space-y-2.5">
        {isSoldOut ? (
          <div className="rounded-2xl bg-rose-50 border border-rose-200/80 p-3 text-center">
            <p className="text-xs text-rose-700 font-semibold leading-relaxed">
              Chuyến khởi hành này hiện đã nhận đủ khách. Quý khách có thể theo dõi lại nếu có khách hủy hoặc liên hệ <strong>Chat tư vấn</strong> bên dưới.
            </p>
          </div>
        ) : bookingHref ? (
          <Link
            href={bookingHref}
            className="flex w-full items-center justify-center rounded-2xl bg-[#0b63b6] py-3.5 text-center text-sm sm:text-base font-extrabold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-[#09559c] active:scale-[0.98]"
          >
            Đặt tour
          </Link>
        ) : (
          <button
            type="button"
            onClick={scrollToSchedules}
            className="w-full rounded-2xl bg-[#0b63b6] py-3.5 text-center text-sm sm:text-base font-extrabold text-white shadow-lg shadow-sky-500/20 transition-all hover:bg-[#09559c] active:scale-[0.98]"
          >
            Chọn ngày khởi hành
          </button>
        )}

        <button
          type="button"
          onClick={handleChatConsult}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-center text-xs sm:text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          <MessageCircle className="h-4 w-4 text-sky-600" />
          <span>Chat tư vấn</span>
        </button>
      </div>

      {/* Trust Badges */}
      <div className="pt-3 border-t border-slate-100 -mx-3 px-1 grid grid-cols-3 gap-0.5 text-center text-[10.5px] leading-tight text-slate-600">
        <div className="flex flex-col items-center gap-1 px-0.5 py-1 min-w-0">
          <RefreshCw className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-bold text-slate-700 whitespace-nowrap tracking-tight">Hủy miễn phí</span>
          <span className="text-slate-400 font-normal whitespace-nowrap text-[10px]">Trước 7 ngày</span>
        </div>

        <div className="flex flex-col items-center gap-1 px-0.5 py-1 border-x border-slate-100 min-w-0">
          <CreditCard className="h-4 w-4 text-sky-600 shrink-0" />
          <span className="font-bold text-slate-700 whitespace-nowrap tracking-tight">Thanh toán linh hoạt</span>
          <span className="text-slate-400 font-normal whitespace-nowrap text-[10px]">Nhiều hình thức</span>
        </div>

        <div className="flex flex-col items-center gap-1 px-0.5 py-1 min-w-0">
          <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
          <span className="font-bold text-slate-700 whitespace-nowrap tracking-tight">Cam kết chất lượng</span>
          <span className="text-slate-400 font-normal whitespace-nowrap text-[10px]">Hoàn tiền 100%</span>
        </div>
      </div>
    </div>
  );
}
