"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import {
  Calendar,
  Clock,
  Hash,
  MapPin,
  Users,
} from "lucide-react";
import FavoriteButton from "@/components/common/FavoriteButton";
import { useToast } from "@/components/common/Toast";
import TransportIcon from "@/components/common/TransportIcon";
import { useCountdown, useFavoriteTours } from "@/lib/client/hooks";
import { formatDate, formatVND, normalizeImageSrc, getTransportLabel } from "@/lib/client/utils";
import type { FlashDealItem } from "shared";

const brandRed = "text-red-600";
const brandRedBorder = "border-red-600";

export default function FlashDealCard({ item }: { item: FlashDealItem }) {
  const router = useRouter();
  const toast = useToast();
  const countdown = useCountdown(
    item.countdown_to || item.end_date || new Date().toISOString(),
  );
  const { isFavorite, isPending, toggleFavorite } = useFavoriteTours();

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
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200";
  const displayPrice = item.sale_price || item.original_price || 0;
  const hasDiscount =
    !!item.original_price && item.original_price > (item.sale_price || 0);

  const handleFavoriteClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const result = await toggleFavorite(item.tour_id);

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
        ? `Đã thêm "${item.name}" vào tour yêu thích.`
        : `Đã bỏ "${item.name}" khỏi tour yêu thích.`,
    );
  };

  return (
    <article className="group w-[280px] flex-shrink-0 overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)] sm:w-[300px] lg:w-[310px]">
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={item.name || "Tour"}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <FavoriteButton
          active={isFavorite(item.tour_id)}
          loading={isPending(item.tour_id)}
          onClick={handleFavoriteClick}
          className={`absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all hover:scale-110 ${
            isFavorite(item.tour_id)
              ? "bg-rose-500 text-white"
              : "bg-black/20 text-white hover:bg-white/25"
          }`}
          iconClassName="h-5 w-5"
          label={
            isFavorite(item.tour_id)
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

          <div
            className={`flex-1 rounded-lg bg-white/80 py-1.5 text-center text-sm font-black ${brandRed} shadow-sm backdrop-blur-sm`}
          >
            {countdownLabel}
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <h3 className="line-clamp-2 h-[56px] text-[17px] font-bold leading-[1.6] text-slate-900 transition-colors group-hover:text-sky-600" title={item.name}>
          {item.name}
        </h3>

        <div className="space-y-3 text-[14px] text-slate-700">
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
              <span
                className={`text-[12px] font-bold italic text-slate-400 ${hasDiscount ? "line-through" : ""}`}
              >
                {formatVND(item.original_price || 0)}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <p
                className={`text-[19px] font-black leading-none ${brandRed} tracking-tighter`}
              >
                {formatVND(displayPrice)}
              </p>
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center pl-2">
            <Link
              href={item.link || `/tours/${item.tour_id}`}
              className={`flex h-[40px] items-center justify-center rounded-xl border-2 ${brandRedBorder} ${brandRed} bg-transparent px-4 text-center text-[12px] font-bold transition-all hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-100 active:scale-95`}
            >
              Đặt ngay
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
