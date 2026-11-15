"use client";

import { useFavoriteTours } from "@/lib/favorites/useFavoriteTours";
import { useToast } from "@/lib/notifications/useToast";
import { useRouter } from "next/navigation";
import type React from "react";

export function useTourFavorite(tourId: number, tourTitle: string) {
  const router = useRouter();
  const toast = useToast();
  const { isFavorite, isPending, toggleFavorite } = useFavoriteTours();

  const handleFavoriteClick = async (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const result = await toggleFavorite(tourId);
    if (!result.ok) {
      if (result.reason === "unauthenticated") {
        toast.info(result.message);
        if (typeof window !== "undefined") {
          router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        }
        return false;
      }
      toast.error(result.message);
      return false;
    }
    toast.success(
      result.action === "added"
        ? `Đã thêm "${tourTitle}" vào tour yêu thích.`
        : `Đã bỏ "${tourTitle}" khỏi tour yêu thích.`,
    );
    return true;
  };

  return {
    favorite: isFavorite(tourId),
    pending: isPending(tourId),
    handleFavoriteClick,
  };
}

