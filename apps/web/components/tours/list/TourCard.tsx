"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Hotel, MapPin, Star } from "lucide-react";
import FavoriteButton from "@/components/common/FavoriteButton";
import { useToast } from "@/components/common/Toast";
import TransportIcon from "@/components/common/TransportIcon";
import { useFavoriteTours } from "@/lib/client/hooks/useFavoriteTours";
import { getTourPriceValue, getTransportLabel } from "@/lib/client/utils/tourDisplay";
import { formatVND, normalizeImageSrc, PLACEHOLDER_IMAGE } from "@/lib/client/utils/utils";
import type { PublicTourCard, TourSchedule } from "shared";

type TourCardProps = {
  tour: PublicTourCard;
  onTourClick?: (tour: PublicTourCard) => void;
};

export default function TourCard({ tour, onTourClick }: TourCardProps) {
  const router = useRouter();
  const toast = useToast();
  const { isFavorite, isPending, toggleFavorite } = useFavoriteTours();

  const tourPrice = getTourPriceValue(tour.base_price, tour.next_schedule?.price);
  const imageSrc = normalizeImageSrc(tour.cover_image) || PLACEHOLDER_IMAGE;

  const handleFavoriteClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const result = await toggleFavorite(tour.tour_id);

    if (!result.ok) {
      if (result.reason === "unauthenticated") {
        toast.info(result.message);
        router.push(
          `/login?callbackUrl=${encodeURIComponent(
            window.location.pathname + window.location.search,
          )}`,
        );
        return;
      }

      toast.error(result.message);
      return;
    }

    toast.success(
      result.action === "added"
        ? `Đã lưu "${tour.name}" vào yêu thích.`
        : `Đã bỏ "${tour.name}" khỏi yêu thích.`,
    );
  };

  const discountPercent =
    tour.next_schedule?.original_price &&
    tour.next_schedule.original_price > tour.next_schedule.price
      ? Math.round(
          ((tour.next_schedule.original_price - tour.next_schedule.price) /
            tour.next_schedule.original_price) *
            100,
        )
      : null;

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
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
            active={isFavorite(tour.tour_id)}
            loading={isPending(tour.tour_id)}
            onClick={handleFavoriteClick}
            className={`absolute left-3 top-3 rounded-full p-2 shadow-sm transition-colors ${
              isFavorite(tour.tour_id)
                ? "bg-rose-500 text-white"
                : "bg-white/90 text-gray-500 hover:text-rose-500"
            }`}
            iconClassName="h-5 w-5"
            label={
              isFavorite(tour.tour_id)
                ? "Bỏ khỏi yêu thích"
                : "Thêm vào yêu thích"
            }
          />
        </div>

        {/* Thông tin chi tiết Tour */}
        <div className="flex flex-col justify-between p-3.5 md:p-4">
          <div>
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
              <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
                {tour.upcoming_schedules && tour.upcoming_schedules.length > 0 ? (
                  tour.upcoming_schedules.map((s: TourSchedule) => {
                    const date = new Date(s.start_date);
                    const day = String(date.getDate()).padStart(2, "0");
                    const month = String(date.getMonth() + 1).padStart(2, "0");

                    return (
                      <span
                        key={s.tour_schedule_id}
                        className="whitespace-nowrap rounded-lg border border-sky-100 bg-sky-50 px-2 py-0.5 text-[11.5px] font-bold text-sky-700 shadow-sm"
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
              </div>
            </div>
          </div>

          {/* Danh sách các điểm đến */}
          {tour.destinations && tour.destinations.length > 0 && (
            <div className="mt-2 flex max-h-[22px] flex-wrap gap-1 overflow-hidden">
              {tour.destinations.map((item, index) => (
                <span
                  key={`${tour.tour_id}-${item.location_id}-${index}`}
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded bg-[#eef5ff] px-2 py-0.5 text-[11px] font-bold text-[#0d63b9]"
                >
                  <MapPin size={10} className="shrink-0" />
                  {item.name}
                </span>
              ))}
            </div>
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
              className="min-w-[140px] rounded-xl bg-[#0d63b9] px-5 py-2.5 text-center text-[13.5px] font-bold text-white shadow-lg shadow-blue-100 transition-all hover:bg-[#0a56a1] hover:shadow-blue-200 active:scale-95"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
