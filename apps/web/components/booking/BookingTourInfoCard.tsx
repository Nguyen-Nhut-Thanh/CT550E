import Link from "next/link";
import { Clock, MapPin, Star } from "lucide-react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { formatDate, formatVND } from "@/lib/client/utils/utils";
import type { PublicTourDetail, TourSchedule } from "shared";

interface BookingTourInfoCardProps { tour: PublicTourDetail; selectedSchedule: TourSchedule; seatsLeft: number; adultUnitPrice: number; }
export function BookingTourInfoCard({ tour, selectedSchedule, seatsLeft, adultUnitPrice }: BookingTourInfoCardProps) {
  const rating = tour.rating_avg != null ? Number(tour.rating_avg) : tour.reviews?.length
    ? tour.reviews.reduce((sum, review) => sum + Number(review.rating), 0) / tour.reviews.length : 0;
  return (
    <section className="rounded-2xl border border-blue-100/60 bg-white p-4 shadow-[0_4px_24px_rgba(37,99,235,0.04)] sm:p-5">
      <div className="grid items-center gap-5 sm:grid-cols-[210px_minmax(0,1fr)]">
        <Link href={`/tours/${tour.tour_id}`}><ImageWithFallback src={tour.tour_images?.[0]?.image_url || undefined} fallback="/images/account/cover-images.png" alt={tour.name} className="h-48 w-full rounded-xl object-cover sm:h-44" /></Link>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-teal-700">
            {tour.departure_locations?.name && <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1"><MapPin className="h-3 w-3" />{tour.departure_locations.name}</span>}
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1"><Clock className="h-3 w-3" />{tour.duration_days} ngày {tour.duration_nights} đêm</span>
          </div>
          <h2 className="mt-3 text-xl font-extrabold leading-snug text-slate-900"><Link href={`/tours/${tour.tour_id}`}>{tour.name}</Link></h2>
          {tour.summary && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{tour.summary}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{rating.toFixed(1)} ({tour.rating_count ?? tour.reviews?.length ?? 0} đánh giá)</span>
            <span className="text-blue-700">Còn {seatsLeft} chỗ</span>
          </div>
          <p className="mt-3 text-xs text-slate-500">Từ <span className="text-xl font-extrabold text-rose-600">{formatVND(adultUnitPrice)}</span> /khách</p>
          <p className="mt-1 text-xs text-slate-400">Khởi hành {formatDate(selectedSchedule.start_date)} · Kết thúc {formatDate(selectedSchedule.end_date)}</p>
        </div>
      </div>
    </section>
  );
}
