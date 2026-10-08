"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, Hash, Hotel } from "lucide-react";
import FavoriteButton from "@/components/common/FavoriteButton";
import { useToast } from "@/components/common/Toast";
import TransportIcon from "@/components/common/TransportIcon";
import { useFavoriteTours } from "@/lib/client/hooks/useFavoriteTours";
import { getTransportLabel } from "@/lib/client/utils/tourDisplay";
import { formatDate, formatVND, normalizeImageSrc } from "@/lib/client/utils/utils";
import type { FeaturedTourItem } from "shared";

type FeaturedTourCardProps = {
  item: FeaturedTourItem;
};

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200";

export default function FeaturedTourCard({ item }: FeaturedTourCardProps) {
  const router = useRouter();
  const toast = useToast();
  const { isFavorite, isPending, toggleFavorite } = useFavoriteTours();

  const imageUrl =
    normalizeImageSrc(item.cover_image_url || item.image_url) ||
    PLACEHOLDER_IMAGE;

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
    <Link
      href={item.link || `/tours/${item.tour_id}`}
      className="group block h-[250px] w-full bg-transparent [perspective:1200px]"
    >
      <div className="relative h-full w-full rounded-[18px] transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Mặt trước của Card */}
        <div className="absolute inset-0 flex h-full w-full flex-col justify-between overflow-hidden rounded-[18px] border border-white/70 bg-white p-5 text-left shadow-[0_14px_34px_rgba(15,23,42,0.10)] [backface-visibility:hidden]">
          <div className="flex items-start justify-between gap-3">
            <h3 className="truncate text-[15px] font-extrabold uppercase tracking-tight text-slate-900">
              {item.route_text}
            </h3>

            <FavoriteButton
              active={isFavorite(item.tour_id)}
              loading={isPending(item.tour_id)}
              onClick={handleFavoriteClick}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm transition-colors ${
                isFavorite(item.tour_id)
                  ? "bg-rose-500 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500"
              }`}
              iconClassName="h-4.5 w-4.5"
              label={
                isFavorite(item.tour_id)
                  ? "Bỏ khỏi yêu thích"
                  : "Thêm vào yêu thích"
              }
            />
          </div>

          <div className="space-y-3 text-[14px] text-slate-700">
            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <Hash className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="shrink-0 font-semibold text-slate-800">Mã:</span>
              <span className="truncate">{item.code}</span>
            </div>

            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="shrink-0 font-semibold text-slate-800">
                Khởi hành:
              </span>
              <span className="truncate">{formatDate(item.start_date)}</span>
            </div>

            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <Hotel className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="shrink-0 font-semibold text-slate-800">
                Khách sạn:
              </span>
              <span className="truncate">{item.hotel_name || "Tiêu chuẩn"}</span>
            </div>

            <div className="flex items-center gap-x-2 overflow-hidden whitespace-nowrap">
              <TransportIcon
                type={item.transport_type}
                className="h-4 w-4 shrink-0 text-slate-400"
              />
              <span className="shrink-0 font-semibold text-slate-800">
                Phương tiện:
              </span>
              <span className="truncate">
                {item.transport_type
                  ? getTransportLabel(item.transport_type)
                  : "Đang cập nhật"}
              </span>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 pt-3">
            <div className="ml-auto text-right">
              <p className="text-[13px] font-semibold text-slate-700">Giá từ</p>
              <p className="text-[16px] font-black text-red-600 sm:text-[18px]">
                {formatVND(item.price)}
                <span className="ml-1 text-slate-800">/ khách</span>
              </p>
            </div>
          </div>
        </div>

        {/* Mặt sau của Card (khi lật 3D) */}
        <div className="absolute inset-0 overflow-hidden rounded-[18px] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-black/15" />

          <div className="absolute left-4 top-4 z-10">
            <FavoriteButton
              active={isFavorite(item.tour_id)}
              loading={isPending(item.tour_id)}
              onClick={handleFavoriteClick}
              className={`flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur-md transition-colors ${
                isFavorite(item.tour_id)
                  ? "bg-rose-500 text-white"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              iconClassName="h-4.5 w-4.5"
              label={
                isFavorite(item.tour_id)
                  ? "Bỏ khỏi yêu thích"
                  : "Thêm vào yêu thích"
              }
            />
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <p className="w-full truncate px-2 text-sm font-extrabold text-white opacity-90">
              {item.name}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
