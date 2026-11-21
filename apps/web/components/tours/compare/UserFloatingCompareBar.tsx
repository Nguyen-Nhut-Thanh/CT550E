"use client";

import { useTourCompare } from "@/lib/hooks/useTourCompare";
import { useUserBehaviorTracker } from "@/lib/hooks/useUserBehavior";
import { formatVND } from "@/lib/utils/currency";
import { Scale, Sparkles, Trash2, X } from "lucide-react";
import { useState } from "react";
import { TourComparisonModal } from "./UserTourComparisonModal";

export function FloatingCompareBar() {
  useUserBehaviorTracker();
  const { tours, count, removeTour, clearTours } = useTourCompare();
  const [modalOpen, setModalOpen] = useState(false);

  if (count === 0) return null;

  const canCompare = count >= 2;

  return (
    <>
      <aside
        aria-label="Thanh so sánh tour"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[110] flex w-[min(94vw,560px)] items-center justify-between gap-3 rounded-full border border-blue-200/90 bg-white/95 px-4 py-2.5 shadow-[0_12px_36px_rgba(29,78,216,0.22)] backdrop-blur-md animate-in slide-in-from-bottom-6 duration-200"
      >
        {/* Thumbnails list */}
        <div className="flex items-center gap-2 overflow-x-auto min-w-0 flex-1 py-0.5">
          {tours.map((tour) => (
            <div
              key={tour.tour_id}
              className="group relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-blue-200 bg-slate-100 shadow-2xs"
              title={tour.name}
            >
              <img
                src={tour.image_url || "/images/shared/default-tour-beach.jpg"}
                alt={tour.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                aria-label={`Bỏ tour ${tour.name}`}
                onClick={() => removeTour(tour.tour_id)}
                className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-white opacity-0 transition group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {/* Empty slot placeholder */}
          {Array.from({ length: 3 - count }).map((_, i) => (
            <div
              key={i}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50 text-[10px] text-slate-400"
              title="Thêm tour để so sánh"
            >
              +
            </div>
          ))}

          <span className="ml-1 hidden sm:inline text-xs font-semibold text-slate-700 whitespace-nowrap">
            {count}/3 tour
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={clearTours}
            title="Xóa tất cả"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <Trash2 size={15} />
          </button>

          <button
            type="button"
            disabled={!canCompare}
            onClick={() => setModalOpen(true)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-white shadow-md transition ${
              canCompare
                ? "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:scale-105 active:scale-95"
                : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
            }`}
          >
            <Sparkles size={14} className={canCompare ? "text-amber-300 animate-pulse" : ""} />
            <span>So sánh bằng AI ({count}/3)</span>
          </button>
        </div>
      </aside>

      <TourComparisonModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tourIds={tours.map((t) => t.tour_id)}
      />
    </>
  );
}
