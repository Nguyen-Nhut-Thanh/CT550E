import Link from "next/link";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { formatDate } from "@/lib/client/utils/utils";
import type { PublicTourDetail, TourSchedule } from "shared";

interface BookingTourInfoCardProps {
  tour: PublicTourDetail;
  selectedSchedule: TourSchedule;
  seatsLeft: number;
}

export function BookingTourInfoCard({
  tour,
  selectedSchedule,
  seatsLeft,
}: BookingTourInfoCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 md:grid-cols-[300px_minmax(0,1fr)]">
        <ImageWithFallback
          src={tour.tour_images?.[0]?.image_url || undefined}
          alt={tour.name}
          className="h-full min-h-[220px] w-full object-cover"
        />
        <div className="space-y-5 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
              Mã tour: {tour.code}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Còn {seatsLeft} chỗ
            </span>
          </div>

          <div>
            <h1 className="text-[28px] font-bold leading-tight text-slate-900">
              Xác nhận thông tin đặt tour
            </h1>
            <p
              title={tour.name}
              className="mt-2 line-clamp-2 break-words text-sm text-slate-500"
            >
              {tour.name}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Khởi hành</p>
              <p className="mt-1 text-sm font-semibold text-sky-700">
                {formatDate(selectedSchedule.start_date)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-500">Kết thúc</p>
              <p className="mt-1 text-sm font-semibold text-sky-700">
                {formatDate(selectedSchedule.end_date)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
