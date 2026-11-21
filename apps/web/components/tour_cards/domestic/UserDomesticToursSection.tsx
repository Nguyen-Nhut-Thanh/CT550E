"use client";

import { DomesticTourCard } from "@/components/tour_cards/domestic/UserDomesticTourCard";
import DomesticTourCardSkeleton from "@/components/tour_cards/domestic/UserDomesticTourCardSkeleton";
import { getPublicTours } from "@/lib/tours/client/api";
import { ArrowRight, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FlashDealItem, PublicTourCard } from "shared";

function toCardItem(tour: PublicTourCard): FlashDealItem | null {
  const schedule = tour.next_schedule;
  if (!schedule) return null;
  const originalPrice = schedule.original_price ?? schedule.price;
  const discountPercent =
    originalPrice > schedule.price
      ? Math.round(((originalPrice - schedule.price) / originalPrice) * 100)
      : null;

  return {
    schedule_id: schedule.tour_schedule_id,
    tour_id: tour.tour_id,
    code: tour.code,
    name: tour.name,
    slug: "",
    image_url: tour.cover_image,
    cover_image_url: schedule.cover_image_url || tour.cover_image,
    departure_name:
      schedule.departure_location?.name ||
      tour.departure_location?.name ||
      "Đang cập nhật",
    start_date: schedule.start_date,
    end_date: schedule.end_date,
    duration_text: `${tour.duration_days} ngày ${tour.duration_nights} đêm`,
    summary: tour.summary,
    original_price: originalPrice,
    sale_price: schedule.price,
    seats_left: Math.max(0, schedule.quota - schedule.booked_count),
    discount_percent: discountPercent,
    countdown_to: "",
    link: `/tours/${tour.tour_id}`,
    transport_name: tour.transport?.name || null,
    transport_type: tour.transport?.type || null,
    promotion_info: null,
    rating_avg: tour.rating_avg,
    rating_count: tour.rating_count,
  };
}

export default function DomesticToursSection() {
  const [items, setItems] = useState<FlashDealItem[]>([]);
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
        const response = await getPublicTours({
          tour_type: "domestic",
          collection: "nearest",
          take: 10,
          skip: 0,
        });
        if (!active) return;
        setItems(
          response.items
            .map(toCardItem)
            .filter((item): item is FlashDealItem => item !== null),
        );
      } catch (cause) {
        if (!active) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Không tải được tour trong nước.",
        );
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const element = sliderRef.current;
    if (!element) return;
    const update = () => {
      const maxScroll = element.scrollWidth - element.clientWidth;
      setCanScrollLeft(element.scrollLeft > 4);
      setCanScrollRight(element.scrollLeft < maxScroll - 4);
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const timeout = window.setTimeout(update, 100);
    return () => {
      element.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.clearTimeout(timeout);
    };
  }, [items, loading]);

  const scroll = (direction: "left" | "right") => {
    const element = sliderRef.current;
    if (!element) return;
    const card = element.querySelector<HTMLElement>("article");
    const amount = (card?.getBoundingClientRect().width || 400) + 16;
    element.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="relative overflow-hidden bg-[#dce8fb] px-4 pt-10 pb-2 sm:px-6 sm:pt-12 sm:pb-2.5 lg:px-20 lg:pb-2.5">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="relative mx-auto max-w-[1280px]">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[2px] text-sky-700 sm:text-sm">
              <Compass className="h-4 w-4" /> Khám phá Việt Nam
            </p>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Tour du lịch nội địa
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Chọn hành trình phù hợp và khám phá những điểm đến tuyệt đẹp trên
              khắp Việt Nam.
            </p>
          </div>
          <div className="hidden shrink-0 items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Cuộn tour nội địa sang trái"
              className={`flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition ${canScrollLeft ? "text-slate-700 hover:-translate-y-0.5 hover:text-sky-700" : "cursor-not-allowed text-slate-300"}`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Cuộn tour nội địa sang phải"
              className={`flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md transition ${canScrollRight ? "text-slate-700 hover:-translate-y-0.5 hover:text-sky-700" : "cursor-not-allowed text-slate-300"}`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid auto-cols-[100%] grid-flow-col grid-rows-2 gap-4 overflow-hidden sm:auto-cols-[560px]">
            {Array.from({ length: 8 }).map((_, index) => (
              <DomesticTourCardSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-sky-100 bg-white px-5 py-6 text-center text-slate-600 shadow-sm">
            Hiện chưa có tour nội địa khả dụng.
          </div>
        ) : (
          <div
            ref={sliderRef}
            className="grid auto-cols-[100%] grid-flow-col grid-rows-2 gap-4 overflow-x-auto overflow-y-hidden scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:auto-cols-[560px]"
          >
            {items.map((item) => (
              <DomesticTourCard key={item.schedule_id} item={item} />
            ))}
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <Link
            href="/tours?type=domestic"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-sky-700 bg-white/80 backdrop-blur-sm px-7 text-sm font-bold text-sky-700 shadow-sm transition hover:bg-sky-700 hover:text-white"
          >
            Khám phá tour nội địa <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
