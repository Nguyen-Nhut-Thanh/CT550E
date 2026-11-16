"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { SeasonalThemeConfig } from "shared";
import { getPublicSeasonalTheme } from "@/lib/home/api";
import { SeasonalParticles } from "@/components/banners/seasonal_theme/UserSeasonalParticles";
import { SeasonalThemeWrapper } from "@/components/banners/seasonal_theme/UserSeasonalThemeWrapper";

export interface SeasonalHomeContainerProps {
  children: ReactNode;
  initialConfig?: SeasonalThemeConfig;
}

export function SeasonalHomeContainer({
  children,
  initialConfig,
}: SeasonalHomeContainerProps) {
  const [config, setConfig] = useState<SeasonalThemeConfig>(
    initialConfig || {
      mode: "auto",
      activeSeason: "spring",
      enableParticles: true,
      enableColors: true,
      particleDensity: "normal",
    },
  );

  useEffect(() => {
    let active = true;
    getPublicSeasonalTheme()
      .then((data) => {
        if (active && data) {
          setConfig(data);
        }
      })
      .catch(() => {
        // use fallback config
      });

    return () => {
      active = false;
    };
  }, []);

  const showParticles =
    config.mode !== "disabled" && config.enableParticles;
  const showColors =
    config.mode !== "disabled" && config.enableColors;

  return (
    <SeasonalThemeWrapper
      activeSeason={config.activeSeason}
      enableColors={showColors}
    >
      {/* Real-time full-page particle canvas */}
      {showParticles && (
        <SeasonalParticles
          season={config.activeSeason}
          density={config.particleDensity}
          fixed={true}
        />
      )}

      {children}
    </SeasonalThemeWrapper>
  );
}

