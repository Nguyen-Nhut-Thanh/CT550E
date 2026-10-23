import { requestJson } from "@/lib/http/requestJson";
import type { FavoriteTourItem } from 'shared';

export function getMyFavoriteTours() {
  return requestJson<FavoriteTourItem[]>("/favorites/my", {
    method: "GET",
    requireAuth: true,
    fallbackMessage: "Không thể tải danh sách yêu thích.",
  });
}

export function getFavoriteIds() {
  return requestJson<{ items?: number[] }>("/favorites/ids", {
    method: "GET",
    requireAuth: true,
    fallbackMessage: "Không thể tải danh sách yêu thích.",
  });
}

export function addFavoriteTour(tourId: number) {
  return requestJson(`/favorites/${tourId}`, {
    method: "POST",
    requireAuth: true,
    fallbackMessage: "Không thể cập nhật danh sách yêu thích.",
  });
}

export function removeFavoriteTour(tourId: number) {
  return requestJson(`/favorites/${tourId}`, {
    method: "DELETE",
    requireAuth: true,
    fallbackMessage: "Không thể cập nhật danh sách yêu thích.",
  });
}
