"use client";

import { ImageWithFallback } from "@/components/common/media/ImageWithFallback";
import { FEATURED_LIMIT } from "@/lib/admin/locations/featured";
import type { AdminLocationItem } from "shared";

export function FeaturedLocationsGrid({ items }: { items: AdminLocationItem[] }) {
  const getGridClass = (index: number) => {
    const layouts = [
      "col-span-3 row-span-2",
      "col-span-2 row-span-1",
      "col-span-4 row-span-1",
      "col-span-2 row-span-1",
      "col-span-2 row-span-1",
      "col-span-2 row-span-2",
      "col-span-2 row-span-1",
      "col-span-3 row-span-1",
      "col-span-2 row-span-1",
    ];
    return layouts[index] || "";
  };

  return (
    <div className="aspect-[16/10] w-full rounded-xl border border-slate-200 bg-slate-100 p-2 shadow-inner">
      <div className="grid h-full grid-cols-9 grid-rows-3 gap-1.5">
        {Array.from({ length: FEATURED_LIMIT }).map((_, index) => {
          const item = items[index];
          return (
            <div
              key={index}
              className={`${getGridClass(index)} flex items-center justify-center overflow-hidden rounded-md border transition-all duration-500 ${
                item ? "border-blue-400 bg-blue-600 shadow-sm" : "border-dashed border-slate-200 bg-white opacity-40"
              }`}
            >
              {item ? (
                <div className="relative h-full w-full">
                  {item.featured_image ? (
                    <ImageWithFallback
                      src={item.featured_image}
                      className="h-full w-full object-cover opacity-60"
                      alt={item.name}
                    />
                  ) : (
                    <div className="h-full w-full bg-blue-600" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="truncate px-1 text-[10px] font-black text-white drop-shadow-md">
                      {index + 1}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-[10px] font-bold text-slate-300">{index + 1}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
