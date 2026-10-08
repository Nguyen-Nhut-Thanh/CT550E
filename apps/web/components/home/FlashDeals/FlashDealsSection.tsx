"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getFlashDeals } from "@/lib/client/api/flashDeals";
import type { FlashDealItem } from "shared";
import FlashDealCard from "./FlashDealCard";
import FlashDealCardSkeleton from "./FlashDealCardSkeleton";

export default function FlashDealsSection() {
  const [items, setItems] = useState<FlashDealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const sliderRef = useRef<HTMLDivElement | null>(null);

  const updateScrollState = () => {
    const el = sliderRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxScrollLeft - 4);
  };

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getFlashDeals(20);

        if (!active) return;
        setItems(response.items);
      } catch (err) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Không tải được dữ liệu ưu đãi.",
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

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    updateScrollState();

    const handleScroll = () => updateScrollState();
    const handleResize = () => updateScrollState();

    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const timeout = window.setTimeout(() => {
      updateScrollState();
    }, 100);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.clearTimeout(timeout);
    };
  }, [items, loading]);

  const scrollSlider = (direction: "left" | "right") => {
    const el = sliderRef.current;
    if (!el) return;

    const cardWidth = 326;
    const gap = 24;
    const amount = cardWidth + gap;

    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="bg-[#eef8ff] px-4 py-4 sm:px-6 lg:px-20">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div className="space-y-4">
            <div className="relative inline-block">
              <h2 className="text-3xl font-black uppercase tracking-tight text-[#0f5cab] sm:text-4xl">
                ƯU ĐÃI GIỜ CHÓT
              </h2>
              <span className="absolute -bottom-2 left-0 h-[4px] w-16 rounded-full bg-[#0f5cab]" />
            </div>

            <p className="max-w-2xl text-base font-medium text-slate-700 sm:text-lg">
              Nhanh tay nắm bắt cơ hội giảm giá cuối cùng. Đặt ngay để không bỏ
              lỡ!
            </p>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => scrollSlider("left")}
              disabled={!canScrollLeft}
              className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md transition ${
                canScrollLeft
                  ? "text-slate-700 hover:-translate-y-0.5 hover:text-slate-900"
                  : "cursor-not-allowed text-slate-300"
              }`}
              aria-label="Cuộn sang trái"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              type="button"
              onClick={() => scrollSlider("right")}
              disabled={!canScrollRight}
              className={`flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md transition ${
                canScrollRight
                  ? "text-slate-700 hover:-translate-y-0.5 hover:text-slate-900"
                  : "cursor-not-allowed text-slate-300"
              }`}
              aria-label="Cuộn sang phải"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <FlashDealCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-sky-100 bg-white px-5 py-6 text-center text-slate-600 shadow-sm">
            Hiện chưa có tour ưu đãi giờ chót.
          </div>
        ) : (
          <>
            <div
              ref={sliderRef}
              className="flash-deals-slider flex gap-6 overflow-x-auto scroll-smooth pb-3"
              style={{
                msOverflowStyle: "none",
                scrollbarWidth: "none",
              }}
            >
              {items.map((item) => (
                <FlashDealCard key={item.schedule_id} item={item} />
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <Link
                href="/tours?deal=flash"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-[#0f5cab] px-8 text-lg font-bold text-[#0f5cab] transition hover:bg-[#0f5cab] hover:text-white"
              >
                Xem tất cả
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
