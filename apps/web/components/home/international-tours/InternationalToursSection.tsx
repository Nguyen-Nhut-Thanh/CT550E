"use client";

import { getPublicTours } from "@/lib/tours/api";
import { ArrowRight, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicTourCard } from "shared";
import { InternationalTourCard } from "./InternationalTourCard";
import InternationalTourCardSkeleton from "./InternationalTourCardSkeleton";

export default function InternationalToursSection() {
  const [items, setItems] = useState<PublicTourCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const sliderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await getPublicTours({ tour_type: "outbound", collection: "nearest", take: 10, skip: 0 });
        if (active) setItems(response.items);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Không tải được tour nước ngoài.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const updateScrollState = useCallback(() => {
    const element = sliderRef.current;
    if (!element) return;
    const maxScroll = element.scrollWidth - element.clientWidth;
    setCanScrollLeft(element.scrollLeft > 4);
    setCanScrollRight(element.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    const element = sliderRef.current;
    if (!element) return;
    updateScrollState();
    element.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    const timeout = window.setTimeout(updateScrollState, 100);
    return () => {
      element.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
      window.clearTimeout(timeout);
    };
  }, [items, loading, updateScrollState]);

  const scroll = (direction: "left" | "right") => {
    const element = sliderRef.current;
    if (!element) return;
    const card = element.querySelector<HTMLElement>("article");
    const amount = (card?.getBoundingClientRect().width || 560) + 16;
    element.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#edf5ff_100%)] px-4 py-12 sm:px-6 lg:px-20">
      <div className="pointer-events-none absolute -left-24 top-8 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="relative mx-auto max-w-[1280px]">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[2px] text-blue-700 sm:text-sm">
              <Compass className="h-4 w-4" /> Vươn ra thế giới
            </p>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">Tour du lịch nước ngoài</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">Khám phá những điểm đến nổi tiếng thế giới cùng hành trình trọn vẹn.</p>
          </div>
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <button type="button" onClick={() => scroll("left")} disabled={!canScrollLeft} aria-label="Cuộn tour nước ngoài sang trái" className={`flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition ${canScrollLeft ? "text-slate-700 hover:-translate-y-0.5 hover:text-blue-700" : "cursor-not-allowed text-slate-300"}`}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => scroll("right")} disabled={!canScrollRight} aria-label="Cuộn tour nước ngoài sang phải" className={`flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition ${canScrollRight ? "text-slate-700 hover:-translate-y-0.5 hover:text-blue-700" : "cursor-not-allowed text-slate-300"}`}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid auto-cols-[560px] grid-flow-col grid-rows-2 gap-4 overflow-hidden">
            {Array.from({ length: 10 }, (_, index) => <InternationalTourCardSkeleton key={index} />)}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-blue-100 bg-white px-5 py-6 text-center text-slate-600 shadow-sm">Hiện chưa có tour nước ngoài khả dụng.</div>
        ) : (
          <div ref={sliderRef} className="grid auto-cols-[560px] grid-flow-col grid-rows-2 gap-4 overflow-x-auto overflow-y-hidden scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {items.map(tour => <InternationalTourCard key={tour.next_schedule?.tour_schedule_id ?? tour.tour_id} tour={tour} />)}
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="mt-6 flex justify-center">
            <Link href="/tours?type=international" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-700 px-7 text-sm font-bold text-blue-700 transition hover:bg-blue-700 hover:text-white">
              Khám phá tour nước ngoài <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
