"use client";

import { useFavoriteTours } from "@/lib/favorites/useFavoriteTours";
import { useToast } from "@/lib/notifications/useToast";
import { formatDate } from "@/lib/utils/dateTime";
import { Heart, Search, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { AccountFavoritesTabProps, FavFilterType, FavItem } from "shared";
import { AccountPageBanner } from "@/components/banners/account_banner/UserAccountPageBanner";
import { FavoriteTourCard } from "@/components/tour_cards/favorite/UserFavoriteTourCard";

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
        const schedule = t?.tour_schedules?.[0];
        const rating = t?.rating_avg != null ? Number(t.rating_avg) : 0;
        const reviewsCount = Number(t?.rating_count ?? 0);
        const basePrice = Number(t?.base_price ?? 0);
        const price = Number(schedule?.price ?? basePrice);
        const scheduleOriginalPrice = Number(schedule?.original_price ?? 0);
        const originalPrice = scheduleOriginalPrice > price
          ? scheduleOriginalPrice
          : basePrice > price ? basePrice : undefined;
        const duration = t?.duration_days
          ? `${t.duration_days} ngày ${t.duration_nights || t.duration_days - 1} đêm`
          : "Đang cập nhật";
        const type: "domestic" | "international" =
          t?.tour_type === "outbound" || t?.tour_type === "international" ? "international" : "domestic";
        const image =
          schedule?.cover_image_url ||
          t?.tour_images?.[0]?.image_url ||
          "/images/shared/travel-cover.png";
        const startDate = t?.status === 1 && schedule?.start_date
          ? schedule.start_date
          : undefined;
        const savedDate = fav.created_at
          ? formatDate(fav.created_at)
          : formatDate(new Date());
        const hasVisibleSchedule = t?.status === 1 && Boolean(schedule);
        const seatsLeft = hasVisibleSchedule && schedule?.quota != null
          ? Math.max(0, Number(schedule.quota) - Number(schedule.booked_count ?? 0))
          : undefined;

        return {
          tour_id: tourId,
          name,
          location,
          summary: t?.summary,
          rating,
          reviewsCount,
          price,
          duration,
          type,
          image,
          startDate,
          savedDate,
          airline: t?.transports?.name,
          seatsLeft,
          originalPrice,
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
    <div className="w-full min-w-0 space-y-6">
      <AccountPageBanner
        title="Tour yêu thích"
        description="Lưu lại những hành trình bạn yêu thích để dễ dàng xem lại và đặt tour trong tương lai!"
        icon={Heart}
        filterAriaLabel="Lọc tour yêu thích"
        activeFilter={filterType}
        onFilterChange={(value) => setFilterType(value as FavFilterType)}
        filters={[
          { value: "all", label: `Tất cả (${activeList.length})` },
          { value: "domestic", label: `Trong nước (${domesticCount})` },
          { value: "international", label: `Nước ngoài (${internationalCount})` },
        ]}
        search={
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm tour yêu thích..."
              className="w-full rounded-full border border-slate-200/90 bg-white/95 py-2 pl-9 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Xóa tìm kiếm"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        }
      />

      {/* Thẻ tour ngang theo mẫu tham khảo */}
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
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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
