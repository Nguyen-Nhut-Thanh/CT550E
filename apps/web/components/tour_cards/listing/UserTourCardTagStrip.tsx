"use client";

import { useRef, type ReactNode } from "react";

export default function TourCardTagStrip({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  const drag = useRef<{ pointerId: number; startX: number; scrollLeft: number } | null>(null);

  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={`no-scrollbar flex min-w-0 max-w-full cursor-grab select-none items-center gap-1.5 overflow-x-auto overscroll-x-contain rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600 active:cursor-grabbing ${className}`}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        const strip = event.currentTarget;
        if (strip.scrollWidth <= strip.clientWidth) return;
        drag.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          scrollLeft: strip.scrollLeft,
        };
        strip.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        if (drag.current?.pointerId !== event.pointerId) return;
        event.currentTarget.scrollLeft = drag.current.scrollLeft - (event.clientX - drag.current.startX);
      }}
      onPointerUp={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
        drag.current = null;
      }}
      onPointerCancel={() => { drag.current = null; }}
      onLostPointerCapture={() => { drag.current = null; }}
    >
      {children}
    </div>
  );
}
