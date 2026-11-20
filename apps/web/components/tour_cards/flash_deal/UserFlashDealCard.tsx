"use client";

import FavoriteButton from "@/components/tour_cards/elements/UserFavoriteButton";
import TransportIcon from "@/components/tour_cards/elements/UserTransportIcon";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { useTourFavorite } from "@/lib/hooks/useTourFavorite";
import { getTransportLabel } from "@/lib/tours/client/display";
import { formatVND } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dateTime";
import { normalizeImageSrc } from "@/lib/utils/images";
import { Calendar, Clock, Hash, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import type { FlashDealItem } from "shared";

export default function FlashDealCard({ item }: { item: FlashDealItem }) {
  const countdown = useCountdown(
    item.countdown_to || item.end_date || new Date().toISOString(),
  );
  const { favorite, pending, handleFavoriteClick } = useTourFavorite(item.tour_id, item.name);

  const countdownLabel = useMemo(() => {
    const d = String(countdown.days).padStart(2, "0");
    const h = String(countdown.hours).padStart(2, "0");
    const m = String(countdown.minutes).padStart(2, "0");
    const s = String(countdown.seconds).padStart(2, "0");

    if (countdown.days > 0) {
      return `${d} ngày ${h}:${m}:${s}`;
    }

    return `${h}:${m}:${s}`;
  }, [countdown.days, countdown.hours, countdown.minutes, countdown.seconds]);

  const imageUrl =
    normalizeImageSrc(item.cover_image_url || item.image_url) ||
    "/images/shared/default-tour-beach.jpg";
  const displayPrice = item.sale_price || item.original_price || 0;
  const hasDiscount =
    !!item.original_price && item.original_price > (item.sale_price || 0);
  const accentText = "text-red-600";
  const accentBorder = "border-red-600";
  const accentHover = "hover:bg-red-600 hover:shadow-red-100";

  return (
    <article className="group relative isolate w-[280px] flex-shrink-0 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)] sm:w-[300px] lg:w-[310px]">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={item.name || "Tour"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <FavoriteButton
          active={favorite}
          loading={pending}
          onClick={handleFavoriteClick}
          className={`absolute left-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all hover:scale-110 ${
            favorite
              ? "bg-rose-500 text-white"
              : "bg-black/20 text-white hover:bg-white/25"
          }`}
          iconClassName="h-5 w-5"
          label={
            favorite
              ? "Bỏ khỏi yêu thích"
              : "Thêm vào yêu thích"
          }
        />

        {item.discount_percent ? (
          <div className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
            -{item.discount_percent}%
          </div>
        ) : null}

        <div className="absolute inset-x-2 bottom-3 flex items-center gap-1.5">
          <div className="flex items-center justify-center gap-1 rounded-lg border border-sky-50 bg-white px-2 py-1.5 text-[12px] font-bold text-sky-600 shadow-md">
            <Clock className="h-3 w-3" />
            <span>Giờ chót</span>
          </div>
          <div className="w-9 shrink-0" />
          <div className={`flex-1 rounded-lg bg-white/80 py-1.5 text-center text-sm font-black ${accentText} shadow-sm backdrop-blur-sm`}>
            {countdownLabel}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <h3 className="line-clamp-2 h-[56px] text-[17px] font-bold leading-[1.6] text-slate-900 transition-colors group-hover:text-sky-600" title={item.name}>
          {item.name}
        </h3>

        <div className="space-y-2.5 text-[14px] text-slate-700">
          <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
            <Hash className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="shrink-0 font-semibold text-slate-800">Mã:</span>
            <span className="truncate font-medium uppercase">{item.code || "—"}</span>
          </div>

          <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="shrink-0 font-semibold text-slate-800">
              Khởi hành:
            </span>
            <span className="truncate font-bold text-sky-600">
              {item.departure_name || "Đang cập nhật"}
            </span>
          </div>

          <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-x-2">
            <div className="flex min-w-0 items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="shrink-0 font-semibold text-slate-800">
                Ngày:
              </span>
              <span className="truncate">{formatDate(item.start_date)}</span>
            </div>

            <div className="flex min-w-0 items-center gap-x-2 overflow-hidden whitespace-nowrap border-l border-slate-100 pl-3">
              <Clock className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{item.duration_text || "Tiêu chuẩn"}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4">
            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <TransportIcon
                type={item.transport_type}
                className="h-3.5 w-3.5 shrink-0 text-slate-500"
              />
              <span className="truncate">
                {item.transport_type
                  ? getTransportLabel(item.transport_type)
                  : "Cập nhật"}
              </span>
            </div>

            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap border-l border-slate-100 pl-4">
              <Users className="h-4 w-4 shrink-0 text-red-400" />
              <span className="font-bold text-red-600">
                Còn {item.seats_left ?? 0} chỗ
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-stretch gap-0 border-t border-slate-100 pt-4">
          <div className="flex flex-1 flex-col justify-center">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500">
                Giá từ:
              </span>
              {hasDiscount && (
                <span className="text-[12px] font-bold italic text-slate-400 line-through">
                  {formatVND(item.original_price || 0)}
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-1">
              <p
                className={`text-[19px] font-black leading-none ${accentText} tracking-tighter`}
              >
                {formatVND(displayPrice)}
              </p>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center pl-2">
            <Link
              href={item.link || `/tours/${item.tour_id}`}
              aria-label={`Đặt tour ${item.name}`}
              className={`flex h-[40px] items-center justify-center rounded-xl border-2 ${accentBorder} ${accentText} bg-transparent px-4 text-center text-[12px] font-bold transition-all ${accentHover} hover:text-white hover:shadow-lg after:absolute after:inset-0 after:z-10 after:rounded-2xl after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-red-600`}
            >
              Đặt ngay
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
