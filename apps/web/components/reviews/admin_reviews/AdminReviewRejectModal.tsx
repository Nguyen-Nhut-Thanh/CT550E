"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import type { AdminReviewItem } from "shared";

interface ReviewRejectModalProps {
  review: AdminReviewItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reviewId: number, adminNote: string) => Promise<void>;
}

const PRESET_REASONS = [
  "Nội dung chứa ngôn từ phản cảm, thô tục hoặc công kích cá nhân",
  "Nội dung quảng cáo, spam, chèn link ngoài hoặc lôi kéo thương mại",
  "Nội dung hoặc hình ảnh không liên quan đến chuyến đi",
  "Thông tin sai sự thật hoặc vu khống không có căn cứ",
  "Đánh giá nhầm dịch vụ hoặc không đúng đối tượng",
];

export function ReviewRejectModal({
  review,
  isOpen,
  onClose,
  onConfirm,
}: ReviewRejectModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !review) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalNote = note.trim() || selectedPreset || "Vi phạm tiêu chuẩn cộng đồng";
    setSubmitting(true);
    try {
      await onConfirm(review.review_id, finalNote);
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-[#07123e]">
                Từ chối / Ẩn đánh giá #{review.review_id}
              </h3>
              <p className="text-[11px] sm:text-xs text-[#7187a9] mt-0.5">
                Đánh giá này sẽ không được hiển thị công khai trên website.
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
          {/* Tóm tắt review */}
          <div className="rounded-[14px] border border-[#e1edfc] bg-slate-50/60 p-3 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-semibold text-slate-700">
                {review.user?.full_name || "Khách hàng"}
              </span>
              <span>Tour: {review.tour_code}</span>
            </div>
            <p className="mt-1.5 line-clamp-2 italic text-slate-600">
              “{review.comment || review.title || "Không có nội dung"}”
            </p>
          </div>

          {/* Chọn lý do nhanh */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Chọn lý do từ chối nhanh:
            </label>
            <div className="space-y-1.5">
              {PRESET_REASONS.map((preset) => (
                <label
                  key={preset}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-xs transition ${
                    selectedPreset === preset
                      ? "border-rose-300 bg-rose-50/50 text-rose-900"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="reject-reason"
                    checked={selectedPreset === preset}
                    onChange={() => {
                      setSelectedPreset(preset);
                      if (!note) setNote(preset);
                    }}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <span>{preset}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ghi chú chi tiết */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
              Ghi chú của quản trị viên (Admin Note):
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập lý do chi tiết hoặc hướng xử lý nội bộ..."
              className="w-full rounded-lg border border-[#e1edfc] bg-white p-3 text-xs text-slate-800 outline-none transition focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
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
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-[650] text-white shadow-2xs transition hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Đang xử lý..." : "Xác nhận từ chối"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

