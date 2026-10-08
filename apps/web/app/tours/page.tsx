"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPublicTours } from "@/lib/client/api/tourApi";
import { trackRecommendationEvent } from "@/lib/client/utils/recommendationTracker";
import { getTourPriceValue } from "@/lib/client/utils/tourDisplay";
import type { PublicTourCard, PublicToursResponse } from "shared";
import {
  TourCard,
  TourEmptyState,
  TourFilterSidebar,
  TourListSkeleton,
  TourSortControl,
} from "@/components/tours";

function getTourPrice(tour: PublicTourCard) {
  return getTourPriceValue(tour.base_price, tour.next_schedule?.price);
}

function ToursContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<PublicToursResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [keyword, setKeyword] = useState(searchParams.get("search") || "");
  const [destination, setDestination] = useState(
    searchParams.get("destination") ||
      searchParams.get("location") ||
      searchParams.get("country") ||
      "",
  );
  const [dateFrom, setDateFrom] = useState(searchParams.get("date_from") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [tourType, setTourType] = useState(
    searchParams.get("type") || searchParams.get("tour_type") || "all",
  );
  const [duration, setDuration] = useState(
    searchParams.get("duration") || "all",
  );
  const [collection, setCollection] = useState(
    searchParams.get("collection") || "",
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("collection") === "bestseller" ? "bestseller" : "nearest",
  );

  const query = useMemo(
    () => ({
      search: searchParams.get("search") || "",
      destination:
        searchParams.get("destination") ||
        searchParams.get("location") ||
        searchParams.get("country") ||
        "",
      departure_location: searchParams.get("departure_location") || "",
      date_from: searchParams.get("date_from") || "",
      min_price: searchParams.get("min_price") || "",
      max_price: searchParams.get("max_price") || "",
      collection: searchParams.get("collection") || "",
      deal: searchParams.get("deal") || "",
      take: "20",
      skip: "0",
    }),
    [searchParams],
  );

  useEffect(() => {
    setKeyword(searchParams.get("search") || "");
    setDestination(
      searchParams.get("destination") ||
        searchParams.get("location") ||
        searchParams.get("country") ||
        "",
    );
    setDateFrom(searchParams.get("date_from") || "");
    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
    setTourType(
      searchParams.get("type") || searchParams.get("tour_type") || "all",
    );
    setDuration(searchParams.get("duration") || "all");
    setCollection(searchParams.get("collection") || "");
    setSortBy(
      searchParams.get("collection") === "bestseller"
        ? "bestseller"
        : "nearest",
    );
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError("");
        const result = await getPublicTours(query);
        if (!isMounted) return;
        setData(result);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [query]);

  const items = useMemo(() => {
    if (!data?.items) return [];

    let filtered = [...data.items];

    // Filter by Tour Type
    if (tourType === "domestic") {
      filtered = filtered.filter(
        (t) => t.tour_type === "domestic" || !t.tour_type,
      );
    } else if (tourType === "international") {
      filtered = filtered.filter((t) => t.tour_type === "international");
    }

    // Filter by Duration
    if (duration === "1-3") {
      filtered = filtered.filter(
        (t) => t.duration_days >= 1 && t.duration_days <= 3,
      );
    } else if (duration === "4-7") {
      filtered = filtered.filter(
        (t) => t.duration_days >= 4 && t.duration_days <= 7,
      );
    } else if (duration === "8+") {
      filtered = filtered.filter((t) => t.duration_days >= 8);
    }

    if (sortBy === "bestseller") {
      return filtered;
    }

    if (sortBy === "price-asc") {
      filtered.sort((a, b) => getTourPrice(a) - getTourPrice(b));
    } else if (sortBy === "price-desc") {
      filtered.sort((a, b) => getTourPrice(b) - getTourPrice(a));
    } else {
      filtered.sort((a, b) => {
        const aTime = a.next_schedule?.start_date
          ? new Date(a.next_schedule.start_date).getTime()
          : Number.MAX_SAFE_INTEGER;
        const bTime = b.next_schedule?.start_date
          ? new Date(b.next_schedule.start_date).getTime()
          : Number.MAX_SAFE_INTEGER;

        return aTime - bTime;
      });
    }

    return filtered;
  }, [data, sortBy, tourType, duration]);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (keyword.trim()) params.set("search", keyword.trim());
    if (destination.trim()) params.set("destination", destination.trim());
    if (dateFrom) params.set("date_from", dateFrom);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (tourType && tourType !== "all") params.set("type", tourType);
    if (duration && duration !== "all") params.set("duration", duration);
    if (collection) params.set("collection", collection);

    const queryString = params.toString();
    router.push(`/tours${queryString ? `?${queryString}` : ""}`);
  };

  const handleTourClick = (tour: PublicTourCard) => {
    void trackRecommendationEvent({
      event_type: "tour_click",
      source: "tour_list",
      tour_id: tour.tour_id,
      destination: tour.destinations?.[0]?.name || undefined,
      metadata: {
        price: getTourPrice(tour),
        duration_days: tour.duration_days,
        departure_location: tour.departure_location?.name || null,
      },
    });
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
        {/* Sidebar Bộ lọc */}
        <TourFilterSidebar
          keyword={keyword}
          setKeyword={setKeyword}
          destination={destination}
          setDestination={setDestination}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          tourType={tourType}
          setTourType={setTourType}
          duration={duration}
          setDuration={setDuration}
          onApplyFilters={applyFilters}
          totalResults={items.length}
        />

        {/* Danh sách các tour & Sort Controls */}
        <section className="min-w-0 flex-1 space-y-6">
          <TourSortControl
            totalResults={data?.total ?? 0}
            sortBy={sortBy}
            setSortBy={setSortBy}
            showBestsellerOption={collection === "bestseller"}
          />

          {loading && <TourListSkeleton />}

          {!loading && error && (
            <div className="rounded-2xl bg-white p-10 text-center text-red-600 shadow-sm">
              {error}
            </div>
          )}

          {!loading && !error && items.length === 0 && <TourEmptyState />}

          {!loading && !error && items.length > 0 && (
            <div className="space-y-4">
              {items.map((tour) => (
                <TourCard
                  key={tour.tour_id}
                  tour={tour}
                  onTourClick={handleTourClick}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function PublicToursPage() {
  return (
    <main className="min-h-full bg-[#f8fafc] px-4 py-8 sm:px-6 lg:px-10">
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl">
            <TourListSkeleton />
          </div>
        }
      >
        <ToursContent />
      </Suspense>
    </main>
  );
}
