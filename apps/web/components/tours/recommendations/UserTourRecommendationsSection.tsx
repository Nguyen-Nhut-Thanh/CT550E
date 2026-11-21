"use client";

import { RecommendedTourCard } from "@/components/tour_cards/recommended/UserRecommendedTourCard";
import { RecommendedTourCardSkeleton } from "@/components/tour_cards/recommended/UserRecommendedTourCardSkeleton";
import { requestJson } from "@/lib/http/requestJson";
import { getUserSignals, saveUserSignals, SIGNALS_CHANGED_EVENT, SIGNALS_STORAGE_KEY } from "@/lib/hooks/userBehaviorSignals";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { TourRecommendationItem, TourRecommendationsResponse } from "shared";

export function TourRecommendationsSection() {
  const [items, setItems] = useState<TourRecommendationItem[]>([]);
  const [basis, setBasis] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasFilters, setHasFilters] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let controller: AbortController | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      const signals = getUserSignals();
      setHasFilters(Boolean(signals.applied_filters));
      setLoading(true);
      setError(false);
      setItems([]);
      try {
        const result = await requestJson<TourRecommendationsResponse>("/ai/recommendations", {
          method: "POST", authMode: "auth", body: signals, signal: request.signal,
        });
        if (request.signal.aborted) return;
        setItems(result.recommendations || []);
        setBasis(result.basis || "Các hành trình đang mở bán");
      } catch {
        if (!request.signal.aborted) setError(true);
      } finally {
        if (!request.signal.aborted) setLoading(false);
      }
    };
    const refresh = () => {
      // Invalidate in-flight results as soon as the identity or signals change.
      controller?.abort();
      clearTimeout(timer);
      timer = setTimeout(() => void load(), 150);
    };
    const storageChanged = (event: StorageEvent) => {
      if (event.key === null || [SIGNALS_STORAGE_KEY, "user_token", "journitrip_favorites_sync"].includes(event.key)) refresh();
    };
    window.addEventListener("auth-change", refresh);
    window.addEventListener("favorites-change", refresh);
    window.addEventListener(SIGNALS_CHANGED_EVENT, refresh);
    window.addEventListener("storage", storageChanged);
    void load();
    return () => {
      controller?.abort();
      clearTimeout(timer);
      window.removeEventListener("auth-change", refresh);
      window.removeEventListener("favorites-change", refresh);
      window.removeEventListener(SIGNALS_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", storageChanged);
    };
  }, [attempt]);

  useEffect(() => {
    const element = sliderRef.current;
    if (!element) return;
    const update = () => {
      setCanScrollLeft(!loading && element.scrollLeft > 4);
      setCanScrollRight(!loading && element.scrollLeft < element.scrollWidth - element.clientWidth - 4);
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer.disconnect();
    };
  }, [items, loading]);

  const scroll = (direction: "left" | "right") => {
    const element = sliderRef.current;
    if (!element) return;
    const card = element.querySelector<HTMLElement>("article");
    const amount = (card?.getBoundingClientRect().width || 560) + 16;
    element.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  const personalized = items.some(item => item.is_personalized);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 px-3 py-1 text-xs font-bold text-blue-700 shadow-2xs">
            <Sparkles size={13} className="text-amber-500 animate-pulse" />
            <span>{personalized ? "Gợi ý theo hoạt động của bạn" : "Gợi ý khám phá"}</span>
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {personalized ? "Tour dành riêng cho hành trình của bạn" : "Khám phá hành trình tiếp theo của bạn"}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            {error ? "Chưa thể tải gợi ý lúc này." : basis}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <Link
            href="/tours"
            className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline"
          >
            Khám phá tất cả tour →
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Cuộn tour gợi ý sang trái"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition hover:-translate-y-0.5 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:translate-y-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Cuộn tour gợi ý sang phải"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-700 shadow-md transition hover:-translate-y-0.5 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:translate-y-0"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {!loading && error && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          Chưa tải được các tour gợi ý.
          <button type="button" onClick={() => setAttempt(value => value + 1)} className="ml-2 font-semibold text-blue-700 hover:underline">Thử lại</button>
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          {hasFilters ? "Chưa có tour còn chỗ khớp bộ lọc tìm kiếm gần đây của bạn." : "Hiện chưa có tour còn chỗ và còn hạn đăng ký."}
        </p>
      )}
      {!loading && hasFilters && !error && (
        <button type="button" onClick={() => saveUserSignals({ applied_filters: undefined })} className="mb-4 mt-3 text-sm font-semibold text-blue-700 hover:underline">
          Xóa bộ lọc gợi ý để khám phá thêm tour
        </button>
      )}

      <div
        ref={sliderRef}
        role="region"
        aria-label="Danh sách tour gợi ý"
        tabIndex={0}
        className="grid auto-cols-[100%] grid-flow-col grid-rows-2 gap-4 overflow-x-auto overflow-y-hidden scroll-smooth px-1 pt-3 pb-6 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 [&::-webkit-scrollbar]:hidden sm:auto-cols-[560px]"
      >
        {loading
          ? Array.from({ length: 8 }, (_, index) => <RecommendedTourCardSkeleton key={index} />)
          : items.map(tour => <RecommendedTourCard key={tour.tour_id} tour={tour} subtitle={basis || undefined} />)}
      </div>
    </section>
  );
}

