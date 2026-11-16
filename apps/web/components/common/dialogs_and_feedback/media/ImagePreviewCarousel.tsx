"use client";

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function ImagePreviewCarousel({ images, disabled, onRemove }: { images: string[]; disabled: boolean; onRemove: (index: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ first: 1, previous: false, next: images.length > 2 });
  const updatePosition = () => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.firstElementChild as HTMLElement | null;
    const step = slide ? slide.offsetWidth + 12 : track.clientWidth;
    setPosition({ first: Math.max(1, Math.round(track.scrollLeft / step) + 1), previous: track.scrollLeft > 1, next: track.scrollLeft < track.scrollWidth - track.clientWidth - 1 });
  };
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    observer.observe(track);
    return () => observer.disconnect();
  }, [images.length]);
  const move = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * (track.clientWidth + 12), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };
  return <div>
    <div ref={trackRef} className="grid [grid-auto-flow:column] [grid-auto-columns:calc((100%_-_12px)_/_2)] min-w-0 overflow-x-auto overscroll-x-contain [scroll-snap-type:x_mandatory] [scrollbar-width:thin] [scrollbar-color:#b8cbed_transparent] pb-[5px] gap-3 focus-visible:[outline:2px_solid_#60a5fa] focus-visible:[outline-offset:3px] focus-visible:rounded-[12px]" role="region" aria-label="Ảnh tour đã chọn" tabIndex={0} onScroll={updatePosition} onKeyDown={event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1); }
    }}>
      {images.map((url, index) => <div key={index} className="relative min-w-0 [aspect-ratio:4_/_3] overflow-hidden snap-start rounded-[12px] bg-[#eff4fb] border border-[#dae5f3] border-solid">
        <img src={url} alt={`Ảnh tour ${index + 1}`} className="w-full h-full object-cover" />
        <button type="button" disabled={disabled} aria-label={`Xóa ảnh ${index + 1}`} className="absolute top-1.5 right-1.5 grid place-items-center w-[25px] h-[25px] rounded-full bg-[#ffffffec] text-[#64748b] shadow-[0_1px_5px_#0f172a20] border border-[#ffffffc9] border-solid hover:bg-[#fff1f2] hover:text-[#e11d48] disabled:cursor-wait disabled:opacity-[.5]" onClick={() => onRemove(index)}><X size={14} /></button>
        {index === 0 && <span className="absolute bottom-1.5 left-1.5 rounded-[6px] bg-[#ffffffed] text-[10px] font-bold text-[#2563eb] px-1.5 py-[3px]">Ảnh bìa</span>}
      </div>)}
    </div>
    <div className="flex items-center justify-between mt-2 gap-3">
      <span className="text-[12px] text-[#7a8ba6] tabular-nums" aria-live="polite">{Math.min(position.first, images.length)}–{Math.min(position.first + 1, images.length)} / {images.length} ảnh</span>
      <div className="flex gap-1.5">
        <button type="button" className="grid place-items-center w-[29px] h-[29px] rounded-[9px] bg-[#fff] text-[#3975d6] border border-[#dce6f4] border-solid hover:bg-[#eff6ff] hover:border-[#93b9f4] disabled:cursor-default disabled:bg-[#f8fafc] disabled:opacity-[.4]" disabled={!position.previous} aria-label="Xem ảnh bên trái" onClick={() => move(-1)}><ChevronLeft size={17} /></button>
        <button type="button" className="grid place-items-center w-[29px] h-[29px] rounded-[9px] bg-[#fff] text-[#3975d6] border border-[#dce6f4] border-solid hover:bg-[#eff6ff] hover:border-[#93b9f4] disabled:cursor-default disabled:bg-[#f8fafc] disabled:opacity-[.4]" disabled={!position.next} aria-label="Xem ảnh bên phải" onClick={() => move(1)}><ChevronRight size={17} /></button>
      </div>
    </div>
  </div>;
}
