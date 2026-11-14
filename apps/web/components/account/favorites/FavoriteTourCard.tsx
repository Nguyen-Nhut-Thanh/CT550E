"use client";

import { normalizeImageSrc, PLACEHOLDER_IMAGE } from "@/lib/utils/images";
import {
  ArrowRight,
  Calendar,
  Clock,
  Heart,
  Loader2,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { FavItem } from "shared";

interface FavoriteTourCardProps {
  item: FavItem;
  onToggleFavorite: (tourId: number, tourName: string) => Promise<void> | void;
  isRemoving?: boolean;
}

function formatReviewsCount(count: number): string {
  if (count <= 0) return "Chưa có đánh giá";
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k đánh giá`;
  }
  return `${count} đánh giá`;
}

function formatRating(rating: number): string {
  if (rating <= 0) return "5.0";
  return rating.toFixed(1);
}

export function FavoriteTourCard({
  item,
  onToggleFavorite,
  isRemoving = false,
}: FavoriteTourCardProps) {
  const imageSrc = normalizeImageSrc(item.image) || PLACEHOLDER_IMAGE;

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isRemoving) {
      onToggleFavorite(item.tour_id, item.name);
    }
  };

  const isFavorited = !isRemoving;

  return (
    <article className="group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-slate-100/90 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-200/80 hover:shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
      {/* Background Stretched Link to tour detail */}
      <Link
        href={`/tours/${item.tour_id}`}
        className="absolute inset-0 z-0"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Media / Thumbnail (Left side: ~40% width) */}
      <div className="relative aspect-[4/3] sm:aspect-auto w-full sm:w-[40%] md:w-[42%] shrink-0 overflow-hidden bg-slate-50 min-h-[185px]">
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
        />

        {/* Top-Left: Type Badge (Trong nước / Nước ngoài) - Nhạt màu và thanh thoát */}
        <div className="pointer-events-none absolute left-3 top-3 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/40 px-2.5 py-1 text-[11px] font-medium text-white/95 backdrop-blur-md shadow-2xs whitespace-nowrap">
            <MapPin className="h-3 w-3 text-white/90" />
            <span>
              {item.type === "international" ? "Nước ngoài" : "Trong nước"}
            </span>
          </span>
        </div>

        {/* Top-Right: Circular Heart Button */}
        <button
          type="button"
          onClick={handleHeartClick}
          disabled={isRemoving}
          aria-label={isFavorited ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
          title={isFavorited ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
          className="absolute right-3 top-3 z-20 flex h-8.5 w-8.5 items-center justify-center rounded-full bg-white/95 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
          ) : (
            <Heart
              className={`h-4.5 w-4.5 transition-transform group-hover:scale-105 ${
                isFavorited
                  ? "fill-red-500 text-red-500"
                  : "text-slate-400 hover:text-red-500"
              }`}
            />
          )}
        </button>

        {/* Bottom-Left: Saved Date Badge - Nhạt màu, êm mắt */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-600 backdrop-blur-md shadow-2xs whitespace-nowrap">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>Lưu ngày {item.savedDate || "hôm nay"}</span>
          </span>
        </div>
      </div>

      {/* Content Container (Right side: ~58-60% width) */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          {/* Title - Đậm vừa phải, thanh lịch */}
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-800 transition-colors group-hover:text-[#1766c2]">
            {item.name}
          </h3>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="font-bold text-slate-800 text-xs sm:text-sm">
              {formatRating(item.rating)}
            </span>
            <span className="text-slate-400 font-normal">
              ({formatReviewsCount(item.reviewsCount)})
            </span>
          </div>

          {/* Specs: Duration & Guest Quota - Màu chữ nhạt, dịu mắt */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>{item.duration}</span>
            </div>
            {item.guestCount && (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{item.guestCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Price & CTA Button (Đường kẻ nhạt, nút màu pastel dịu nhẹ) */}
        <div className="relative z-10 mt-4 flex items-center justify-between gap-2 border-t border-slate-100/70 pt-3">
          <div className="flex items-baseline gap-1 shrink-0 whitespace-nowrap">
            <span className="text-base sm:text-[17px] font-extrabold tracking-tight text-[#1766c2]">
              {Number(item.price).toLocaleString("vi-VN")}&nbsp;đ
            </span>
            <span className="text-xs font-normal text-slate-400">/ người</span>
          </div>

          <Link
            href={`/tours/${item.tour_id}`}
            className="inline-flex items-center gap-1 rounded-full bg-blue-50/70 px-3 py-1.5 text-xs font-semibold text-[#1766c2] shadow-2xs transition-all hover:bg-[#1766c2] hover:text-white group/btn shrink-0 whitespace-nowrap"
          >
            <span>Xem chi tiết</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
