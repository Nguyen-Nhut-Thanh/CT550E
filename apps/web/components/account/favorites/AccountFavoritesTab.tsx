"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Heart, MapPin, Star } from "lucide-react";
import type { FavoriteTourItem } from "shared";
import { formatVND } from "@/lib/client/utils/utils";
import { useFavoriteTours } from "@/lib/client/hooks/useFavoriteTours";
import type {
  AccountFavoritesTabProps,
  FavFilterType,
  FavItem,
  FavSortType,
} from "shared";

export function AccountFavoritesTab({ favorites = [] }: AccountFavoritesTabProps) {
  const [filterType, setFilterType] = useState<FavFilterType>("all");
  const [sortBy, setSortBy] = useState<FavSortType>("newest");
  const { toggleFavorite } = useFavoriteTours();
  const [removedIds, setRemovedIds] = useState<number[]>([]);

  const rawList: FavItem[] = useMemo(() => {
    if (favorites && favorites.length > 0) {
      return favorites.map((fav) => {
        const t = fav.tours;
        const tourId = fav.tour_id || t?.tour_id;
        const name = t?.name || "Tour du lịch";
        const location = t?.departure_locations?.name || "Việt Nam";
        const rating = 4.8;
        const reviewsCount = 126;
        const price = t?.base_price ? Number(t.base_price) : 2990000;
        const duration = t?.duration_days
          ? `${t.duration_days} ngày ${t.duration_nights || t.duration_days - 1} đêm`
          : "3 ngày 2 đêm";
        const type: "domestic" | "international" =
          t?.tour_type === "international" ? "international" : "domestic";
        const image =
          t?.tour_images?.[0]?.image_url ||
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800";

        return {
          tour_id: tourId,
          name,
          location,
          rating,
          reviewsCount,
          price,
          duration,
          type,
          image,
        };
      });
    }

    return [];
  }, [favorites]);

  const activeList = useMemo(() => {
    return rawList.filter((item) => !removedIds.includes(item.tour_id));
  }, [rawList, removedIds]);

  const domesticCount = useMemo(
    () => activeList.filter((item) => item.type === "domestic").length,
    [activeList]
  );
  const internationalCount = useMemo(
    () => activeList.filter((item) => item.type === "international").length,
    [activeList]
  );

  const filteredList = useMemo(() => {
    let result = [...activeList];

    if (filterType === "domestic") {
      result = result.filter((item) => item.type === "domestic");
    } else if (filterType === "international") {
      result = result.filter((item) => item.type === "international");
    }

    if (sortBy === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [activeList, filterType, sortBy]);

  const handleToggleFavorite = async (e: React.MouseEvent, tourId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setRemovedIds((prev) => [...prev, tourId]);
    await toggleFavorite(tourId);
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Tour yêu thích</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Những điểm đến và hành trình bạn quan tâm
        </p>
      </div>

      {/* Filter Tabs & Sort Control */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
              filterType === "all"
                ? "bg-[#1766c2] text-white shadow-sm"
                : "bg-slate-100/90 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất cả ({activeList.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterType("domestic")}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
              filterType === "domestic"
                ? "bg-[#1766c2] text-white shadow-sm"
                : "bg-slate-100/90 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Trong nước ({domesticCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterType("international")}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
              filterType === "international"
                ? "bg-[#1766c2] text-white shadow-sm"
                : "bg-slate-100/90 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Nước ngoài ({internationalCount})
          </button>
        </div>

        {/* Sort Select Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm outline-none transition focus:border-sky-500"
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>
        </div>
      </div>

      {/* Grid of Cards */}
      {filteredList.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
          <Heart className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">Chưa có tour yêu thích nào trong mục này</p>
          <p className="mt-1 text-xs text-slate-500">Khám phá các tour du lịch hấp dẫn và nhấn yêu thích để lưu lại!</p>
          <Link
            href="/tours"
            className="mt-4 inline-block rounded-xl bg-[#1766c2] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
          >
            Khám phá tour ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {filteredList.map((item) => (
            <Link
              key={item.tour_id}
              href={`/tours/${item.tour_id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              {/* Card Image Container */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 360px"
                />

                {/* Top-Left Floating Red Heart Badge */}
                <button
                  type="button"
                  onClick={(e) => handleToggleFavorite(e, item.tour_id)}
                  className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110"
                  aria-label="Xóa khỏi yêu thích"
                >
                  <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
                </button>

                {/* Bottom-Right Duration Overlay Badge */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                  <Clock className="h-3 w-3 text-white/90" />
                  <span>{item.duration}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-4">
                {/* Title */}
                <h3 className="line-clamp-1 text-base font-extrabold text-slate-900 group-hover:text-[#1766c2] transition">
                  {item.name}
                </h3>

                {/* Location */}
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-sky-600">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>

                {/* Rating & Review Count */}
                <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-amber-600">{item.rating}</span>
                  <span className="text-slate-400 font-normal">
                    ({item.reviewsCount} đánh giá)
                  </span>
                </div>

                {/* Price */}
                <div className="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-base font-extrabold text-[#1766c2]">
                    {formatVND(item.price)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
