import type {
  AdminReviewQuery,
  AdminUpdateReviewStatusPayload,
  CreateReplyPayload,
  CreateReviewPayload,
  TourReviewItem,
} from "shared";
import { publicFetch } from "./publicFetch";
import { getToken } from "@/lib/client/utils/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:4000";

async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...options,
    headers,
  });

  const data = (await response.json().catch(() => null)) as any;

  if (!response.ok) {
    throw new Error(data?.message || `Lỗi từ máy chủ: ${response.status}`);
  }

  return data as T;
}

export async function getTourReviews(tourId: number | string): Promise<TourReviewItem[]> {
  return publicFetch<TourReviewItem[]>(`/tours/${tourId}/reviews`, {
    cache: "no-store",
  });
}

export async function submitTourReview(
  tourId: number | string,
  payload: CreateReviewPayload,
): Promise<{ message: string; review: { review_id: number; status: number } }> {
  return authFetch<{ message: string; review: { review_id: number; status: number } }>(
    `/tours/${tourId}/reviews`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function toggleReviewLike(
  reviewId: number | string,
): Promise<{ is_liked: boolean; likes_count: number }> {
  return authFetch<{ is_liked: boolean; likes_count: number }>(
    `/reviews/${reviewId}/like`,
    {
      method: "POST",
    },
  );
}

export async function submitReviewReply(
  reviewId: number | string,
  payload: CreateReplyPayload,
): Promise<any> {
  return authFetch(`/reviews/${reviewId}/reply`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Admin APIs
export async function adminGetReviews(query: AdminReviewQuery = {}): Promise<{
  items: TourReviewItem[];
  total: number;
  take: number;
  skip: number;
}> {
  const searchParams = new URLSearchParams();
  if (query.status !== undefined && query.status !== "") {
    searchParams.set("status", String(query.status));
  }
  if (query.tour_id) searchParams.set("tour_id", String(query.tour_id));
  if (query.take) searchParams.set("take", String(query.take));
  if (query.skip) searchParams.set("skip", String(query.skip));

  const qs = searchParams.toString();
  return authFetch<{
    items: TourReviewItem[];
    total: number;
    take: number;
    skip: number;
  }>(`/admin/reviews${qs ? `?${qs}` : ""}`);
}

export async function adminUpdateReviewStatus(
  reviewId: number | string,
  payload: AdminUpdateReviewStatusPayload,
): Promise<{ message: string; review: { review_id: number; status: number } }> {
  return authFetch<{ message: string; review: { review_id: number; status: number } }>(
    `/admin/reviews/${reviewId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}
