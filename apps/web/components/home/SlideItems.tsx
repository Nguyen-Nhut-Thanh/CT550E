"use client";

import { memo } from "react";
import type { BannerItem } from "shared";

const SlideItems = memo(function SlideItems({
  items,
}: {
  items: BannerItem[];
}) {
  return (
    <>
      {items.map((item) => (
        <div
          key={item.banner_id}
          className={[
            // identity class — used by nth-child CSS selectors in globals.css
            "hero-banner-item",
            // layout & sizing (default: thumbnail state)
            "absolute w-[180px] h-[270px]",
            "top-[calc(100%_-_390px)]",
            "bg-cover bg-center",
            "z-10",
            // smooth transition for slider DOM reordering
            "[transition:all_0.8s_cubic-bezier(0.75,0,0.25,1)]",
            // visual
            "cursor-pointer overflow-hidden rounded-[18px]",
            "shadow-[0_20px_60px_rgba(0,0,0,0.35)]",
          ].join(" ")}
          style={{
            backgroundImage: `url('${item.image_url}')`,
          }}
          data-banner-id={item.banner_id}
          data-location={item.location_name}
          data-title={item.header}
          data-description={item.description}
          data-image-url={item.image_url}
          data-link-to={item.link_to}
        >
          <div className="thumb-content absolute bottom-4 left-4 right-4 z-[2] text-white transition-opacity duration-300">
            <div className="mb-1 text-[11px] text-[rgba(255,255,255,0.9)]">
              {item.location_name}
            </div>
            <div className="text-[20px] font-bold uppercase leading-[1.1]">
              {item.header}
            </div>
          </div>
        </div>
      ))}
    </>
  );
});

export default SlideItems;
