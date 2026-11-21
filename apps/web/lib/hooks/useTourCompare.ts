"use client";

import { useEffect, useState } from "react";

export type CompareTourItem = {
  tour_id: number;
  name: string;
  code?: string;
  image_url?: string;
  price?: number;
  duration?: string;
  departure?: string;
};

const COMPARE_STORAGE_KEY = "journitrip_compare_tours_v1";
const COMPARE_EVENT = "journitrip_compare_updated";

function getStoredCompareTours(): CompareTourItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(COMPARE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStoredCompareTours(tours: CompareTourItem[]) {
  try {
    sessionStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(tours.slice(0, 3)));
    window.dispatchEvent(new Event(COMPARE_EVENT));
  } catch {}
}

export function useTourCompare() {
  const [tours, setTours] = useState<CompareTourItem[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    setTours(getStoredCompareTours());

    const handleUpdate = () => {
      setTours(getStoredCompareTours());
    };

    window.addEventListener(COMPARE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(COMPARE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  function toggleTour(tour: CompareTourItem) {
    const current = getStoredCompareTours();
    const exists = current.some((t) => t.tour_id === tour.tour_id);

    if (exists) {
      const next = current.filter((t) => t.tour_id !== tour.tour_id);
      setStoredCompareTours(next);
      return false;
    }

    if (current.length >= 3) {
      alert("Bạn chỉ có thể so sánh tối đa 3 tour cùng lúc. Hãy gỡ bớt 1 tour để thêm tour mới.");
      return false;
    }

    const next = [...current, tour];
    setStoredCompareTours(next);
    return true;
  }

  function removeTour(tourId: number) {
    const current = getStoredCompareTours();
    const next = current.filter((t) => t.tour_id !== tourId);
    setStoredCompareTours(next);
  }

  function clearTours() {
    setStoredCompareTours([]);
  }

  function isComparing(tourId: number): boolean {
    return tours.some((t) => t.tour_id === tourId);
  }

  return {
    tours,
    count: tours.length,
    isComparing,
    toggleTour,
    removeTour,
    clearTours,
    isCompareModalOpen,
    setIsCompareModalOpen,
  };
}

