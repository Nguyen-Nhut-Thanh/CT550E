"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Camera,
  ChevronRight,
  Heart,
  Luggage,
  MapPin,
  Star,
} from "lucide-react";
import type { AccountBooking, AccountStats, FavoriteTourItem, UserProfile } from "shared";
import { formatVND } from "@/lib/client/utils/utils";

interface AccountOverviewProps {
  user: UserProfile | null;
  stats: AccountStats | null;
  bookings: AccountBooking[];
  favorites: FavoriteTourItem[];
  loading: boolean;
  setActiveTab: (tab: string) => void;
}

export function AccountOverview({ stats, bookings = [], favorites = [], loading, setActiveTab }: AccountOverviewProps) {
  const statItems = [
    {
      icon: CalendarDays,
      value: stats?.totalBookings ?? bookings.length ?? 0,
      label: "Tour đã đặt",
      tab: "bookings",
      iconClass: "text-[#1766c2]",
      iconBg: "bg-white/90",
      image: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=500",
    },
    {
      icon: Heart,
      value: stats?.totalFavorites ?? favorites.length ?? 0,
      label: "Tour yêu thích",
      tab: "favorites",
      iconClass: "text-rose-500 fill-rose-500",
      iconBg: "bg-white/90",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=500",
    },
    {
      icon: Star,
      value: stats?.totalReviews ?? 0,
      label: "Đánh giá đã viết",
      tab: "reviews",
      iconClass: "text-amber-400 fill-amber-400",
      iconBg: "bg-white/90",
      image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=500",
    },
    {
      icon: Camera,
      value: stats?.totalPhotos ?? 0,
      label: "Ảnh đã chia sẻ",
      tab: "photos",
      iconClass: "text-[#1766c2]",
      iconBg: "bg-white/90",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=500",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveTab(item.tab)}
              className="group relative h-[132px] overflow-hidden rounded-[15px] bg-slate-100 text-left shadow-[0_2px_12px_rgba(15,23,42,0.05)]"
            >
              <Image
                src={item.image}
                alt={item.label}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="220px"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/62 to-white/5" />
              <div className="absolute inset-0 p-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${item.iconBg} shadow-sm`}>
                  <Icon className={`h-4 w-4 ${item.iconClass}`} />
                </div>
                <div className="mt-3 text-[24px] font-black leading-none text-slate-900">
                  {loading ? "—" : item.value}
                </div>
                <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                  <span>{item.label}</span>
                  <span className="transition group-hover:translate-x-0.5">→</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <section className="rounded-[14px] border border-slate-100 bg-white p-4 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Luggage className="h-5 w-5 text-[#1766c2]" />
            <h2 className="text-[17px] font-bold text-slate-900">Chuyến đi gần đây</h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#1766c2]"
          >
            Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Bạn chưa có đơn đặt tour nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {bookings.slice(0, 3).map((booking) => {
              const tourName = booking.tour_schedules?.tours?.name || `Đơn hàng #${booking.booking_id}`;
              const imageUrl = booking.tour_schedules?.tours?.tour_images?.[0]?.image_url;
              const startDate = booking.tour_schedules?.start_date;

              return (
                <article key={booking.booking_id} className="overflow-hidden rounded-[12px] border border-slate-100 bg-white">
                  <div className="relative h-[128px] overflow-hidden bg-slate-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={tourName}
                        fill
                        className="object-cover"
                        sizes="300px"
                      />
                    ) : null}
                    <span className="absolute left-3 top-3 rounded-full bg-emerald-50/95 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">
                      {booking.status || "Thành công"}
                    </span>
                  </div>

                  <div className="px-2.5 pb-2.5 pt-2">
                    <h3 className="text-[13px] font-bold text-slate-900 line-clamp-1">{tourName}</h3>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                      <CalendarDays className="h-3 w-3" />
                      {startDate ? new Date(startDate).toLocaleDateString("vi-VN") : "Chưa xác định"}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab("bookings")}
                      className="mt-2 w-full rounded-md bg-[#f3f8ff] py-2 text-[10px] font-semibold text-[#1766c2] transition hover:bg-blue-100"
                    >
                      Xem chi tiết →
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-[14px] border border-slate-100 bg-white p-4 shadow-[0_2px_14px_rgba(15,23,42,0.04)]">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
            <h2 className="text-[15px] font-bold text-slate-900">Tour yêu thích</h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("favorites")}
            className="flex items-center gap-1 text-[11px] font-semibold text-[#1766c2]"
          >
            Xem tất cả <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {favorites.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            Bạn chưa có tour yêu thích nào.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {favorites.slice(0, 4).map((fav) => {
              const tourObj = fav.tours;
              const tourId = fav.tour_id || tourObj?.tour_id;
              const tourName = tourObj?.name || "Tour";
              const imageUrl = tourObj?.tour_images?.[0]?.image_url;
              const depLoc = tourObj?.departure_locations?.name;
              const priceVal = tourObj?.base_price ? Number(tourObj.base_price) : 0;

              return (
                <Link key={tourId} href={`/tours/${tourId}`} className="group min-w-0">
                  <div className="relative h-[86px] overflow-hidden rounded-[10px] bg-slate-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={tourName}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="220px"
                      />
                    ) : null}
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                      <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
                    </span>
                  </div>
                  <h3 className="mt-2 truncate text-[12px] font-bold text-slate-900">{tourName}</h3>
                  {depLoc ? (
                    <div className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-400">
                      <MapPin className="h-2.5 w-2.5" />
                      <span className="truncate">{depLoc}</span>
                    </div>
                  ) : null}
                  <p className="mt-1 text-[12px] font-extrabold text-[#255786]">{formatVND(priceVal)}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
