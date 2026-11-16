"use client";

import { useEffect, useState } from "react";
import { getMyReviews, updateMyReview } from "@/lib/reviews/client/reviewsApi";
import { useToast } from "@/lib/notifications/useToast";
import { Loader2, Star, X } from "lucide-react";
import type { AccountReviewItem } from "shared";

interface ChatReviewEditModalProps {
  reviewId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ChatReviewEditModal({
  reviewId,
  isOpen,
  onClose,
  onSuccess,
}: ChatReviewEditModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState<AccountReviewItem | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!isOpen || !reviewId) return;
    let active = true;
    setLoading(true);
    setError("");

    void getMyReviews()
      .then((items) => {
        if (!active) return;
        const found = items.find((r) => r.review_id === reviewId);
        if (found) {
          setReview(found);
          setRating(found.rating);
          setComment(found.comment || "");
        } else {
          setError("Không tìm thấy thông tin bài đánh giá.");
        }
      })
      .catch((err) => {
        if (active) setError(err?.message || "Lỗi khi tải đánh giá.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, reviewId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Vui lòng nhập nội dung đánh giá.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await updateMyReview(reviewId, {
        rating,
        comment: comment.trim(),
      });
      toast.success("Đã cập nhật bài đánh giá thành công!");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || "Lỗi khi cập nhật đánh giá.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
              <Star size={16} className="fill-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Chỉnh sửa bài đánh giá
              </h3>
              <p className="text-[11px] text-slate-400">
                Cập nhật cảm nhận về chuyến đi của bạn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 p-8 text-xs text-slate-500">
            <Loader2 size={24} className="animate-spin text-blue-600" />
            <span>Đang tải thông tin đánh giá...</span>
          </div>
        ) : error && !review ? (
          <div className="p-8 text-center text-xs text-rose-600">
            <p>{error}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 rounded-xl bg-slate-100 px-4 py-2 font-semibold text-slate-700"
            >
              Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Tên tour */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs">
              <span className="text-[10px] font-semibold uppercase text-blue-500">Tour du lịch</span>
              <p className="mt-0.5 font-bold text-slate-900">
                {review?.tour_name}
              </p>
            </div>

            {/* Chọn số sao */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Mức độ hài lòng của bạn:
              </label>
              <div className="flex items-center gap-1.5 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition hover:scale-110"
                  >
                    <Star
                      size={26}
                      className={
                        star <= (hoverRating || rating)
                          ? "fill-amber-400 text-amber-500 drop-shadow-xs"
                          : "fill-slate-100 text-slate-200"
                      }
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-bold text-slate-700">
                  {rating === 5
                    ? "Tuyệt vời (5/5)"
                    : rating === 4
                      ? "Rất tốt (4/5)"
                      : rating === 3
                        ? "Bình thường (3/5)"
                        : rating === 2
                          ? "Chưa hài lòng (2/5)"
                          : "Rất thất vọng (1/5)"}
                </span>
              </div>
            </div>

            {/* Nội dung nhận xét */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Nội dung đánh giá & chia sẻ trải nghiệm:
              </label>
              <textarea
                rows={4}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Chia sẻ cảm nhận sau chuyến đi hoặc các góp ý cải thiện..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {error && (
              <p className="text-xs font-medium text-rose-600">{error}</p>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={saving || !comment.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                <span>{saving ? "Đang lưu..." : "Cập nhật đánh giá"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

