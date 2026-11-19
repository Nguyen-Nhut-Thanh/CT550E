import { ImageWithFallback } from "@/components/common/dialogs_and_feedback/media/ImageWithFallback";
import { formatVND } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dateTime";
import { Clock, MapPin, Star } from "lucide-react";
import Link from "next/link";
import type { BookingTourInfoCardProps } from "shared";
import { getActiveSchedulePromotion } from "@/lib/booking/client/pricing";

export function BookingTourInfoCard({
  tour,
  selectedSchedule,
  seatsLeft,
  adultUnitPrice,
}: BookingTourInfoCardProps) {
  const rating =
    tour.rating_avg != null
      ? Number(tour.rating_avg)
      : tour.reviews?.length
        ? tour.reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
          tour.reviews.length
        : 0;

  const promoInfo = getActiveSchedulePromotion(selectedSchedule);

  return (
    <section className="rounded-2xl border border-blue-100/60 bg-white p-4 shadow-[0_4px_24px_rgba(37,99,235,0.04)] sm:p-5">
      <div className="grid items-center gap-5 sm:grid-cols-[210px_minmax(0,1fr)]">
        <Link href={`/tours/${tour.tour_id}`}>
          <ImageWithFallback
            src={tour.tour_images?.[0]?.image_url || undefined}
            fallback="/images/shared/travel-cover.png"
            alt={tour.name}
            className="h-48 w-full rounded-xl object-cover sm:h-44"
          />
        </Link>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-teal-700">
            {selectedSchedule.departure_location?.name && (
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1">
                <MapPin className="h-3 w-3" />
                {selectedSchedule.departure_location.name}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1">
              <Clock className="h-3 w-3" />
              {tour.duration_days} ngày {tour.duration_nights} đêm
            </span>
          </div>
          <h2 className="mt-3 text-xl font-extrabold leading-snug text-slate-900">
            <Link href={`/tours/${tour.tour_id}`}>{tour.name}</Link>
          </h2>
          {tour.summary && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
              {tour.summary}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)} (
              {tour.rating_count ?? tour.reviews?.length ?? 0} đánh giá)
            </span>
            <span className="text-blue-700">Còn {seatsLeft} chỗ</span>
          </div>

          <div className="mt-3 flex flex-wrap items-baseline gap-2">
            <p className="text-xs text-slate-500">
              Từ{" "}
              <span className="text-xl font-extrabold text-[#ef3b2d]">
                {formatVND(adultUnitPrice)}
              </span>{" "}
              /khách
            </p>
            {promoInfo && promoInfo.originalPrice > adultUnitPrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatVND(promoInfo.originalPrice)}
              </span>
            )}
          </div>

          {promoInfo && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 border border-amber-300 px-2 py-0.5 text-[11px] font-bold text-amber-900 shadow-2xs">
                🎁 {promoInfo.title}
                <span className="rounded bg-amber-500 px-1 text-[10px] text-white font-extrabold">
                  {promoInfo.discountLabel}
                </span>
              </span>
              {promoInfo.giftDescription && (
                <span className="text-[11px] font-semibold text-amber-800">
                  ✨ Quà tặng: {promoInfo.giftDescription}
                </span>
              )}
            </div>
          )}

          <p className="mt-1 text-xs text-slate-400">
            Khởi hành {formatDate(selectedSchedule.start_date)} · Kết thúc{" "}
            {formatDate(selectedSchedule.end_date)}
          </p>
        </div>
      </div>
    </section>
  );
}
