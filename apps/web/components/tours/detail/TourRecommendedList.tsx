"use client";

import { useEffect, useState } from "react";
import { Compass, Loader2 } from "lucide-react";
import FeaturedTourCard from "@/components/home/FeaturedTours/FeaturedTourCard";
import { getFeaturedTours } from "@/lib/client/api/featuredTours";
import type { FeaturedTourItem } from "shared";

export default function TourRecommendedList() {
  const [tours, setTours] = useState<FeaturedTourItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadRecommended() {
      try {
        const data = await getFeaturedTours(4);
        if (active && data?.items) {
          setTours(data.items);
        }
      } catch {
        if (active) setTours([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadRecommended();

    return () => {
      active = false;
    };
  }, []);

  if (!loading && tours.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Tour phù hợp với bạn</h3>
            <p className="text-xs text-slate-500">Gợi ý dựa trên sở thích chuyến đi của bạn</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[160px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {tours.map((tour) => (
            <FeaturedTourCard key={tour.tour_id} item={tour} />
          ))}
        </div>
      )}
    </div>
  );
}

