"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ToggleFavoriteResult } from "shared";
import { getToken } from "../utils/auth";
import {
  addFavoriteTour,
  getFavoriteIds,
  removeFavoriteTour,
} from "../api/authApi";

export function useFavoriteTours() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const pendingIds = useRef(new Set<number>());

  const loadFavoriteIds = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setFavoriteIds([]);
      return;
    }

    try {
      const data = await getFavoriteIds();
      setFavoriteIds(Array.isArray(data?.items) ? data.items : []);
    } catch {
      // Ignore background sync failures and keep the current local state.
    }
  }, []);

  useEffect(() => {
    loadFavoriteIds();
    window.addEventListener("auth-change", loadFavoriteIds);
    const sync = (event: Event) => {
      const { tourId, favorite } = (event as CustomEvent<{ tourId: number; favorite: boolean }>).detail;
      setFavoriteIds((prev) => favorite ? (prev.includes(tourId) ? prev : [...prev, tourId]) : prev.filter(id => id !== tourId));
    };
    window.addEventListener("favorites-change", sync);
    return () => {
      window.removeEventListener("auth-change", loadFavoriteIds);
      window.removeEventListener("favorites-change", sync);
    };
  }, [loadFavoriteIds]);

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const loadingIdSet = useMemo(() => new Set(loadingIds), [loadingIds]);

  const isFavorite = useCallback(
    (tourId: number) => favoriteIdSet.has(tourId),
    [favoriteIdSet],
  );

  const isPending = useCallback(
    (tourId: number) => loadingIdSet.has(tourId),
    [loadingIdSet],
  );

  const toggleFavorite = useCallback(
    async (tourId: number): Promise<ToggleFavoriteResult> => {
      const token = getToken();
      if (!token) {
        return {
          ok: false,
          reason: "unauthenticated",
          message: "Vui lòng đăng nhập để lưu tour yêu thích.",
        };
      }

      const currentlyFavorite = favoriteIdSet.has(tourId);
      if (pendingIds.current.has(tourId)) {
        return { ok: false, reason: "error", message: "Đang cập nhật tour yêu thích." };
      }
      pendingIds.current.add(tourId);
      setLoadingIds((prev) => [...prev, tourId]);

      try {
        if (currentlyFavorite) {
          await removeFavoriteTour(tourId);
        } else {
          await addFavoriteTour(tourId);
        }

        setFavoriteIds((prev) => {
          if (currentlyFavorite) {
            return prev.filter((id) => id !== tourId);
          }

          return prev.includes(tourId) ? prev : [...prev, tourId];
        });
        window.dispatchEvent(new CustomEvent("favorites-change", { detail: { tourId, favorite: !currentlyFavorite } }));

        return {
          ok: true,
          action: currentlyFavorite ? "removed" : "added",
        };
      } catch (error) {
        return {
          ok: false,
          reason: "error",
          message: error instanceof Error ? error.message : "Không thể cập nhật danh sách yêu thích.",
        };
      } finally {
        pendingIds.current.delete(tourId);
        setLoadingIds((prev) => prev.filter((id) => id !== tourId));
      }
    },
    [favoriteIdSet],
  );

  return {
    favoriteIds,
    isFavorite,
    isPending,
    toggleFavorite,
    refreshFavoriteIds: loadFavoriteIds,
  };
}
