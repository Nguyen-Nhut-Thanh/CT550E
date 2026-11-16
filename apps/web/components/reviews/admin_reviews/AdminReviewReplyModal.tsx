"use client";

import { MessageSquare, Send, Star, X } from "lucide-react";
import { useState } from "react";
import type { AdminReviewItem } from "shared";

interface ReviewReplyModalProps {
  review: AdminReviewItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reviewId: number, content: string) => Promise<void>;
}

export function ReviewReplyModal({
  review,
  isOpen,
  onClose,
  onConfirm,
}: ReviewReplyModalProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !review) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await onConfirm(review.review_id, content.trim());
      setContent("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Phản hồi đánh giá #{review.review_id}
              </h3>
              <p className="text-xs text-slate-500">
                Câu trả lời sẽ hiển thị công khai dưới đánh giá của khách hàng.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Review tóm tắt */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">
                {review.user?.full_name || "Khách hàng"}
              </span>
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={
                      i < review.rating
                        ? "fill-amber-400 text-amber-500"
                        : "text-slate-200 fill-slate-100"
                    }
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 text-slate-700">
              {review.comment || review.title || "Không có nhận xét chi tiết."}
            </p>
          </div>

          {/* Danh sách phản hồi hiện tại nếu có */}
          {review.replies && review.replies.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Phản hồi trước đó:
              </label>
              <div className="max-h-36 overflow-y-auto space-y-2 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                {review.replies.map((r) => (
                  <div key={r.reply_id} className="rounded-lg bg-white p-2.5 border border-slate-200/60 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span className="font-bold text-blue-700">
                        {r.user?.full_name || "Quản trị viên / CSKH"}
                      </span>
                      <span>{new Date(r.created_at).toLocaleString("vi-VN")}</span>
                    </div>
                    <p className="text-slate-700">{r.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ô nhập phản hồi mới */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Nội dung phản hồi mới từ JourniTrip:
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Cảm ơn quý khách đã tin tưởng và đồng hành cùng JourniTrip..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              <Send size={13} />
              {submitting ? "Đang gửi..." : "Gửi phản hồi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

