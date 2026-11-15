import { getToken } from "@/lib/auth/session";
import type { AccountReviewItem, CreateReviewPayload } from 'shared';
import { API_BASE } from "@/lib/http/config";
import { requestWithToken } from "@/lib/http/requestWithToken";
import { uploadValidatedImage } from "@/lib/http/uploadApi";

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
  return uploadValidatedImage(
    "/reviews/upload-image",
    file,
    "Không thể tải ảnh đánh giá lên.",
  );
}

