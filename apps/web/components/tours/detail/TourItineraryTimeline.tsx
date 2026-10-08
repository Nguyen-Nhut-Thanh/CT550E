"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, Clock } from "lucide-react";
import type { TourItinerary } from "shared";

type TourItineraryTimelineProps = {
  itineraries?: TourItinerary[];
  durationDays?: number;
};

export default function TourItineraryTimeline({ itineraries }: TourItineraryTimelineProps) {
  const [activeDay, setActiveDay] = useState(1);

  const hasItineraries = itineraries && itineraries.length > 0;

  const daysData = hasItineraries
    ? itineraries.map((it, idx) => ({
        day: it.day_number || idx + 1,
        title: it.title || `Ngày ${idx + 1}`,
        events: [
          { time: "Lịch trình", title: it.title || `Ngày ${idx + 1}`, desc: it.content },
          ...(it.meals ? [{ time: "Bữa ăn", title: "Ẩm thực trong ngày", desc: it.meals }] : []),
        ],
        image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600",
      }))
    : [];

  const currentDayData = daysData.find((d) => d.day === activeDay) || daysData[0];

  if (!hasItineraries) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
            <CalendarDays className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Lịch trình chi tiết</h2>
        </div>
        <p className="text-sm text-slate-500 py-4">Lịch trình chi tiết đang được cập nhật cho tour này.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
          <CalendarDays className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Lịch trình chi tiết</h2>
      </div>

      {/* Day Tabs */}
      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100">
        {daysData.map((d) => {
          const isActive = d.day === activeDay;
          return (
            <button
              key={d.day}
              type="button"
              onClick={() => setActiveDay(d.day)}
              className={`shrink-0 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                isActive
                  ? "bg-sky-600 text-white shadow-md shadow-sky-500/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Ngày {d.day} <span className="font-normal opacity-80">({d.title})</span>
            </button>
          );
        })}
      </div>

      {/* Active Day Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2">
        {/* Timeline Tree */}
        <div className="md:col-span-7 space-y-6 relative pl-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-sky-100">
          {currentDayData.events.map((ev, idx) => (
            <div key={idx} className="relative flex items-start gap-3 group">
              {/* Timeline Dot Node */}
              <div className="absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white border-2 border-sky-600 ring-4 ring-sky-50">
                <div className="h-1.5 w-1.5 rounded-full bg-sky-600" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                    <Clock className="h-3 w-3 text-sky-600" /> {ev.time}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{ev.title}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{ev.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Location Image Preview Card */}
        <div className="md:col-span-5 relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-900 shadow-md group">
          <Image
            src={currentDayData.image}
            alt={currentDayData.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 text-white">
            <p className="text-xs font-bold text-sky-300">Điểm đến nổi bật</p>
            <p className="text-sm font-extrabold">{currentDayData.title}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
