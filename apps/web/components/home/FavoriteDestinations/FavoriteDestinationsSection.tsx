"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  FeaturedDestinationGroup,
  FeaturedDestinationsResponse,
} from "shared";
import { getFeaturedDestinations } from "@/lib/client/api/featuredDestinations";
import DestinationCard from "./DestinationCard";
import DestinationGridSkeleton from "./DestinationGridSkeleton";

export default function FavoriteDestinationsSection() {
  const [regions, setRegions] = useState<FeaturedDestinationGroup[]>([]);
  const [activeRegionKey, setActiveRegionKey] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Refs for smooth tab indicator
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);

        const data: FeaturedDestinationsResponse =
          await getFeaturedDestinations();

        if (!isMounted) return;

        const nextRegions = data?.regions || [];
        setRegions(nextRegions);

        const firstNonEmptyRegion = nextRegions.find(
          (region) => region.items && region.items.length > 0,
        );

        setActiveRegionKey(
          firstNonEmptyRegion?.key || nextRegions[0]?.key || "",
        );
      } catch {
        if (!isMounted) return;

        setRegions([]);
        setActiveRegionKey("");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update indicator position when active tab changes
  useEffect(() => {
    if (!tabsRef.current || !activeRegionKey) return;

    const activeTabElement = tabsRef.current.querySelector(
      `[data-key="${activeRegionKey}"]`,
    ) as HTMLElement;

    if (activeTabElement) {
      setIndicatorStyle({
        left: activeTabElement.offsetLeft,
        width: activeTabElement.offsetWidth,
      });
    }
  }, [activeRegionKey, regions]);

  const activeRegion = useMemo(() => {
    return regions.find((region) => region.key === activeRegionKey) || null;
  }, [regions, activeRegionKey]);

  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-16">
      <div className="mb-10 space-y-3 text-center">
        <h2 className="text-3xl font-bold uppercase tracking-wide text-[#1a2b48]">
          Điểm Đến Yêu Thích
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-gray-500">
          Hãy chọn một điểm đến du lịch nổi bật để khám phá các chuyến đi phù
          hợp với nhu cầu, ngân sách và lịch trình của bạn.
        </p>
      </div>

      <div className="relative mb-12 flex justify-center border-b border-gray-100">
        <div
          ref={tabsRef}
          className="relative flex flex-wrap justify-center gap-4 md:gap-8"
        >
          {regions.map((region) => {
            const isActive = region.key === activeRegionKey;

            return (
              <button
                key={region.key}
                data-key={region.key}
                type="button"
                onClick={() => setActiveRegionKey(region.key)}
                className={`relative pb-4 text-sm font-bold uppercase tracking-wider transition-colors duration-300 outline-none ${
                  isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {region.label}
              </button>
            );
          })}

          {/* Animated Indicator */}
          <div
            className="absolute bottom-0 h-0.5 bg-blue-600 transition-all duration-300 ease-out"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
          />
        </div>
      </div>

      {loading ? (
        <DestinationGridSkeleton />
      ) : activeRegion && activeRegion.items && activeRegion.items.length > 0 ? (
        <div className="max-w-6xl mx-auto grid grid-cols-1 auto-rows-[250px] gap-2 md:grid-cols-9 md:auto-rows-[85px]">
          {activeRegion.items.map((item, index) => (
            <DestinationCard
              key={item.location_id}
              item={item}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-300 px-6 py-12 text-center text-gray-500">
          Hiện chưa có dữ liệu điểm đến để hiển thị.
        </div>
      )}
    </section>
  );
}

