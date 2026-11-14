"use client";

import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type AccountPageBannerFilter = {
  value: string;
  label: ReactNode;
};

const bannerPhotos = [
  { src: "/images/blog/featured-da-nang.jpg", alt: "Cầu và biển Đà Nẵng", shape: "-rotate-6" },
  { src: "/images/about/hero-bay-traveler.png", alt: "Vịnh biển Việt Nam", shape: "rotate-2 translate-y-1" },
  { src: "/images/blog/featured-sapa.jpg", alt: "Núi rừng Sa Pa", shape: "rotate-6 translate-y-2" },
];

export function AccountPageBanner({
  title,
  description,
  icon: Icon,
  filters,
  filterAriaLabel = "Lọc nội dung",
  activeFilter,
  onFilterChange,
  search,
  controls,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  filters?: AccountPageBannerFilter[];
  filterAriaLabel?: string;
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  search?: ReactNode;
  controls?: ReactNode;
}) {
  const hasToolbar = Boolean(filters?.length || search || controls);
  return (
    <section className="relative z-20 -mx-4 -mt-4 bg-gradient-to-r from-[#cfe4fc] via-[#ebf4fe] to-[#c8e1fc] sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/4 h-64 w-[520px] rounded-full bg-white/55 blur-3xl" />
        <div className="absolute right-1/3 top-4 h-52 w-[420px] rounded-full bg-white/45 blur-2xl" />
        <div className="absolute -bottom-36 left-1/2 h-60 w-[540px] -translate-x-1/2 rounded-full border-t border-white/60 bg-gradient-to-t from-sky-300/35 to-blue-200/20" />
        <svg className="absolute -bottom-1 -left-4 h-28 w-36 text-sky-500/25" viewBox="0 0 160 120" fill="currentColor">
          <path d="M25 120C15 85 5 55 22 25c20 25 26 57 20 95Zm15 0c5-40 22-72 52-88-7 33-20 63-37 88Zm-30 0C-5 95-8 72 4 52c16 18 22 43 20 68Zm42 0c16-25 43-42 73-44-20 22-43 36-61 44Z" />
        </svg>
        <svg className="absolute left-[42%] top-5 hidden h-20 w-40 text-blue-500/55 md:block" viewBox="0 0 200 100" fill="none">
          <path d="M8 68c20 16 44 14 54-2 8-13-7-20-10-9-4 13 36 17 93-21" stroke="currentColor" strokeWidth="1.8" strokeDasharray="4 4" strokeLinecap="round" />
          <path d="m174 17-28 4 10 9-11 13 6 2 11-9 10 10 4-4-7-13 9-9c2-2-1-4-4-3Z" fill="currentColor" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1240px] flex-col justify-between gap-4 px-4 py-3 pb-5 sm:min-h-[168px] sm:px-6 sm:py-4 lg:flex-row lg:items-center lg:px-8">
        <div className="flex min-w-0 items-start gap-3.5 sm:items-center sm:gap-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-[#dceafe]/90 text-[#1d6ce0] shadow-[0_8px_24px_rgba(37,99,235,0.10)] backdrop-blur-sm sm:h-[60px] sm:w-[60px]">
            <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.9} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold leading-tight tracking-tight text-[#0f1e36] sm:text-[26px]">{title}</h1>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">{description}</p>
          </div>
        </div>

        <div aria-hidden="true" className="relative flex h-[104px] shrink-0 items-center justify-center pr-2 sm:h-[126px] lg:h-[132px] lg:justify-end lg:pr-7">
          {bannerPhotos.map((photo, index) => (
            <div
              key={photo.src}
              className={`relative ${index ? "-ml-4 sm:-ml-5" : ""} ${index === 1 ? "z-20" : "z-10"} ${index === 0 ? "h-[84px] w-[84px] sm:h-[104px] sm:w-[104px]" : index === 1 ? "h-[92px] w-[92px] sm:h-[114px] sm:w-[114px]" : "h-[80px] w-[80px] sm:h-[98px] sm:w-[98px]"} ${photo.shape} rounded-2xl border-[5px] border-white bg-white shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition duration-300 hover:z-30 hover:-translate-y-1 hover:rotate-0`}
            >
              <Image src={photo.src} alt={photo.alt} fill sizes="116px" className="rounded-[10px] object-cover" />
            </div>
          ))}
        </div>

      </div>

      {hasToolbar ? (
        <div className="relative z-20 border-t border-white/80 bg-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.03)] backdrop-blur-md">
          <div className="mx-auto max-w-[1240px] px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {filters?.length && onFilterChange ? (
                <div role="tablist" aria-label={filterAriaLabel} className="flex min-w-0 flex-1 gap-7 overflow-x-auto">
                  {filters.map((filter) => {
                    const selected = activeFilter === filter.value;
                    return (
                      <button
                        key={filter.value}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onFilterChange(filter.value)}
                        className={`relative shrink-0 pb-3 text-sm font-semibold transition ${
                          selected ? "font-bold text-blue-600" : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {filter.label}
                        {selected && <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              ) : <div className="flex-1" />}
              {search || controls ? (
                <div className="flex w-full shrink-0 items-center justify-end gap-3 sm:w-auto">
                  {search}
                  {controls}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
