"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "shared";
import type { HeroBannerProps } from "shared";
import { useHeroBannerSlider } from "@/lib/client/hooks";
import HeroNavbar from "./HeroNavbar";
import SlideItems from "./SlideItems";

export default function HeroBanner({ banners }: HeroBannerProps) {
  const {
    normalizedBanners,
    slideContainerRef,
    activeBanner,
    animateKey,
    totalItems,
    currentIndex,
    progressWidth,
    handleNextSlide,
    handlePrevSlide,
    handleContainerClick,
  } = useHeroBannerSlider({
    banners,
    autoSlideDelay: 5000,
    slideAnimationDuration: 800,
  });

  if (!totalItems) {
    return (
      <section className="relative min-h-[700px] w-full overflow-hidden bg-[#111]">
        <div className="flex min-h-[700px] items-center justify-center px-6 text-center text-white">
          <div>
            <h2 className="text-3xl font-bold">Chưa có banner</h2>
            <p className="mt-3 text-sm text-white/70">
              Hãy thêm dữ liệu vào bảng banners để hiển thị banner trang chủ.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="hero-section relative min-h-[700px] w-full overflow-hidden bg-[#111]">
        <div
          ref={slideContainerRef}
          className="slide absolute inset-0"
          id="slideContainer"
          onClick={handleContainerClick}
        >
          <SlideItems items={normalizedBanners} />
        </div>

        <HeroNavbar />

        <div
          key={animateKey}
          className="animate-hero-content absolute left-[52px] top-1/2 z-[15] w-[min(420px,42vw)] -translate-y-1/2 text-white max-[991px]:left-6 max-[991px]:top-[110px] max-[991px]:w-[90%] max-[991px]:translate-y-0"
        >
          <div className="hero-meta mb-2 text-[18px] font-medium text-[rgba(255,255,255,0.9)]">
            {activeBanner?.location_name || ""}
          </div>

          <h1 className="hero-title mb-5 text-[clamp(44px,5vw,76px)] font-extrabold capitalize leading-[0.95] drop-shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            {activeBanner?.header || ""}
          </h1>

          <p className="hero-desc mb-6 max-w-[360px] text-[14px] leading-[1.75] text-[rgba(255,255,255,0.75)]">
            {activeBanner?.description || ""}
          </p>

          <a
            href={activeBanner?.link_to || "#"}
            className="hero-action inline-flex items-center gap-[10px] rounded-full border border-[rgba(255,255,255,0.22)] bg-[rgba(0,0,0,0.28)] px-[18px] py-[11px] text-[12px] font-semibold uppercase text-white no-underline backdrop-blur-[8px] transition duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-[rgba(255,255,255,0.14)]"
          >
            Discover Location
          </a>
        </div>

        <div className="absolute bottom-12 left-[calc(50%+10px)] z-20 flex w-[min(42vw,520px)] -translate-x-1/2 items-center gap-[18px] max-[991px]:bottom-[55px] max-[991px]:left-6 max-[991px]:right-[90px] max-[991px]:w-auto max-[991px]:translate-x-0 max-[640px]:right-[70px] max-[640px]:gap-3">
          <div className="flex gap-[10px]">
            <button
              type="button"
              onClick={handlePrevSlide}
              className="grid h-[42px] w-[42px] place-items-center rounded-full border border-[rgba(255,255,255,0.28)] bg-[rgba(0,0,0,0.25)] text-[18px] text-white backdrop-blur-[8px] transition duration-200 ease-in-out hover:bg-[rgba(255,255,255,0.18)]"
              aria-label="Previous banner"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              type="button"
              onClick={handleNextSlide}
              className="grid h-[42px] w-[42px] place-items-center rounded-full border border-[rgba(255,255,255,0.28)] bg-[rgba(0,0,0,0.25)] text-[18px] text-white backdrop-blur-[8px] transition duration-200 ease-in-out hover:bg-[rgba(255,255,255,0.18)]"
              aria-label="Next banner"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="relative h-[3px] flex-1 rounded-full bg-[rgba(255,255,255,0.22)]">
            <div
              className="absolute left-0 top-0 h-full rounded-[inherit] bg-[rgba(255,214,78,0.9)] transition-[width] duration-[450ms] ease-in-out"
              style={{ width: progressWidth }}
            />
          </div>
        </div>

        <div className="absolute bottom-[38px] right-[42px] z-20 text-[36px] font-bold leading-none text-white max-[640px]:bottom-[60px] max-[640px]:text-[24px]">
          <span>{currentIndex}</span>
          <small className="ml-1 text-[16px] font-medium opacity-75">
            / {totalItems}
          </small>
        </div>
      </section>
    </>
  );
}
