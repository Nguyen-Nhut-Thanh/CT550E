"use client";

import Link from "next/link";
import Image from "next/image";
import { Award, ArrowUpRight, Star, ShoppingBag, DollarSign } from "lucide-react";
import type { DashboardTopTour } from "@/lib/admin/dashboardApi";
import { formatVND, normalizeImageSrc, PLACEHOLDER_IMAGE } from "@/lib/utils";

interface DashboardTopToursProps {
  topTours: DashboardTopTour[];
}

export function DashboardTopTours({ topTours }: DashboardTopToursProps) {
  if (!topTours || topTours.length === 0) {
    return (
      <div className="rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm">
        <h2 className="text-base font-black tracking-tight text-slate-900">
          Tour Bán Chạy Nhất
        </h2>
        <p className="mt-4 text-center text-xs text-slate-400">
          Chưa có dữ liệu tour bán chạy trong kỳ này.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Award size={18} />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-slate-900">
              Tour Bán Chạy Nhất
            </h2>
            <p className="text-xs font-medium text-slate-400">
              Xếp hạng theo lượt đặt & doanh thu
            </p>
          </div>
        </div>

        <Link
          href="/admin/tours"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="mt-4 divide-y divide-slate-100">
        {topTours.map((tour, idx) => {
          const imageSrc =
            normalizeImageSrc(tour.featuredImage) || PLACEHOLDER_IMAGE;

          return (
            <div
              key={tour.tourId}
              className="group flex items-center justify-between gap-2 py-2.5 first:pt-1 last:pb-1"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Ranking number badge */}
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                    idx === 0
                      ? "bg-amber-100 text-amber-800"
                      : idx === 1
                      ? "bg-slate-200 text-slate-700"
                      : idx === 2
                      ? "bg-amber-50 text-amber-900"
                      : "bg-slate-50 text-slate-500"
                  }`}
                >
                  {idx + 1}
                </span>

                {/* Tour thumbnail */}
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  <Image
                    src={imageSrc}
                    alt={tour.name}
                    fill
                    sizes="44px"
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                {/* Tour title & code */}
                <div className="min-w-0">
                  <Link
                    href={`/admin/tours/${tour.tourId}`}
                    className="truncate block text-xs font-bold text-slate-900 transition-colors group-hover:text-blue-600"
                    title={tour.name}
                  >
                    {tour.name}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono font-bold text-slate-600">
                      {tour.code}
                    </span>
                    <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                      <Star size={11} fill="currentColor" />
                      {tour.rating?.toFixed(1) || "5.0"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Revenue & bookings count */}
              <div className="text-right shrink-0">
                <p className="text-xs font-black text-slate-900">
                  {formatVND(tour.revenue)}
                </p>
                <p className="text-[11px] font-semibold text-emerald-600">
                  {tour.bookingsCount} lượt đặt
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
