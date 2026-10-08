"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hash, MapPin, Calendar, Clock, Users, ShieldCheck, CreditCard, RefreshCw, MessageCircle } from "lucide-react";
import type { PublicTourDetail, TourSchedule } from "shared";
import { formatVND, formatDate } from "@/lib/client/utils/utils";

type TourBookingCardProps = {
  tour: PublicTourDetail;
  selectedSchedule?: TourSchedule | null;
};

export default function TourBookingCard({
  tour,
  selectedSchedule = null,
}: TourBookingCardProps) {
  const router = useRouter();

  const displayPrice = Number(selectedSchedule?.price ?? tour.base_price);
  const remainingSeats = selectedSchedule
    ? Math.max(
        Number(selectedSchedule.quota || 0) -
          Number(selectedSchedule.booked_count || 0),
        0,
      )
    : null;

  const bookingHref = selectedSchedule
    ? `/booking?tourId=${tour.tour_id}&scheduleId=${selectedSchedule.tour_schedule_id}`
    : null;

  const scrollToSchedules = () => {
    const element = document.getElementById("tour-schedules");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleZaloConsult = () => {
    window.open("https://zalo.me", "_blank");
  };

  return (
    <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.10)] space-y-5">
      {/* Price Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Giá từ</span>
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="text-3xl font-black text-[#ef3b2d] sm:text-4xl">
            {formatVND(displayPrice)}
          </span>
          <span className="text-sm font-semibold text-slate-500">/ khách</span>
        </div>
      </div>

      {/* State 1: Đã chọn ngày khởi hành */}
      {selectedSchedule ? (
        <div className="space-y-3 rounded-2xl bg-slate-50/80 p-4 text-xs sm:text-sm text-slate-700 border border-slate-100">
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
              {tour.departure_locations?.name || "Hồ Chí Minh"}
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
            <span className="font-bold text-slate-900">{remainingSeats} chỗ</span>
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
        {bookingHref ? (
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
          onClick={handleZaloConsult}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-center text-xs sm:text-sm font-bold text-slate-700 transition hover:bg-slate-100"
        >
          <MessageCircle className="h-4 w-4 text-sky-600" />
          <span>Tư vấn qua Zalo</span>
        </button>
      </div>

      {/* Trust Badges */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-[11px] font-medium text-slate-600">
        <div className="flex flex-col items-center gap-1 p-1">
          <RefreshCw className="h-4 w-4 text-emerald-600" />
          <span className="leading-tight">Hủy miễn phí <br /><span className="text-slate-400 font-normal">Trước 7 ngày</span></span>
        </div>

        <div className="flex flex-col items-center gap-1 p-1 border-x border-slate-100">
          <CreditCard className="h-4 w-4 text-sky-600" />
          <span className="leading-tight">Thanh toán linh hoạt <br /><span className="text-slate-400 font-normal">Nhiều hình thức</span></span>
        </div>

        <div className="flex flex-col items-center gap-1 p-1">
          <ShieldCheck className="h-4 w-4 text-indigo-600" />
          <span className="leading-tight">Cam kết chất lượng <br /><span className="text-slate-400 font-normal">Hoàn tiền 100%</span></span>
        </div>
      </div>
    </div>
  );
}
