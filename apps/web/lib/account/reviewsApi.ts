import { getToken } from "@/lib/auth/session";
import type { AccountReviewItem, CreateReviewPayload } from 'shared';

import { API_BASE as API_BASE_URL } from "@/lib/http/config";

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const token = getToken();
  if(token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...options,
    headers,
  });

  const data = (await response.json().catch(() => null)) as any;

  if(!response.ok) {
    throw new Error(data?.message || `Lỗi từ máy chủ: ${response.status}`);
  }

  return data as T;
}

export function getMyReviews(): Promise<AccountReviewItem[]> {
  return authFetch("/account/reviews", { cache: "no-store" });
}

export function updateMyReview(reviewId: number, payload: { rating: number; comment: string }): Promise<{ message: string }> {
  return authFetch(`/account/reviews/${reviewId}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export function createTourReview(tourId: number, payload: CreateReviewPayload): Promise<{ message: string; review: { review_id: number; status: number } }> {
  return authFetch(`/tours/${tourId}/reviews`, { method: "POST", body: JSON.stringify(payload) });
}

export async function uploadReviewImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const token = getToken();
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}/reviews/upload-image`, {
    method: "POST",
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || "Không thể tải ảnh đánh giá lên.");
  }
  return data;
}

