"use client";

import FavoriteButton from "@/components/tour_cards/elements/UserFavoriteButton";
import { useTourFavorite } from "@/lib/hooks/useTourFavorite";
import { formatVND } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dateTime";
import { normalizeImageSrc } from "@/lib/utils/images";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Globe2,
  MapPin,
  Plane,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useId } from "react";
import type { PublicTourCard } from "shared";

export function OutboundTourCard({ tour }: { tour: PublicTourCard }) {
  const { favorite, pending, handleFavoriteClick } = useTourFavorite(
    tour.tour_id,
    tour.name,
  );
  const clipId = `outbound-tour-wave-${useId().replace(/:/g, "")}`;
  const schedule = tour.next_schedule;
  const imageUrl =
    normalizeImageSrc(schedule?.cover_image_url || tour.cover_image) ||
    "/images/shared/default-tour-beach.jpg";
  const destination = tour.destinations?.at(-1)?.name || "Nước ngoài";
  const price = Number(schedule?.price ?? 0);
  const originalPrice = Number(schedule?.original_price ?? price);
  const hasDiscount = originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const airline = tour.transport?.name || "Đang cập nhật";
  const href = `/tours/${tour.tour_id}`;

  return (
    <article className="group relative flex h-[240px] w-full max-w-[560px] min-w-0 shrink-0 overflow-hidden rounded-[20px] border border-blue-100 bg-white shadow-[0_10px_28px_rgba(29,78,216,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(29,78,216,0.15)] max-sm:h-[300px] max-sm:flex-col">
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
        <defs>
          <clipPath id={`${clipId}-main`} clipPathUnits="objectBoundingBox">
            <path d="M .08 0 L .92 0 Q 1 0 1 .065 L 1 .42 C 1 .72 .93 .92 .72 .94 C .45 .965 .22 .95 .06 .99 Q 0 1 0 .935 L 0 .065 Q 0 0 .08 0 Z" />
          </clipPath>
          <clipPath id={`${clipId}-back`} clipPathUnits="objectBoundingBox">
            <path d="M .08 0 L .92 0 Q 1 0 1 .065 L 1 .88 C .95 .98 .75 .99 .45 .98 L .06 1 Q 0 1 0 .935 L 0 .065 Q 0 0 .08 0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="relative h-full w-[36%] shrink-0 max-sm:h-32 max-sm:w-full">
        <div
          className="tour-wave-backdrop absolute -inset-x-1 -inset-y-1 bg-gradient-to-br from-sky-100 via-blue-50 to-sky-100"
          style={{
            clipPath: `url(#${clipId}-back)`,
            WebkitClipPath: `url(#${clipId}-back)`,
          }}
        />
        <div
          className="tour-wave-mask absolute inset-0 overflow-hidden bg-slate-200"
          style={{
            clipPath: `url(#${clipId}-main)`,
            WebkitClipPath: `url(#${clipId}-main)`,
          }}
        >
          <img
            src={imageUrl}
            alt={tour.name}
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
          <FavoriteButton
            active={favorite}
            loading={pending}
            onClick={handleFavoriteClick}
            className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm transition-all hover:scale-110 ${favorite ? "text-rose-500" : "text-slate-500"}`}
            iconClassName="h-5 w-5"
            label={favorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
          />
          <span className="absolute bottom-6 left-4 inline-flex max-w-[82%] items-center gap-1.5 truncate rounded-full border border-white/15 bg-slate-900/45 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur-md">
            <MapPin className="h-4 w-4 shrink-0" /> {destination}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between overflow-hidden bg-[radial-gradient(ellipse_at_100%_20%,#e7f0ff_0%,transparent_35%),linear-gradient(135deg,#fff_40%,#f8fbff_100%)] p-2.5 sm:p-3">
        <div>
          <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 ring-1 ring-blue-100">
            <Globe2 className="h-3.5 w-3.5" /> Tour nước ngoài
          </span>
          <h3
            className="line-clamp-2 text-[15px] font-black leading-tight text-[#183567]"
            title={tour.name}
          >
            {tour.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs leading-4 text-slate-500">
            {tour.summary || `Khám phá ${destination} với hành trình đáng nhớ.`}
          </p>

          <div className="mt-2 grid grid-cols-3 divide-x divide-blue-100 rounded-xl bg-blue-50/70 px-1 py-1.5">
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-2 items-center gap-x-1 px-1.5">
              <CalendarDays className="row-span-2 h-3.5 w-3.5 text-blue-600" />
              <span className="truncate text-[10px] text-slate-500">
                Khởi hành
              </span>
              <span className="truncate text-[11px] font-bold text-slate-800">
                {schedule?.start_date
                  ? formatDate(schedule.start_date)
                  : "Đang cập nhật"}
              </span>
            </div>
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-2 items-center gap-x-1 px-1.5">
              <Clock3 className="row-span-2 h-3.5 w-3.5 text-blue-600" />
              <span className="truncate text-[10px] text-slate-500">
                Thời gian
              </span>
              <span className="truncate text-[11px] font-bold text-slate-800">
                {tour.duration_days}N{tour.duration_nights}Đ
              </span>
            </div>
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-2 items-center gap-x-1 px-1.5">
              <Plane className="row-span-2 h-3.5 w-3.5 -rotate-12 text-blue-600" />
              <span className="truncate text-[10px] text-slate-500">
                Hãng bay
              </span>
              <span
                className="truncate text-[11px] font-bold text-blue-700"
                title={airline}
              >
                {airline}
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {tour.rating_count > 0 ? (
              <>
                <span className="font-bold text-slate-800">
                  {Number(tour.rating_avg || 0).toFixed(1)}
                </span>
                <span className="text-slate-500">
                  ({tour.rating_count} đánh giá)
                </span>
              </>
            ) : (
              <span className="text-slate-500">Chưa có đánh giá</span>
            )}
          </div>
        </div>

        <div className="relative mt-2 flex flex-wrap items-end justify-between gap-2 border-t border-blue-100/80 pt-2">
          <div>
            {hasDiscount && (
              <p className="mb-0.5 text-[10px] font-semibold text-slate-400 line-through">
                {formatVND(originalPrice)}
              </p>
            )}
            <p className="text-base font-black tracking-tight text-blue-700">
              {formatVND(price)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <span className="hidden rounded-full bg-blue-50 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 sm:inline-flex">
                Tiết kiệm {discountPercent}%
              </span>
            )}
            <Link
              href={href}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-[.98]"
            >
              Đặt ngay <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
