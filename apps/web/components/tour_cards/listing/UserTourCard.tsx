"use client";

import FavoriteButton from "@/components/tour_cards/elements/UserFavoriteButton";
import { TourCardMenu } from "@/components/tour_cards/elements/UserTourCardMenu";
import TransportIcon from "@/components/tour_cards/elements/UserTransportIcon";
import { useTourFavorite } from "@/lib/hooks/useTourFavorite";
import { getTransportLabel } from "@/lib/tours/client/display";
import { formatVND } from "@/lib/utils/currency";
import { normalizeImageSrc, PLACEHOLDER_IMAGE } from "@/lib/utils/images";
import { Calendar, Clock, Hotel, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { TourCardProps } from 'shared';
import TourCardTagStrip from "@/components/tour_cards/listing/UserTourCardTagStrip";

export default function TourCard({ tour, onTourClick }: TourCardProps) {
  const { favorite, pending, handleFavoriteClick } = useTourFavorite(tour.tour_id, tour.name);

  const tourPrice = Number(tour.next_schedule?.price ?? tour.base_price ?? 0);
  const imageSrc = normalizeImageSrc(tour.cover_image) || PLACEHOLDER_IMAGE;
  const departureDates = new Map<string, Date>();
  for (const schedule of tour.upcoming_schedules ?? []) {
    const date = new Date(schedule.start_date);
    if (!Number.isNaN(date.getTime())) {
      departureDates.set(date.toDateString(), date);
    }
  }

  const nextSched = tour.next_schedule;
  const discountPercent =
    nextSched?.original_price && nextSched.original_price > nextSched.price
      ? Math.round(((nextSched.original_price - nextSched.price) / nextSched.original_price) * 100)
      : null;

  return (
    <article className="relative isolate overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <Link
        href={`/tours/${tour.tour_id}`}
        onClick={() => onTourClick?.(tour)}
        aria-label={`Xem chi tiết ${tour.name}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
      />
      <div className="grid grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* Khung ảnh Thumbnail */}
        <div className="relative aspect-[16/9] md:aspect-auto">
          <Image
            src={imageSrc}
            alt={tour.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 340px"
          />

          <FavoriteButton
            active={favorite}
            loading={pending}
            onClick={handleFavoriteClick}
            className={`absolute left-3 top-3 z-20 rounded-full p-2 shadow-sm transition-colors ${
              favorite
                ? "bg-rose-500 text-white"
                : "bg-white/90 text-gray-500 hover:text-rose-500"
            }`}
            iconClassName="h-5 w-5"
            label={
              favorite
                ? "Bỏ khỏi yêu thích"
                : "Thêm vào yêu thích"
            }
          />

          <div className="absolute right-3 top-3 z-20">
            <TourCardMenu
              tour={{
                tour_id: tour.tour_id,
                name: tour.name,
                code: tour.code,
                image_url: imageSrc,
                price: tourPrice,
                duration: `${tour.duration_days}N${tour.duration_nights}Đ`,
                departure: tour.departure_location?.name,
              }}
            />
          </div>
        </div>

        {/* Thông tin chi tiết Tour */}
        <div className="flex min-w-0 flex-col justify-between p-3.5 md:p-4">
          <div className="min-w-0">
            <h2
              className="truncate text-[18px] font-bold leading-tight text-[#0f172a]"
              title={tour.name}
            >
              {tour.name}
            </h2>

            {tour.summary && (
              <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-slate-500">
                {tour.summary}
              </p>
            )}

            {/* Grid 2 cột thông số */}
            <div className="mt-2 grid grid-cols-1 gap-x-3 gap-y-1 text-[13.5px] text-[#1f1f1f] md:grid-cols-2">
              <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="shrink-0 font-semibold">Khởi hành:</span>
                <span className="truncate text-[#0d63b9]">
                  {tour.departure_location?.name || "Đang cập nhật"}
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="shrink-0 font-semibold">Thời gian:</span>
                <span className="truncate">
                  {tour.duration_days}N{tour.duration_nights}Đ
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                <Hotel className="h-4 w-4 shrink-0 text-gray-400" />
                <span className="shrink-0 font-semibold">Khách sạn:</span>
                <span className="truncate">Tiêu chuẩn</span>
              </div>

              <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
                <TransportIcon
                  type={tour.transport?.type}
                  className="h-4 w-4 shrink-0 text-gray-400"
                />
                <span className="shrink-0 font-semibold">Phương tiện:</span>
                <span className="truncate">
                  {tour.transport?.type
                    ? getTransportLabel(tour.transport.type)
                    : "Đang cập nhật"}
                </span>
              </div>
            </div>

            {/* Đánh giá tour */}
            <div className="mt-2 flex items-center gap-1.5 text-[12.5px]">
              <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
              <span className="font-bold text-amber-500">
                {Number(tour.rating_avg || 0).toFixed(1)}/5
              </span>
              <span className="text-slate-400">
                ({Number(tour.rating_count || 0).toLocaleString("vi-VN")} đánh giá)
              </span>
            </div>

            {/* Lịch khởi hành sắp tới */}
            <div className="mt-2.5 flex items-center gap-2.5 overflow-hidden">
              <div className="flex shrink-0 items-center gap-1.5 text-[13px]">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="whitespace-nowrap font-bold text-gray-700">
                  Ngày khởi hành:
                </span>
              </div>
              <TourCardTagStrip label="Các ngày khởi hành" className="relative z-20">
                {departureDates.size > 0 ? (
                  [...departureDates].map(([key, date]) => {
                    const day = String(date.getDate()).padStart(2, "0");
                    const month = String(date.getMonth() + 1).padStart(2, "0");

                    return (
                      <span
                        key={key}
                        title={date.toLocaleDateString("vi-VN")}
                        className="shrink-0 whitespace-nowrap rounded-lg border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11.5px] font-bold text-sky-700 shadow-sm"
                      >
                        {day}/{month}
                      </span>
                    );
                  })
                ) : (
                  <span className="whitespace-nowrap text-sm italic text-gray-400">
                    Liên hệ để biết thêm chi tiết
                  </span>
                )}
              </TourCardTagStrip>
            </div>
          </div>

          {/* Danh sách các điểm đến */}
          {tour.destinations && tour.destinations.length > 0 && (
            <TourCardTagStrip label="Các địa điểm trong tour" className="relative z-20 mt-2 gap-1">
              {tour.destinations.map((item, index) => (
                <span
                  key={`${tour.tour_id}-${item.location_id}-${index}`}
                  className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded bg-[#eef5ff] px-2 py-0.5 text-[11px] font-bold text-[#0d63b9]"
                >
                  <MapPin size={10} className="shrink-0" />
                  {item.name}
                </span>
              ))}
            </TourCardTagStrip>
          )}

          {/* Footer Card: Giá và Nút CTA */}
          <div className="mt-2.5 flex flex-col gap-2 border-t border-gray-100 pt-2.5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="whitespace-nowrap text-[14px] font-medium text-gray-500">
                    Giá chỉ từ:
                  </p>
                  {tour.next_schedule?.original_price &&
                    discountPercent !== null && (
                      <div className="flex items-center gap-2">
                        <p className="whitespace-nowrap text-[13px] font-medium text-gray-400 line-through">
                          {formatVND(tour.next_schedule.original_price)}
                        </p>
                        <span className="rounded-md border border-red-100 bg-red-50 px-1.5 py-0.5 text-[10px] font-black text-red-600">
                          -{discountPercent}%
                        </span>
                      </div>
                    )}
                </div>
                <p className="mt-0.5 text-[21px] font-black leading-tight tracking-tighter text-red-600 md:text-[23px]">
                  {formatVND(tourPrice)}
                </p>
              </div>
            </div>

            <Link
              href={`/tours/${tour.tour_id}`}
              onClick={() => onTourClick?.(tour)}
              className="relative z-20 min-w-[140px] rounded-xl bg-[#0d63b9] px-5 py-2.5 text-center text-[13.5px] font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-[#0a56a1] hover:shadow-blue-200 active:scale-95"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
