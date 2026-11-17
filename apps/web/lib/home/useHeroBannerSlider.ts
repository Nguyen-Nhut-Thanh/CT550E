"use client";

import { normalizeImageSrc } from "@/lib/utils/images";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ActiveBannerState, BannerItem, UseHeroBannerSliderParams, UseHeroBannerSliderReturn } from "shared";

export function useHeroBannerSlider({
  banners,
  autoSlideDelay = 5000,
  slideAnimationDuration = 800,
}: UseHeroBannerSliderParams): UseHeroBannerSliderReturn {
  const normalizedBanners = useMemo<BannerItem[]>(() => {
    if (!Array.isArray(banners)) return [];

    return banners
      .filter(
        (item) =>
          item &&
          typeof item.banner_id === "number" &&
          Boolean(item.header) &&
          Boolean(item.image_url),
      )
      .map((item) => ({
        ...item,
        location_name: typeof item.location_name === "string" ? item.location_name : "",
        image_url: normalizeImageSrc(item.image_url) || "/images/shared/default-tour-beach.jpg",
        description: typeof item.description === "string" ? item.description : "",
        link_to:
          typeof item.link_to === "string" && item.link_to.trim()
            ? item.link_to
            : "#",
      }));
  }, [banners]);

  const slideContainerRef = useRef<HTMLDivElement | null>(null);
  const autoSlideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitionUnlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTransitioningRef = useRef(false);

  // Quản lý thứ tự slides hoàn toàn bằng React State thay vì DOM manipulation
  const [slides, setSlides] = useState<BannerItem[]>(normalizedBanners);
  const [animateKey, setAnimateKey] = useState(0);

  // Đồng bộ slides khi prop banners thay đổi
  useEffect(() => {
    setSlides(normalizedBanners);
  }, [normalizedBanners]);

  const totalItems = normalizedBanners.length;

  const clearAutoSlide = useCallback(() => {
    if (autoSlideTimeoutRef.current) {
      clearTimeout(autoSlideTimeoutRef.current);
      autoSlideTimeoutRef.current = null;
    }
  }, []);

  const clearTransitionUnlock = useCallback(() => {
    if (transitionUnlockTimeoutRef.current) {
      clearTimeout(transitionUnlockTimeoutRef.current);
      transitionUnlockTimeoutRef.current = null;
    }
  }, []);

  const unlockTransitionLaterRef = useRef<(() => void) | null>(null);

  const unlockTransitionLater = useCallback(() => {
    clearTransitionUnlock();

    transitionUnlockTimeoutRef.current = setTimeout(() => {
      isTransitioningRef.current = false;
      clearAutoSlide();

      if (totalItems > 1) {
        autoSlideTimeoutRef.current = setTimeout(() => {
          if (isTransitioningRef.current) return;
          isTransitioningRef.current = true;
          setSlides((prev) => (prev.length > 1 ? [...prev.slice(1), prev[0]] : prev));
          setAnimateKey((prev) => prev + 1);
          unlockTransitionLaterRef.current?.();
        }, autoSlideDelay);
      }
    }, slideAnimationDuration);
  }, [autoSlideDelay, clearAutoSlide, clearTransitionUnlock, slideAnimationDuration, totalItems]);

  useEffect(() => {
    unlockTransitionLaterRef.current = unlockTransitionLater;
  }, [unlockTransitionLater]);

  const handleNextSlide = useCallback(() => {
    if (isTransitioningRef.current || slides.length <= 1) return;

    clearAutoSlide();
    isTransitioningRef.current = true;
    setSlides((prev) => (prev.length > 1 ? [...prev.slice(1), prev[0]] : prev));
    setAnimateKey((prev) => prev + 1);
    unlockTransitionLater();
  }, [clearAutoSlide, slides.length, unlockTransitionLater]);

  const handlePrevSlide = useCallback(() => {
    if (isTransitioningRef.current || slides.length <= 1) return;

    clearAutoSlide();
    isTransitioningRef.current = true;
    setSlides((prev) =>
      prev.length > 1 ? [prev[prev.length - 1], ...prev.slice(0, -1)] : prev,
    );
    setAnimateKey((prev) => prev + 1);
    unlockTransitionLater();
  }, [clearAutoSlide, slides.length, unlockTransitionLater]);

  const handleContainerClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const target = event.target as HTMLElement;
      const clickedItem = target.closest(".hero-banner-item") as HTMLElement | null;
      if (!clickedItem || isTransitioningRef.current) return;

      const bannerIdStr = clickedItem.dataset.bannerId;
      if (!bannerIdStr) return;
      const bannerId = Number(bannerIdStr);

      setSlides((prev) => {
        const idx = prev.findIndex((item) => item.banner_id === bannerId);
        // Item 0 (nền) và item 1 (active) không cần dịch chuyển khi click
        if (idx <= 1) return prev;

        clearAutoSlide();
        isTransitioningRef.current = true;
        const moves = idx - 1;
        const next = [...prev.slice(moves), ...prev.slice(0, moves)];
        setAnimateKey((k) => k + 1);
        unlockTransitionLater();
        return next;
      });
    },
    [clearAutoSlide, unlockTransitionLater],
  );

  // Khởi động auto-slide ban đầu
  useEffect(() => {
    clearAutoSlide();

    if (totalItems > 1) {
      autoSlideTimeoutRef.current = setTimeout(() => {
        if (isTransitioningRef.current) return;
        isTransitioningRef.current = true;
        setSlides((prev) => (prev.length > 1 ? [...prev.slice(1), prev[0]] : prev));
        setAnimateKey((prev) => prev + 1);
        unlockTransitionLater();
      }, autoSlideDelay);
    }

    return () => {
      clearAutoSlide();
      clearTransitionUnlock();
    };
  }, [autoSlideDelay, clearAutoSlide, clearTransitionUnlock, totalItems, unlockTransitionLater]);

  // Active banner luôn là slide vị trí 1 (slide đang được trình chiếu chính) hoặc slide 0 nếu chỉ có 1 slide
  const activeItem = slides[1] ?? slides[0] ?? null;
  const activeBanner = useMemo<ActiveBannerState | null>(() => {
    if (!activeItem) return null;
    return {
      banner_id: activeItem.banner_id,
      location_name: activeItem.location_name,
      header: activeItem.header,
      description: activeItem.description,
      image_url: activeItem.image_url,
      link_to: activeItem.link_to,
    };
  }, [activeItem]);

  const currentIndex = useMemo(() => {
    if (!activeBanner || !normalizedBanners.length) return 0;
    const idx = normalizedBanners.findIndex((b) => b.banner_id === activeBanner.banner_id);
    return idx !== -1 ? idx + 1 : 1;
  }, [activeBanner, normalizedBanners]);

  const progressWidth =
    totalItems > 0 ? `${(currentIndex / totalItems) * 100}%` : "0%";

  return {
    normalizedBanners: slides,
    slideContainerRef,
    activeBanner,
    animateKey,
    totalItems,
    currentIndex,
    progressWidth,
    handleNextSlide,
    handlePrevSlide,
    handleContainerClick,
  };
}
