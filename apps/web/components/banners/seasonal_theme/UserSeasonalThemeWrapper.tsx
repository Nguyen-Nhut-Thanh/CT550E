"use client";

import { type ReactNode } from "react";
import type { SeasonType } from "shared";
import { SEASONS_DATA } from "@/lib/banners/client/seasonalConstants";

export interface SeasonalThemeWrapperProps {
  children: ReactNode;
  activeSeason: SeasonType;
  enableColors?: boolean;
}

export function SeasonalThemeWrapper({
  children,
  activeSeason,
  enableColors = true,
}: SeasonalThemeWrapperProps) {
  const currentSeasonData = SEASONS_DATA[activeSeason] || SEASONS_DATA.spring;
  const { theme } = currentSeasonData;

  return (
    <div
      id="seasonal-home-root"
      className={`relative min-h-screen transition-colors duration-1000 ${
        enableColors ? currentSeasonData.theme.bgPage : "bg-white"
      }`}
    >
      {/* Ambient background blur blobs */}
      {enableColors && (
        <div aria-hidden="true" className="pointer-events-none overflow-hidden">
          <div
            className={`fixed top-1/4 -left-20 h-[380px] w-[380px] rounded-full blur-[120px] transition-colors duration-1000 z-0 ${theme.ambientBlob1}`}
          />
          <div
            className={`fixed bottom-1/3 -right-24 h-[440px] w-[440px] rounded-full blur-[140px] transition-colors duration-1000 z-0 ${theme.ambientBlob2}`}
          />
        </div>
      )}

      {/* Dynamic CSS injection for section background tinting */}
      {enableColors && (
        <style dangerouslySetInnerHTML={{
          __html: `
            #seasonal-home-root [data-seasonal-about="true"] {
              background: ${theme.sectionTintAbout} !important;
            }
            #seasonal-home-root [data-seasonal-flash="true"] {
              background-color: ${theme.sectionTintFlash} !important;
            }
            #seasonal-home-root [data-seasonal-featured="true"] {
              background-color: ${theme.sectionTintFeatured} !important;
            }
          `
        }} />
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}

