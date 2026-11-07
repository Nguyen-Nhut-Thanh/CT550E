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
    <div className="aspect-[16/10] w-full">
      <div className="grid h-full grid-cols-9 grid-rows-3 gap-1.5">
        {Array.from({ length: FEATURED_LIMIT }).map((_, index) => {
          const item = items[index];
          return (
            <div
              key={index}
              className={`${getGridClass(index)} flex items-center justify-center overflow-hidden rounded-[7px] border ${
                item ? "border-white bg-[#e8f2ff]" : "border-dashed border-[#dce7f5] bg-[#f8fbff]"
              }`}
            >
              {item ? (
                <div className="relative h-full w-full">
                  {item.featured_image || item.location_images?.[0]?.image_url ? (
                    <ImageWithFallback
                      src={item.featured_image || item.location_images?.[0]?.image_url || undefined}
                      className="h-full w-full object-cover"
                      alt={item.name}
                    />
                  ) : (
                    <div className="h-full w-full bg-[#c3d9f5]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-transparent">
                    <span className="absolute left-1.5 top-1.5 flex size-[18px] items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#173052] shadow-sm">
                      {index + 1}
                    </span>
                    <span className="absolute bottom-1.5 left-1.5 right-1.5 truncate text-[9px] font-semibold text-white" title={item.name}>{item.name}</span>
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
