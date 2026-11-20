"use client";

import { normalizeImageSrc, PLACEHOLDER_IMAGE } from "@/lib/utils/images";
import { formatDate } from "@/lib/utils/dateTime";
import { formatVND } from "@/lib/utils/currency";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Globe2,
  Heart,
  Loader2,
  MapPin,
  Plane,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId } from "react";
import type { FavItem } from "shared";

interface FavoriteTourCardProps {
  item: FavItem;
  onToggleFavorite: (tourId: number, tourName: string) => Promise<void> | void;
  isRemoving?: boolean;
}

function formatReviewsCount(count: number): string {
  if (count <= 0) return "Chưa có đánh giá";
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k đánh giá`;
  return `${count} đánh giá`;
}

export function FavoriteTourCard({
  item,
  onToggleFavorite,
  isRemoving = false,
}: FavoriteTourCardProps) {
  const imageSrc = normalizeImageSrc(item.image) || PLACEHOLDER_IMAGE;
  const waveId = `favorite-tour-wave-${useId().replace(/:/g, "")}`;
  const isForeign = item.type === "international";
  const hasDiscount = !!item.originalPrice && item.originalPrice > item.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((item.originalPrice! - item.price) / item.originalPrice!) * 100,
      )
    : 0;

  const handleHeartClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isRemoving) onToggleFavorite(item.tour_id, item.name);
  };

  return (
    <article className="group relative isolate mx-auto flex w-full max-w-[620px] min-w-0 flex-col gap-3 overflow-hidden rounded-[22px] border border-white bg-white p-3 shadow-[0_12px_34px_rgba(30,64,175,0.08)] transition-all duration-300 hover:shadow-[0_18px_42px_rgba(30,64,175,0.13)] xl:h-[250px] xl:flex-row xl:gap-3 xl:p-3">
      <Link
        href={`/tours/${item.tour_id}`}
        className="absolute inset-0 z-0 rounded-[22px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
        aria-label={`Xem chi tiết ${item.name}`}
      />

      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
        <defs>
          <clipPath id={`${waveId}-main`} clipPathUnits="objectBoundingBox">
            <path d="M .06 0 L .90 0 Q .97 0 .98 .06 C 1 .28 .99 .68 .95 .88 C .93 .96 .84 .98 .68 .97 C .45 .95 .22 .98 .06 .99 Q 0 .99 0 .93 L 0 .06 Q 0 0 .06 0 Z" />
          </clipPath>
          <clipPath id={`${waveId}-back`} clipPathUnits="objectBoundingBox">
            <path d="M .06 0 L .91 0 Q .98 0 .99 .06 C 1.01 .32 1 .74 .96 .93 C .94 .99 .85 1 .65 .99 L .06 1 Q 0 1 0 .94 L 0 .06 Q 0 0 .06 0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="pointer-events-none relative z-[1] h-[180px] w-full shrink-0 sm:h-[200px] xl:h-full xl:min-h-0 xl:w-[34%]">
        <div
          className="absolute inset-0 bg-gradient-to-br from-sky-100 via-blue-100/80 to-sky-200/70"
          style={{
            clipPath: `url(#${waveId}-back)`,
            WebkitClipPath: `url(#${waveId}-back)`,
          }}
        />
        <div
          className="relative h-full w-full overflow-hidden bg-sky-100"
          style={{
            clipPath: `url(#${waveId}-main)`,
            WebkitClipPath: `url(#${waveId}-main)`,
          }}
        >
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 365px"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />

          <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1 rounded-full bg-[#2563eb]/65 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md shadow-blue-950/20 backdrop-blur-lg">
            {isForeign ? (
              <Globe2 className="h-3.5 w-3.5" />
            ) : (
              <Plane className="h-3.5 w-3.5 -rotate-12" />
            )}
            {isForeign ? "Tour nước ngoài" : "Tour trong nước"}
          </span>

          <button
            type="button"
            onClick={handleHeartClick}
            disabled={isRemoving}
            aria-label="Bỏ khỏi yêu thích"
            title="Bỏ khỏi yêu thích"
            className="pointer-events-auto absolute right-3.5 top-3.5 z-[2] flex h-9 w-9 items-center justify-center rounded-full bg-white/65 ring-2 ring-white/40 shadow-md backdrop-blur-lg transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
          >
            {isRemoving ? (
              <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
            ) : (
              <Heart className="h-4 w-4 fill-[#ef4444] text-[#ef4444]" />
            )}
          </button>

          <span className="absolute bottom-5 left-4 inline-flex max-w-[82%] items-center gap-1.5 truncate rounded-full border border-white/15 bg-slate-900/50 px-3.5 py-1.5 text-[12px] font-medium text-white backdrop-blur-md">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {item.location}
          </span>
        </div>
      </div>

      <div className="pointer-events-none relative z-[1] flex min-w-0 flex-1 flex-col justify-between px-1 py-1 xl:py-0.5 xl:pr-1">
        <div>
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-slate-400">
              Đã lưu ngày {item.savedDate || "hôm nay"}
            </span>
          </div>
          <h3 className="h-12 line-clamp-2 text-[17px] font-extrabold leading-6 tracking-tight text-[#0f172a] transition-colors group-hover:text-[#1266f1] md:text-lg">
            {item.name}
          </h3>
          <div className="mt-3 space-y-3">
            <p className="h-4 truncate text-[11px] leading-4 text-slate-500">
              {item.summary || " "}
            </p>

            <div className="grid grid-cols-1 gap-2 rounded-2xl bg-blue-50/80 p-2.5 sm:grid-cols-3 xl:gap-1 xl:bg-transparent xl:p-0">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563eb]">
                <CalendarDays className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-medium text-slate-400">
                  Khởi hành
                </span>
                <span className="block truncate text-[11px] font-bold text-slate-800">
                  {item.startDate
                    ? formatDate(item.startDate)
                    : "Đang cập nhật"}
                </span>
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563eb]">
                <Clock3 className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-medium text-slate-400">
                  Thời gian
                </span>
                <span className="block truncate text-[11px] font-bold text-slate-800">
                  {item.duration || "Đang cập nhật"}
                </span>
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563eb]">
                <Plane className="h-3.5 w-3.5 -rotate-12" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] font-medium text-slate-400">
                  {isForeign ? "Hãng bay" : "Phương tiện"}
                </span>
                <span className="block truncate text-[11px] font-bold text-slate-800">
                  {item.airline || "Đang cập nhật"}
                </span>
              </span>
            </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm">
              <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
              {item.reviewsCount > 0 ? (
                <>
                  <span className="text-xs font-bold text-slate-800">
                    {item.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({formatReviewsCount(item.reviewsCount)})
                  </span>
                </>
              ) : (
                <span className="text-xs text-slate-400">Chưa có đánh giá</span>
              )}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#eff6ff] px-2.5 py-1 text-[11px] font-semibold text-[#1d74f5]">
              <Users className="h-3.5 w-3.5" />
              {item.seatsLeft != null ? `Còn ${item.seatsLeft} chỗ` : "Chỗ: Đang cập nhật"}
            </span>
            </div>
          </div>
        </div>

        <div className="relative z-[2] flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            {hasDiscount && (
              <span className="block text-sm font-medium text-slate-400 line-through">
                {formatVND(item.originalPrice!)}
              </span>
            )}
            <span className="mt-1 block truncate text-lg font-extrabold leading-none tracking-tight text-[#1266f1] md:text-xl">
              {item.price > 0 ? formatVND(item.price) : "Liên hệ"}
              {item.price > 0 && (
                <span className="ml-1 text-xs font-normal text-slate-400">
                  / người
                </span>
              )}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {hasDiscount && (
              <span className="hidden rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 sm:inline-flex">
                Tiết kiệm {discountPercent}%
              </span>
            )}
            <Link
              href={`/tours/${item.tour_id}`}
              className="group/btn pointer-events-auto inline-flex items-center gap-1 rounded-full bg-[#1266f1] px-2.5 py-2.5 text-[11px] font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:bg-[#0d53c9] active:scale-[.98] md:px-3"
            >
              <span>Xem chi tiết</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
