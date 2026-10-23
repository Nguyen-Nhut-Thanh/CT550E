import type React from "react";
import type { Banner } from "../banners/models";
export type BannerItem = Omit<Banner, "link_to"> & {
    link_to: string;
};
export type ActiveBannerState = Pick<BannerItem, "banner_id" | "location_name" | "header" | "description" | "image_url" | "link_to">;
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
