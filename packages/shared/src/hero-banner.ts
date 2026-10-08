import type React from "react";
import type { Banner } from "./banner";

export type BannerItem = Banner & {
  description: string;
  link_to: string;
};

export type ActiveBannerState = {
  banner_id: number;
  location_name: string;
  header: string;
  description: string;
  image_url: string;
  link_to: string;
};

export type HeroBannerProps = {
  banners: Banner[];
};

export type UseHeroBannerSliderParams = {
  banners: Banner[];
  autoSlideDelay?: number;
  slideAnimationDuration?: number;
};

export type UseHeroBannerSliderReturn = {
  normalizedBanners: BannerItem[];
  slideContainerRef: React.RefObject<HTMLDivElement | null>;
  activeBanner: ActiveBannerState | null;
  animateKey: number;
  totalItems: number;
  currentIndex: number;
  progressWidth: string;
  handleNextSlide: () => void;
  handlePrevSlide: () => void;
  handleContainerClick: (event: React.MouseEvent<HTMLDivElement>) => void;
};
