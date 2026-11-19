"use client";

import { getToken, removeToken } from "@/lib/auth/client/session";
import { addFavoriteTour, getFavoriteIds, removeFavoriteTour } from "@/lib/favorites/api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ToggleFavoriteResult } from "shared";

const FAVORITES_CHANNEL = "journitrip_favorites_channel";
const FAVORITES_STORAGE_KEY = "journitrip_favorites_sync";

function notifyFavoritesChange(tourId: number, favorite: boolean) {
  window.dispatchEvent(
    new CustomEvent("favorites-change", { detail: { tourId, favorite } }),
  );

  if (typeof BroadcastChannel !== "undefined") {
    try {
      const channel = new BroadcastChannel(FAVORITES_CHANNEL);
      channel.postMessage({ tourId, favorite });
      channel.close();
    } catch {
      // ignore
    }
  }

  try {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify({ tourId, favorite, ts: Date.now() }),
    );
  } catch {
    // ignore
  }
}

export function useFavoriteTours() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const pendingIds = useRef(new Set<number>());

  const loadFavoriteIds = useCallback(async () => {
    const token = getToken();
    if(!token) {
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

    const applyChange = (tourId: number, favorite: boolean) => {
      setFavoriteIds((prev) =>
        favorite
          ? prev.includes(tourId)
            ? prev
            : [...prev, tourId]
          : prev.filter((id) => id !== tourId),
      );
    };

    const syncLocal = (event: Event) => {
      const { tourId, favorite } = (
        event as CustomEvent<{ tourId: number; favorite: boolean }>
      ).detail;
      applyChange(tourId, favorite);
    };
    window.addEventListener("favorites-change", syncLocal);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel(FAVORITES_CHANNEL);
        channel.onmessage = (event) => {
          const { tourId, favorite } = event.data || {};
          if (typeof tourId === "number") {
            applyChange(tourId, Boolean(favorite));
          }
        };
      } catch {
        channel = null;
      }
    }

    const syncStorage = (event: StorageEvent) => {
      if (event.key === FAVORITES_STORAGE_KEY && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          if (typeof data?.tourId === "number") {
            applyChange(data.tourId, Boolean(data.favorite));
          }
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", syncStorage);

    return () => {
      window.removeEventListener("auth-change", loadFavoriteIds);
      window.removeEventListener("favorites-change", syncLocal);
      window.removeEventListener("storage", syncStorage);
      if (channel) {
        channel.close();
      }
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
      if(!token) {
        return {
          ok: false,
          reason: "unauthenticated",
          message: "Vui lòng đăng nhập để lưu tour yêu thích.",
        };
      }

      const currentlyFavorite = favoriteIdSet.has(tourId);
      if(pendingIds.current.has(tourId)) {
        return { ok: false, reason: "error", message: "Đang cập nhật tour yêu thích." };
      }
      pendingIds.current.add(tourId);
      setLoadingIds((prev) => [...prev, tourId]);

      try {
        if(currentlyFavorite) {
          await removeFavoriteTour(tourId);
        } else {
          await addFavoriteTour(tourId);
        }

        setFavoriteIds((prev) => {
          if(currentlyFavorite) {
            return prev.filter((id) => id !== tourId);
          }

          return prev.includes(tourId) ? prev : [...prev, tourId];
        });
        notifyFavoritesChange(tourId, !currentlyFavorite);

        return {
          ok: true,
          action: currentlyFavorite ? "removed" : "added",
        };
      } catch(error) {
        const msg = error instanceof Error ? error.message : "";
        const isAuthError =
          msg.toLowerCase().includes("unauthorized") ||
          msg.toLowerCase().includes("đăng nhập") ||
          msg.includes("401");

        if (isAuthError) {
          removeToken();
          return {
            ok: false,
            reason: "unauthenticated",
            message: "Vui lòng đăng nhập để lưu tour yêu thích.",
          };
        }

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
