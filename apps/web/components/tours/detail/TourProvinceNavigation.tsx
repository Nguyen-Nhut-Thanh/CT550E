"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Province = { id: number; name: string; count: number };

export function TourProvinceNavigation({ provinces, selectedId, onSelect }: {
  provinces: Province[];
  selectedId: number;
  onSelect: (id: number) => void;
}) {
  const [canScroll, setCanScroll] = useState({ left: false, right: false });
  const trackRef = useRef<HTMLDivElement>(null);

  const updateScroll = () => {
    const track = trackRef.current;
    if (track) setCanScroll({ left: track.scrollLeft > 2, right: track.scrollLeft + track.clientWidth < track.scrollWidth - 2 });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(updateScroll);
    observer.observe(track);
    updateScroll();
    return () => observer.disconnect();
  }, [provinces.length]);

  useEffect(() => {
    const track = trackRef.current;
    const button = track?.querySelector<HTMLButtonElement>(`[data-province-id="${selectedId}"]`);
    if (!track || !button) return;
    const left = button.offsetLeft;
    const right = left + button.offsetWidth;
    if (left < track.scrollLeft) track.scrollTo({ left, behavior: "smooth" });
    else if (right > track.scrollLeft + track.clientWidth) track.scrollTo({ left: right - track.clientWidth, behavior: "smooth" });
  }, [selectedId]);

  const scroll = (direction: number) => {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  };

  const arrowClass = "mb-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-sky-300 hover:text-sky-600 focus-visible:outline-2 focus-visible:outline-sky-600 disabled:cursor-default disabled:opacity-30";

  return <nav aria-label="Tỉnh/thành trong tour" className="flex items-center gap-2 border-b border-slate-100">
      <button type="button" aria-label="Xem các tỉnh/thành phía trước" disabled={!canScroll.left} onClick={() => scroll(-1)} className={arrowClass}><ChevronLeft size={16} /></button>
      <div ref={trackRef} onScroll={updateScroll} className="no-scrollbar relative flex min-w-0 flex-1 snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain">
        {provinces.map((province, index) => {
          const active = province.id === selectedId;
          return <button key={province.id} data-province-id={province.id} type="button" aria-pressed={active} onClick={() => onSelect(province.id)} title={province.name} className={`relative flex min-w-0 basis-[calc((100%-0.5rem)/2)] shrink-0 snap-start items-center gap-2 rounded-t-lg px-1 pb-4 pt-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500 @[500px]/destinations:basis-[calc((100%-1rem)/3)] @[700px]/destinations:basis-[calc((100%-2rem)/5)] ${active ? "text-sky-600" : "text-slate-950 hover:text-sky-600"}`}>
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${active ? "bg-sky-600 text-white shadow-sm shadow-sky-200" : "border border-slate-200 bg-white text-slate-500"}`}>{index + 1}</span>
            <span className="min-w-0"><span className="block truncate text-xs font-bold">{province.name}</span><span className={`mt-1 block whitespace-nowrap text-[10px] ${active ? "text-sky-600" : "text-slate-500"}`}>{province.count} điểm tham quan</span></span>
            {active && <span aria-hidden="true" className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-sky-500" />}
          </button>;
        })}
      </div>
      <button type="button" aria-label="Xem các tỉnh/thành tiếp theo" disabled={!canScroll.right} onClick={() => scroll(1)} className={arrowClass}><ChevronRight size={16} /></button>
  </nav>;
}
