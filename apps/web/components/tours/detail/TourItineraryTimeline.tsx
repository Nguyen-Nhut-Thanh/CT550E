"use client";

import { CalendarDays, MapPin, Utensils } from 'lucide-react';
import { useId, useState } from 'react';
import type { ItineraryActivity, TourItineraryTimelineProps } from 'shared';
import { ImageWithFallback } from '@/components/common/media/ImageWithFallback';

export default function TourItineraryTimeline({ itineraries = [] }: TourItineraryTimelineProps) {
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [activeEvent, setActiveEvent] = useState<number | null>(null);
  const id = useId();
  const days = [...itineraries].sort((a, b) => a.day_number - b.day_number);
  const currentDay = days.find(day => day.day_number === activeDay) || days[0];
  const events: ItineraryActivity[] = currentDay?.activities?.length
    ? [...currentDay.activities].sort((a, b) => a.time.localeCompare(b.time))
    : currentDay ? [{ time: '', title: currentDay.title, description: currentDay.content }] : [];
  const initialEvent = Math.max(0, events.findIndex(event => event.location?.location_images?.length));
  const selectedIndex = activeEvent != null && events[activeEvent] ? activeEvent : initialEvent;
  const selected = events[selectedIndex];
  const photo = selected?.location?.location_images?.[0]?.image_url;

  return <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6" aria-labelledby={`${id}-heading`}>
    <h2 id={`${id}-heading`} className="flex items-center gap-2 text-xl font-bold text-slate-900"><CalendarDays className="h-5 w-5 text-sky-600" />Lịch trình chi tiết</h2>
    {!currentDay ? <p className="py-4 text-sm text-slate-500">Lịch trình chi tiết đang được cập nhật cho tour này.</p> : <>
      <div role="tablist" aria-label="Ngày trong hành trình" className="flex gap-2 overflow-x-auto border-b border-slate-100 pb-1">
        {days.map((day, index) => {
          const selected = day.day_number === currentDay.day_number;
          return <button key={day.day_number} id={`${id}-day-${day.day_number}`} role="tab" aria-selected={selected} aria-controls={`${id}-panel`} tabIndex={selected ? 0 : -1} type="button"
            onClick={() => { setActiveDay(day.day_number); setActiveEvent(null); }}
            onKeyDown={event => {
              let next = index;
              if (event.key === 'ArrowRight') next = (index + 1) % days.length;
              else if (event.key === 'ArrowLeft') next = (index - 1 + days.length) % days.length;
              else if (event.key === 'Home') next = 0;
              else if (event.key === 'End') next = days.length - 1;
              else return;
              event.preventDefault(); setActiveDay(days[next].day_number); setActiveEvent(null);
              document.getElementById(`${id}-day-${days[next].day_number}`)?.focus();
            }}
            className={`min-w-36 flex-1 shrink-0 rounded-t-xl border border-b-2 px-4 py-3 text-left transition-colors ${selected ? 'border-slate-200 border-b-sky-600 bg-sky-50/40 text-sky-700' : 'border-slate-100 border-b-transparent text-slate-700 hover:bg-slate-50'}`}>
            <span className="block text-sm font-bold">Ngày {day.day_number}</span>
            <span className="mt-1 block max-w-44 truncate text-xs text-slate-500" title={day.title}>{day.title}</span>
          </button>;
        })}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-day-${currentDay.day_number}`} className="grid min-w-0 grid-cols-1 items-start gap-5 pt-1 md:grid-cols-[1.3fr_1fr]">
        <div>
          <ol className="relative ml-2 border-l border-slate-200">
            {events.map((event, index) => <li key={index} className="relative pb-5 last:pb-0">
              <span aria-hidden="true" className={`absolute -left-[6px] top-3 h-[11px] w-[11px] rounded-full border-2 ${index === selectedIndex ? 'border-sky-600 bg-sky-600 ring-4 ring-sky-100' : 'border-slate-300 bg-white'}`} />
              <button type="button" onClick={() => setActiveEvent(index)} aria-pressed={index === selectedIndex} className="grid w-full grid-cols-[3.25rem_1fr] gap-2 rounded-lg py-1 pl-5 text-left hover:bg-sky-50/50 focus-visible:outline-2 focus-visible:outline-sky-600 sm:grid-cols-[3.5rem_1fr]">
                <span className={`pt-0.5 text-xs font-bold tabular-nums ${index === selectedIndex ? 'text-sky-700' : 'text-slate-700'}`}>{event.time || 'Chi tiết'}</span>
                <span className="min-w-0 border-l border-slate-200 pl-3">
                  <span className="block text-sm font-bold text-slate-900">{event.title}</span>
                  <span className="mt-1 block whitespace-pre-line text-xs leading-6 text-slate-500 sm:text-sm">{event.description}</span>
                </span>
              </button>
            </li>)}
          </ol>
          {currentDay.activities?.length && currentDay.content ? <p className="mt-5 whitespace-pre-line text-sm leading-6 text-slate-600">{currentDay.content}</p> : null}
          {currentDay.meals && <p className="mt-5 flex items-start gap-2 text-xs text-slate-500"><Utensils className="h-4 w-4 shrink-0 text-orange-500" />Bữa ăn: {currentDay.meals}</p>}
        </div>
        <figure className="relative overflow-hidden rounded-2xl bg-slate-100 md:sticky md:top-24">
          {photo ? <ImageWithFallback src={photo} alt={selected.location?.name || selected.title} className="aspect-[4/3] w-full object-cover" />
            : <div className="flex aspect-[4/3] flex-col items-center justify-center gap-3 px-6 text-center text-slate-400"><MapPin className="h-9 w-9" /><p className="text-sm">{selected?.location ? 'Ảnh địa điểm đang được cập nhật' : 'Chọn điểm tham quan để xem hình ảnh'}</p></div>}
          <figcaption className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-lg bg-slate-900/75 px-2.5 py-1.5 text-xs font-semibold text-white"><MapPin className="h-3 w-3 shrink-0" />{selected?.location?.name || selected?.title}</figcaption>
        </figure>
      </div>
    </>}
  </section>;
}
