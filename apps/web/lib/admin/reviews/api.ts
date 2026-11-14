import { requestAdminJson } from "@/lib/http/requestAdminJson";
import type {
  AdminReviewItem,
  AdminReviewListResponse,
  AdminReviewQuery,
  AdminUpdateReviewStatusPayload,
} from "shared";

export async function getAdminReviews(query?: AdminReviewQuery): Promise<AdminReviewListResponse> {
  const params = new URLSearchParams();
  if (query?.status !== undefined && query?.status !== "all" && query?.status !== "") {
    params.set("status", String(query.status));
  }
  if (query?.tour_id) {
    params.set("tour_id", String(query.tour_id));
  }
  if (query?.take) {
    params.set("take", String(query.take));
  }
  if (query?.skip) {
    params.set("skip", String(query.skip));
  }

  const queryString = params.toString() ? `?${params.toString()}` : "";
  return requestAdminJson<AdminReviewListResponse>(
    `/admin/reviews${queryString}`,
    { method: "GET" },
    "Không thể tải danh sách đánh giá.",
  );
}

export async function getAdminReviewDetail(reviewId: number): Promise<AdminReviewItem> {
  return requestAdminJson<AdminReviewItem>(
    `/admin/reviews/${reviewId}`,
    { method: "GET" },
    "Không thể tải chi tiết đánh giá.",
  );
}

export async function updateAdminReviewStatus(
  reviewId: number,
  payload: AdminUpdateReviewStatusPayload,
): Promise<{ message: string; review: { review_id: number; status: number } }> {
  return requestAdminJson(
    `/admin/reviews/${reviewId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    "Không thể cập nhật trạng thái đánh giá.",
  );
}

export async function replyAdminReview(
  reviewId: number,
  content: string,
): Promise<any> {
  return requestAdminJson(
    `/reviews/${reviewId}/reply`,
    {
      method: "POST",
      body: JSON.stringify({ content }),
    },
    "Không thể gửi phản hồi đánh giá.",
  );
}

