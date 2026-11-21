"use client";

import FavoriteButton from "@/components/tour_cards/elements/UserFavoriteButton";
import { TourCardMenu } from "@/components/tour_cards/elements/UserTourCardMenu";
import { useTourFavorite } from "@/lib/hooks/useTourFavorite";
import { formatVND } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dateTime";
import { normalizeImageSrc } from "@/lib/utils/images";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useId } from "react";
import type { FlashDealItem } from "shared";

export function DomesticTourCard({ item }: { item: FlashDealItem }) {
  const { favorite, pending, handleFavoriteClick } = useTourFavorite(
    item.tour_id,
    item.name,
  );
  const imageClipId = `domestic-tour-wave-${useId().replace(/:/g, "")}`;
  const imageUrl =
    normalizeImageSrc(item.cover_image_url || item.image_url) ||
    "/images/shared/default-tour-beach.jpg";
  const displayPrice = item.sale_price || item.original_price || 0;
  const hasDiscount =
    !!item.original_price && item.original_price > (item.sale_price || 0);

  return (
    <article className="group relative isolate flex h-[260px] w-full max-w-[560px] min-w-0 gap-3 overflow-hidden rounded-[20px] border border-blue-100 bg-[radial-gradient(ellipse_at_100%_20%,#e7f0ff_0%,transparent_35%),linear-gradient(135deg,#fff_40%,#f8fbff_100%)] p-3 shadow-[0_10px_28px_rgba(29,78,216,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(29,78,216,0.15)] max-sm:h-auto max-sm:flex-col">
      <Link
        href={item.link || `/tours/${item.tour_id}`}
        aria-label={`Đặt tour ${item.name}`}
        className="absolute inset-0 z-10 rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
      />
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
        <defs>
          <clipPath id={`${imageClipId}-main`} clipPathUnits="objectBoundingBox">
            <path d="M .06 0 L .90 0 Q .97 0 .98 .06 C 1 .28 .99 .68 .95 .88 C .93 .96 .84 .98 .68 .97 C .45 .95 .22 .98 .06 .99 Q 0 .99 0 .93 L 0 .06 Q 0 0 .06 0 Z" />
          </clipPath>
          <clipPath id={`${imageClipId}-back`} clipPathUnits="objectBoundingBox">
            <path d="M .06 0 L .91 0 Q .98 0 .99 .06 C 1.01 .32 1 .74 .96 .93 C .94 .99 .85 1 .65 .99 L .06 1 Q 0 1 0 .94 L 0 .06 Q 0 0 .06 0 Z" />
          </clipPath>
        </defs>
      </svg>
      <div className="pointer-events-none relative z-20 h-full w-[34%] shrink-0 max-sm:aspect-[16/10] max-sm:h-auto max-sm:w-full">
        <div
          className="absolute -bottom-[3px] -right-[3px] left-0 top-0 bg-gradient-to-br from-sky-100 via-blue-100/80 to-sky-200/70"
          style={{
            clipPath: `url(#${imageClipId}-back)`,
            WebkitClipPath: `url(#${imageClipId}-back)`,
          }}
        />
        <div
          className="absolute inset-0 overflow-hidden bg-sky-100"
          style={{
            clipPath: `url(#${imageClipId}-main)`,
            WebkitClipPath: `url(#${imageClipId}-main)`,
          }}
        >
          <img
            src={imageUrl}
            alt={item.name || "Tour nội địa"}
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-900/50 via-slate-900/15 to-transparent" />
        </div>
        {item.discount_percent ? (
          <span className="absolute left-3.5 top-3.5 inline-flex max-w-[calc(100%-70px)] items-center gap-1 truncate rounded-full border border-rose-500/80 bg-white/40 px-2.5 py-1 text-[11px] font-extrabold text-rose-600 shadow-lg shadow-rose-900/10 backdrop-blur-lg">
            −{item.discount_percent}%
          </span>
        ) : (
          <span className="absolute left-3.5 top-3.5 max-w-[calc(100%-70px)] truncate rounded-full bg-[#2563eb]/65 px-2.5 py-1 text-[10px] font-semibold text-white shadow-md shadow-blue-950/20 backdrop-blur-lg">
            Tour nổi bật
          </span>
        )}
        <FavoriteButton
          active={favorite}
          loading={pending}
          onClick={handleFavoriteClick}
          className={`pointer-events-auto absolute right-3.5 top-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/65 shadow-md ring-2 ring-white/40 backdrop-blur-lg transition hover:scale-105 hover:bg-white/90 disabled:opacity-50 ${favorite ? "text-red-500" : "text-slate-500"}`}
          iconClassName="h-4 w-4"
          label={favorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
        />
        <div className="absolute bottom-5 left-3.5 inline-flex max-w-[calc(100%-28px)] items-center gap-1.5 rounded-full border border-white/15 bg-slate-900/50 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{item.departure_name || "Khám phá Việt Nam"}</span>
        </div>
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col justify-between overflow-hidden">
        <svg
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full select-none"
          viewBox="0 0 340 234"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMaxYMax slice"
          aria-hidden="true"
          focusable="false"
        >
          {/* Hai điểm nhấn nhỏ, nằm dưới nội dung và không nhận thao tác chuột. */}
          <g stroke="#8FA5C1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity=".38">
            <path d="M145 20C171 3 194 32 220 18S254 9 266 14" strokeDasharray="3 5" opacity=".6" />
            <path d="m288 3-23 10 9 4 4 9 4-9 6-14Z" fill="#8FA5C1" fillOpacity=".12" />
            <path d="m288 3-14 14" />
          </g>
          <g stroke="#8FA5C1" strokeWidth="1.1" opacity=".24">
            <circle cx="319" cy="179" r="27" strokeDasharray="2 4" />
            <circle cx="319" cy="179" r="20" />
            <path d="m319 156 4 19 19 4-19 4-4 19-4-19-19-4 19-4Z" fill="#8FA5C1" fillOpacity=".18" stroke="none" />
            <circle cx="319" cy="179" r="2.5" fill="white" />
          </g>
        </svg>
        <div className="relative">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 ring-1 ring-blue-100">
              <MapPin className="h-3 w-3" /> Trong nước
            </span>
            <TourCardMenu
              tour={{
                tour_id: item.tour_id,
                name: item.name,
                code: item.code,
                image_url: imageUrl,
                price: displayPrice,
                duration: item.duration_text,
                departure: item.departure_name,
              }}
            />
          </div>
          <h3
            className="h-10 line-clamp-2 text-[15px] font-black leading-tight text-[#183567]"
            title={item.name}
          >
            {item.name}
          </h3>
          <p className="mt-1 h-4 line-clamp-1 text-xs leading-4 text-slate-500">
            {item.summary || ""}
          </p>

          <div className="mt-2 grid grid-cols-3 divide-x divide-blue-100 rounded-xl bg-blue-50/70 px-1 py-1.5">
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-2 items-center px-1.5 sm:px-2.5">
              <Calendar className="row-span-2 mr-1.5 h-3.5 w-3.5 shrink-0 self-center text-blue-600" />
              <span className="truncate text-[10px] font-medium text-slate-500">
                Ngày đi
              </span>
              <p className="truncate text-[11px] font-bold text-slate-800">
                {formatDate(item.start_date)}
              </p>
            </div>
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-2 items-center px-1.5 sm:px-2.5">
              <Clock className="row-span-2 mr-1.5 h-3.5 w-3.5 shrink-0 self-center text-blue-600" />
              <span className="truncate text-[10px] font-medium text-slate-500">
                Thời gian
              </span>
              <p className="truncate text-[11px] font-bold text-slate-800">
                {item.duration_text || "Đang cập nhật"}
              </p>
            </div>
            <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-2 items-center px-1.5 sm:px-2.5">
              <Users className="row-span-2 mr-1.5 h-3.5 w-3.5 shrink-0 self-center text-blue-600" />
              <span className="truncate text-[10px] font-medium text-slate-500">
                Số chỗ
              </span>
              <p className="truncate text-[11px] font-bold text-blue-700">
                Còn {item.seats_left ?? 0} chỗ
              </p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {item.rating_count ? (
              <>
                <span className="font-bold text-slate-800">
                  {Number(item.rating_avg || 0).toFixed(1)}
                </span>
                <span className="text-slate-500">
                  ({item.rating_count} đánh giá)
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
              <p className="mb-0.5 text-xs font-semibold text-slate-400 line-through">
                {formatVND(item.original_price)}
              </p>
            )}
            <p className="mt-0.5 text-base font-black tracking-tight text-blue-700">
              {formatVND(displayPrice)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasDiscount && item.discount_percent && (
              <span className="hidden rounded-full bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 sm:inline-flex">
                Tiết kiệm {item.discount_percent}%
              </span>
            )}
            <Link
              href={item.link || `/tours/${item.tour_id}`}
              className="relative z-20 inline-flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 px-4 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-xl active:scale-[.98]"
            >
              Đặt ngay <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
