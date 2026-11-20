"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Utensils,
} from "lucide-react";
import { useId, useState } from "react";
import type { ItineraryActivity, TourItineraryTimelineProps } from "shared";
import { ImageWithFallback } from "@/components/common/dialogs_and_feedback/media/ImageWithFallback";

export default function TourItineraryTimeline({
  itineraries = [],
  durationDays,
  durationNights,
}: TourItineraryTimelineProps) {
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [activeEvent, setActiveEvent] = useState<number | null>(null);
  const id = useId();
  const days = [...itineraries].sort((a, b) => a.day_number - b.day_number);
  const currentDay =
    days.find((day) => day.day_number === activeDay) || days[0];
  const currentDayIndex = currentDay
    ? days.findIndex((day) => day.day_number === currentDay.day_number)
    : -1;
  const totalDays = durationDays ?? days.length;
  const totalNights = durationNights ?? Math.max(totalDays - 1, 0);
  const events: ItineraryActivity[] = currentDay?.activities?.length
    ? [...currentDay.activities].sort((a, b) => a.time.localeCompare(b.time))
    : currentDay
      ? [{ time: "", title: currentDay.title, description: currentDay.content }]
      : [];

  const selectedIndex =
    activeEvent != null && events[activeEvent] ? activeEvent : 0;
  const selected = events[selectedIndex];

  // Ưu tiên ảnh minh họa của ngày (currentDay.image_url), fallback ảnh điểm tham quan nếu có
  const photo =
    currentDay?.image_url ||
    selected?.location?.location_images?.[0]?.image_url ||
    (selected?.location as { featured_image?: string | null } | undefined)
      ?.featured_image ||
    events.find((e) => e.location?.location_images?.[0]?.image_url)?.location
      ?.location_images?.[0]?.image_url;

  const displayTitle =
    currentDay?.title || selected?.title || "Hình ảnh lịch trình";

  return (
    <section
      className="space-y-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6"
      aria-labelledby={`${id}-heading`}
    >
      <div className="flex min-w-0 items-center justify-between gap-3">
        <h2
          id={`${id}-heading`}
          className="flex items-center gap-2 text-lg font-bold text-slate-900 sm:text-xl"
        >
          <CalendarDays className="h-5 w-5 shrink-0 text-sky-600" />
          Lịch trình chi tiết
        </h2>
        <span className="shrink-0 text-sm font-medium text-slate-500">
          {totalDays} ngày · {totalNights} đêm
        </span>
      </div>
      {!currentDay ? (
        <p className="py-4 text-sm text-slate-500">
          Lịch trình chi tiết đang được cập nhật cho tour này.
        </p>
      ) : (
        <>
          <div className="flex min-w-0 items-center justify-between gap-4 border-y border-slate-100 py-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <button
                type="button"
                aria-label={
                  currentDayIndex > 0
                    ? `Quay lại ngày ${days[currentDayIndex - 1].day_number}`
                    : "Đã là ngày đầu tiên"
                }
                disabled={currentDayIndex <= 0}
                onClick={() => {
                  setActiveDay(days[currentDayIndex - 1].day_number);
                  setActiveEvent(null);
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-sky-50 hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3
                className="min-w-0 truncate text-base font-bold text-slate-800 sm:text-lg"
                title={currentDay.title || undefined}
              >
                Ngày {currentDay.day_number}
                {currentDay.title ? ` – ${currentDay.title}` : ""}
              </h3>
            </div>
            <button
              type="button"
              aria-label={
                currentDayIndex < days.length - 1
                  ? `Chuyển đến ngày ${days[currentDayIndex + 1].day_number}`
                  : "Đã là ngày cuối cùng"
              }
              disabled={currentDayIndex >= days.length - 1}
              onClick={() => {
                setActiveDay(days[currentDayIndex + 1].day_number);
                setActiveEvent(null);
              }}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-sky-50 hover:text-sky-700 focus-visible:outline-2 focus-visible:outline-sky-600 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="grid min-w-0 grid-cols-1 items-start gap-5 pt-1 md:grid-cols-[1.3fr_1fr]">
            <div>
              <ol className="relative ml-2 border-l border-slate-200">
                {events.map((event, index) => (
                  <li key={index} className="relative pb-5 last:pb-0">
                    <span
                      aria-hidden="true"
                      className={`absolute -left-[6px] top-3 h-[11px] w-[11px] rounded-full border-2 ${index === selectedIndex ? "border-sky-600 bg-sky-600 ring-4 ring-sky-100" : "border-slate-300 bg-white"}`}
                    />
                    <button
                      type="button"
                      onClick={() => setActiveEvent(index)}
                      aria-pressed={index === selectedIndex}
                      className="grid w-full grid-cols-[3.25rem_1fr] gap-2 rounded-lg py-1 pl-5 text-left hover:bg-sky-50/50 focus-visible:outline-2 focus-visible:outline-sky-600 sm:grid-cols-[3.5rem_1fr]"
                    >
                      <span
                        className={`pt-0.5 text-xs font-bold tabular-nums ${index === selectedIndex ? "text-sky-700" : "text-slate-700"}`}
                      >
                        {event.time || "Chi tiết"}
                      </span>
                      <span className="min-w-0 border-l border-slate-200 pl-3">
                        <span className="block text-sm font-bold text-slate-900">
                          {event.title}
                        </span>
                        <span className="mt-1 block whitespace-pre-line text-xs leading-6 text-slate-500 sm:text-sm">
                          {event.description}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              {currentDay.activities?.length && currentDay.content ? (
                <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-600">
                  {currentDay.content}
                </p>
              ) : null}
              {currentDay.meals && (
                <p className="mt-5 flex items-start gap-2 text-xs text-slate-500">
                  <Utensils className="h-4 w-4 shrink-0 text-orange-500" />
                  Bữa ăn: {currentDay.meals}
                </p>
              )}
            </div>
            <figure className="relative mb-0 overflow-hidden rounded-2xl bg-slate-100 md:mb-8 md:w-full md:-translate-x-3 md:justify-self-end md:self-end">
              {photo ? (
                <ImageWithFallback
                  src={photo}
                  alt={displayTitle}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 px-6 text-center text-slate-400">
                  <ImageIcon className="h-9 w-9 text-slate-300" />
                  <p className="text-sm">Ảnh lịch trình đang được cập nhật</p>
                </div>
              )}
            </figure>
          </div>
        </>
      )}
    </section>
  );
}
