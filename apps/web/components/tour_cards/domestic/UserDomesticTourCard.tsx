"use client";

import FavoriteButton from "@/components/tour_cards/elements/UserFavoriteButton";
import { useTourFavorite } from "@/lib/hooks/useTourFavorite";
import { formatVND } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dateTime";
import { normalizeImageSrc } from "@/lib/utils/images";
import {
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  MoreHorizontal,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { FlashDealItem } from "shared";

export function DomesticTourCard({ item }: { item: FlashDealItem }) {
  const { favorite, pending, handleFavoriteClick } = useTourFavorite(
    item.tour_id,
    item.name,
  );
  const imageUrl =
    normalizeImageSrc(item.cover_image_url || item.image_url) ||
    "/images/shared/default-tour-beach.jpg";
  const displayPrice = item.sale_price || item.original_price || 0;
  const hasDiscount =
    !!item.original_price && item.original_price > (item.sale_price || 0);

  return (
    <article className="group relative isolate flex h-[250px] w-full max-w-[560px] min-w-0 overflow-hidden rounded-[20px] border border-blue-100 bg-white shadow-[0_10px_28px_rgba(29,78,216,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(29,78,216,0.15)] max-sm:h-[310px] max-sm:flex-col">
      <Link
        href={item.link || `/tours/${item.tour_id}`}
        aria-label={`Đặt tour ${item.name}`}
        className="absolute inset-0 z-10 rounded-[20px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
      />
      <div className="relative h-full w-[36%] shrink-0 overflow-hidden max-sm:h-32 max-sm:min-h-0 max-sm:w-full">
        <img
          src={imageUrl}
          alt={item.name || "Tour nội địa"}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-slate-950/10" />
        {item.discount_percent ? (
          <span className="absolute left-4 top-2.5 inline-flex items-center gap-1 rounded-full border border-rose-500/80 bg-white/40 px-2.5 py-1 text-xs font-extrabold text-rose-600 shadow-lg shadow-rose-900/10 backdrop-blur-lg">
            −{item.discount_percent}%
          </span>
        ) : (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-extrabold text-blue-700 shadow-lg backdrop-blur-sm">
            Tour nổi bật
          </span>
        )}
        <FavoriteButton
          active={favorite}
          loading={pending}
          onClick={handleFavoriteClick}
          className={`absolute right-4 top-2.5 z-20 flex h-9 w-9 items-center justify-center rounded-full shadow-lg backdrop-blur-lg transition hover:scale-105 ${favorite ? "bg-rose-500/70 text-white" : "bg-white/45 text-rose-500 hover:bg-white/60"}`}
          iconClassName="h-4 w-4"
          label={favorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
        />
        <div className="absolute bottom-3 left-3 max-w-[80%] truncate rounded-full bg-slate-950/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
          {item.departure_name || "Khám phá Việt Nam"}
        </div>
      </div>

      <div className="relative flex min-w-0 flex-1 flex-col justify-between overflow-hidden bg-[radial-gradient(ellipse_at_100%_20%,#e7f0ff_0%,transparent_35%),linear-gradient(135deg,#fff_40%,#f8fbff_100%)] px-2.5 pb-2.5 pt-1.5 sm:px-3 sm:pb-3 sm:pt-2">
        <div
          className="pointer-events-none absolute -right-4 bottom-3 select-none text-[64px] font-black leading-none text-blue-100/35"
          aria-hidden="true"
        >
          ✦
        </div>
        <div className="relative">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 ring-1 ring-blue-100">
              <MapPin className="h-3 w-3" /> Trong nước
            </span>
            <Link
              href={item.link || `/tours/${item.tour_id}`}
              aria-label={`Xem chi tiết ${item.name}`}
              className="relative z-20 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-slate-500 transition hover:bg-blue-100 hover:text-blue-700"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Link>
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
