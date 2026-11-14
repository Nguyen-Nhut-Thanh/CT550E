"use client";

import { useFavoriteTours } from "@/lib/favorites/useFavoriteTours";
import { useToast } from "@/lib/notifications/useToast";
import { formatDate } from "@/lib/utils/dateTime";
import { Compass, Globe, Heart, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { AccountFavoritesTabProps, FavFilterType, FavItem } from "shared";
import { FavoriteTourCard } from "./FavoriteTourCard";

export function AccountFavoritesTab({ favorites = [] }: AccountFavoritesTabProps) {
  const [filterType, setFilterType] = useState<FavFilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toggleFavorite } = useFavoriteTours();
  const toast = useToast();
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const rawList: FavItem[] = useMemo(() => {
    if (favorites && favorites.length > 0) {
      return favorites.map((fav) => {
        const t = fav.tours;
        const tourId = fav.tour_id || t?.tour_id;
        const name = t?.name || "Tour du lịch";
        const location = t?.departure_locations?.name || "Việt Nam";
        const rating = t?.rating_avg ? Number(t.rating_avg) : 4.8;
        const reviewsCount = t?.rating_count ? Number(t.rating_count) : 0;
        const price = t?.base_price ? Number(t.base_price) : 2990000;
        const duration = t?.duration_days
          ? `${t.duration_days} ngày ${t.duration_nights || t.duration_days - 1} đêm`
          : "3 ngày 2 đêm";
        const type: "domestic" | "international" =
          t?.tour_type === "international" ? "international" : "domestic";
        const image =
          t?.tour_images?.[0]?.image_url ||
          "/images/shared/travel-cover.png";
        const startDate = t?.tour_schedules?.[0]?.start_date;
        const savedDate = fav.created_at
          ? formatDate(fav.created_at)
          : formatDate(new Date());
        const quota = t?.tour_schedules?.[0]?.quota;
        const guestCount = quota ? `2 – ${quota} khách` : "2 – 30 khách";

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
          startDate,
          savedDate,
          guestCount,
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

    // Filter by tour type
    if (filterType === "domestic") {
      result = result.filter((item) => item.type === "domestic");
    } else if (filterType === "international") {
      result = result.filter((item) => item.type === "international");
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeList, filterType, searchQuery]);

  const handleToggleFavorite = async (tourId: number, tourName: string) => {
    setRemovingId(tourId);
    try {
      const result = await toggleFavorite(tourId);
      if (result.ok && result.action === "removed") {
        setRemovedIds((prev) => [...prev, tourId]);
        toast.success(`Đã bỏ "${tourName}" khỏi danh sách yêu thích.`);
      } else if (!result.ok) {
        toast.error(result.message);
      }
    } catch {
      toast.error("Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* FULL SCENIC HERO BANNER (Tràn viền, không đóng khung, hiển thị hình phong cảnh trọn vẹn) */}
      <div className="relative -mx-4 -mt-4 overflow-hidden sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8">
        {/* Full Landscape Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/about/travel-dreams-banner.png"
            alt="Scenic background"
            fill
            priority
            className="object-cover object-[center_28%]"
          />
          {/* Subtle bottom fade - toned down to keep the full landscape and water crystal clear */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent 85% to-[#f6f8fb]/40" />
        </div>

        {/* Content Container (Aligned with main content width, reduced height for compact elegance) */}
        <div className="relative z-10 mx-auto max-w-[1240px] px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 lg:px-8 flex flex-col justify-between min-h-[165px] sm:min-h-[185px]">
          {/* Top Row: Title & Subtitle + Airplane + Handwritten Script Quote */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-3.5">
              {/* Rounded Heart Icon Badge */}
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#dbeafe]/90 text-[#1766c2] shadow-xs backdrop-blur-xs">
                <Heart className="h-6 w-6 text-[#1766c2] stroke-[2.3]" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  Tour yêu thích
                </h1>
                <p className="mt-0.5 text-xs font-medium text-slate-700 sm:text-sm">
                  Lưu lại những hành trình bạn yêu thích để dễ dàng xem lại và đặt tour trong tương lai!
                </p>
              </div>
            </div>

            {/* Right: Airplane & Script Quote */}
            <div className="hidden shrink-0 items-center gap-4 md:flex lg:gap-6">
              <svg
                className="h-8 w-8 -rotate-12 text-slate-600/80 transition-transform duration-300 hover:translate-x-1 hover:-translate-y-1"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>

              <div className="text-right -rotate-2">
                <p className="font-serif text-xs font-bold italic leading-tight text-sky-900 sm:text-sm">
                  Khám phá thêm
                </p>
                <p className="font-serif text-xs font-bold italic leading-tight text-sky-900 sm:text-sm">
                  những chuyến đi tuyệt vời!
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Controls Row: Filter Tabs & Search Bar */}
          <div className="mt-5 sm:mt-6 lg:mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Tất cả */}
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-xs ${
                  filterType === "all"
                    ? "bg-[#1766c2] text-white shadow-sm ring-2 ring-white/60"
                    : "bg-white/90 text-slate-700 backdrop-blur-md hover:bg-white hover:text-slate-900"
                }`}
              >
                <Heart
                  className={`h-3.5 w-3.5 ${
                    filterType === "all" ? "fill-white text-white" : "text-slate-500"
                  }`}
                />
                <span>Tất cả ({activeList.length})</span>
              </button>

              {/* Trong nước */}
              <button
                type="button"
                onClick={() => setFilterType("domestic")}
                className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-xs ${
                  filterType === "domestic"
                    ? "bg-[#1766c2] text-white shadow-sm ring-2 ring-white/60"
                    : "bg-white/90 text-slate-700 backdrop-blur-md hover:bg-white hover:text-slate-900"
                }`}
              >
                <Compass
                  className={`h-3.5 w-3.5 ${
                    filterType === "domestic" ? "text-white" : "text-slate-500"
                  }`}
                />
                <span>Trong nước ({domesticCount})</span>
              </button>

              {/* Nước ngoài */}
              <button
                type="button"
                onClick={() => setFilterType("international")}
                className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-xs ${
                  filterType === "international"
                    ? "bg-[#1766c2] text-white shadow-sm ring-2 ring-white/60"
                    : "bg-white/90 text-slate-700 backdrop-blur-md hover:bg-white hover:text-slate-900"
                }`}
              >
                <Globe
                  className={`h-3.5 w-3.5 ${
                    filterType === "international" ? "text-white" : "text-slate-500"
                  }`}
                />
                <span>Nước ngoài ({internationalCount})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tour yêu thích..."
                className="w-full rounded-full border border-white/80 bg-white/95 py-2.5 pl-9 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-xs backdrop-blur-md transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1766c2]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Xóa tìm kiếm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Cards (2 columns on tablet/desktop, matching the design sample) */}
      {filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/80 px-6 py-16 text-center shadow-xs">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500 shadow-xs">
            <Heart className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery
              ? `Không tìm thấy tour nào khớp với "${searchQuery}"`
              : filterType === "all"
              ? "Chưa có tour yêu thích nào"
              : filterType === "domestic"
              ? "Chưa có tour trong nước yêu thích nào"
              : "Chưa có tour nước ngoài yêu thích nào"}
          </h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            {searchQuery
              ? "Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc để xem tất cả."
              : "Khám phá các tour du lịch hấp dẫn và nhấn biểu tượng trái tim để lưu lại hành trình mơ ước của bạn!"}
          </p>
          <Link
            href="/tours"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1766c2] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
          >
            Khám phá tour ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:gap-4 md:grid-cols-2">
          {filteredList.map((item) => (
            <FavoriteTourCard
              key={item.tour_id}
              item={item}
              onToggleFavorite={handleToggleFavorite}
              isRemoving={removingId === item.tour_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
