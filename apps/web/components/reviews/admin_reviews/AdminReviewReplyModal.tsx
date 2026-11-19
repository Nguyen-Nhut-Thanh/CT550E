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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-[14px] border border-[#e1edfc] bg-white shadow-xl transition-all">
        <div className="flex items-center justify-between border-b border-[#edf2fb] p-4.5 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#075bff] shrink-0">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#07123e]">
                Phản hồi đánh giá #{review.review_id}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#7187a9] mt-0.5">
                Câu trả lời sẽ hiển thị công khai dưới đánh giá của khách hàng.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4.5 sm:p-5 space-y-3.5">
          {/* Review tóm tắt */}
          <div className="rounded-[14px] border border-[#e1edfc] bg-slate-50/60 p-3.5 text-xs">
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
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Phản hồi trước đó:
              </label>
              <div className="max-h-36 overflow-y-auto space-y-2 rounded-lg border border-[#e1edfc] bg-slate-50/50 p-2.5">
                {review.replies.map((r) => (
                  <div key={r.reply_id} className="rounded-lg bg-white p-2.5 border border-[#e1edfc] text-xs">
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
              className="w-full rounded-lg border border-[#e1edfc] bg-white p-3 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#075bff] px-3.5 py-1.5 text-xs font-[650] text-white shadow-2xs transition hover:bg-[#064ed8] active:scale-95 disabled:opacity-50 cursor-pointer"
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

