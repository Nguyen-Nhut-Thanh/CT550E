"use client";

import { useLayoutEffect, useRef } from "react";

/** Extend artwork behind the breadcrumb, while clipping its bottom to the header. */
export function AdminScenicHeaderBackground() {
  const backgroundRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const background = backgroundRef.current;
    const header = background?.parentElement;
    const page = background?.closest<HTMLElement>("[data-admin-page]");
    if (!background || !header || !page) return;
    const updatePosition = () => {
      const offset = Math.max(0, header.getBoundingClientRect().top - page.getBoundingClientRect().top);
      background.style.top = `${-offset}px`;
    };
    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    observer.observe(header);
    observer.observe(page);
    const breadcrumb = page.querySelector('[aria-label="Đường dẫn"]');
    if (breadcrumb) observer.observe(breadcrumb);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={backgroundRef} aria-hidden="true" data-admin-header-background="" className="pointer-events-none absolute -left-6 -right-6 bottom-0 z-[-1] overflow-hidden" style={{ top: "calc(-1 * var(--admin-header-top-offset, 18px))" }}>
      <img src="/images/about/our-story-ha-long-bay.png" alt="" className="absolute right-0 top-0 h-full w-[61%] object-cover [object-position:center_58%] opacity-[.65] [mask-image:linear-gradient(to_left,_black_58%,_transparent)] @max-[760px]:w-[78%] @max-[760px]:opacity-[.45]" />
      <div className="absolute inset-0 [background:linear-gradient(180deg,_#edf7ff26,_#eff6ff00_62%,_#eff6ff)]" />
    </div>
  );
}
