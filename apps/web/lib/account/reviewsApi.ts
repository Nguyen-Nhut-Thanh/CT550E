import { getToken } from "@/lib/auth/session";
import type { AccountReviewItem, CreateReviewPayload } from 'shared';
import { API_BASE } from "@/lib/http/config";
import { requestWithToken } from "@/lib/http/requestWithToken";
import { uploadAuthenticatedFile } from "@/lib/http/uploadApi";

export function getMyReviews(): Promise<AccountReviewItem[]> {
  return requestWithToken("/account/reviews", { cache: "no-store" });
}

export function updateMyReview(reviewId: number, payload: { rating: number; comment: string }): Promise<{ message: string }> {
  return requestWithToken(`/account/reviews/${reviewId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function createTourReview(tourId: number, payload: CreateReviewPayload): Promise<{ message: string; review: { review_id: number; status: number } }> {
  return requestWithToken(`/tours/${tourId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function uploadReviewImage(file: File): Promise<{ url: string }> {
  const token = getToken() || "";
  const data = await uploadAuthenticatedFile(
    `${API_BASE}/reviews/upload-image`,
    token,
    file,
    "Không thể tải ảnh đánh giá lên.",
  );
  if (!data?.url) {
    throw new Error("Không thể tải ảnh đánh giá lên.");
  }
  return { url: data.url };
}

