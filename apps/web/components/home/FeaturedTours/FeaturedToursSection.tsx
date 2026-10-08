"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedTours } from "@/lib/client/api/featuredTours";
import type { FeaturedTourItem } from "shared";
import FeaturedTourCard from "./FeaturedTourCard";
import FeaturedTourCardSkeleton from "./FeaturedTourCardSkeleton";

export default function FeaturedToursSection() {
  const [items, setItems] = useState<FeaturedTourItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getFeaturedTours(8);

        if (!active) return;
        setItems(response?.items || []);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error
            ? err.message
            : "Không tải được tour bán chạy.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#dff0ff] px-4 py-14 sm:px-6 lg:px-10 xl:px-16">
      {/* Họa tiết trang trí SVG nét đứt ở góc dưới bên trái */}
      <div className="pointer-events-none absolute bottom-0 left-0 h-44 w-44 opacity-20">
        <svg viewBox="0 0 240 240" className="h-full w-full">
          <path
            d="M10 210C45 150 80 130 120 120C150 110 175 90 210 35"
            fill="none"
            stroke="#334155"
            strokeWidth="2"
            strokeDasharray="4 6"
          />
          <path
            d="M20 230C40 180 55 150 85 130"
            fill="none"
            stroke="#334155"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Header của Section */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[2px] text-red-500">
              Tour bán chạy
            </p>

            <h2 className="text-3xl font-black leading-tight text-slate-900 md:text-4xl">
              Hành trình được yêu thích
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Khám phá những tour đang có nhu cầu cao nhất, được xếp hạng từ lịch khởi
              hành khả dụng kết hợp số lượt đặt và số khách đã đi.
            </p>
          </div>

          <Link
            href="/tours?collection=bestseller"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
          >
            Xem tất cả tour
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Danh sách các tour bán chạy */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <FeaturedTourCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-sky-100 bg-white px-5 py-6 text-center text-slate-600 shadow-sm">
            Hiện chưa có tour bán chạy.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <FeaturedTourCard key={item.schedule_id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
