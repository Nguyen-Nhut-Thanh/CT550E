"use client";

import { useEffect, useState } from "react";
import {
  getAdminReviewDetail,
  replyAdminReview,
  updateAdminReviewStatus,
} from "@/lib/reviews/admin/api";
import { useToast } from "@/lib/notifications/useToast";
import { Loader2, X } from "lucide-react";
import type { AdminReviewItem } from "shared";
import { ReviewDetailModal } from "@/components/reviews/admin_reviews/AdminReviewDetailModal";
import { ReviewRejectModal } from "@/components/reviews/admin_reviews/AdminReviewRejectModal";
import { ReviewReplyModal } from "@/components/reviews/admin_reviews/AdminReviewReplyModal";

interface AdminReviewDetailModalByIdProps {
  reviewId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function AdminReviewDetailModalById({
  reviewId,
  isOpen,
  onClose,
  onUpdated,
}: AdminReviewDetailModalByIdProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [review, setReview] = useState<AdminReviewItem | null>(null);

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);

  useEffect(() => {
    if (!isOpen || !reviewId) {
      setReview(null);
      setError("");
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    void getAdminReviewDetail(reviewId)
      .then((data) => {
        if (active) setReview(data);
      })
      .catch((err) => {
        if (active) setError(err?.message || "Không thể tải chi tiết đánh giá.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, reviewId]);

  if (!isOpen || !reviewId) return null;

  const handleApprove = async (id: number) => {
    try {
      await updateAdminReviewStatus(id, { status: 1 });
      toast.success(`Đã phê duyệt đánh giá #${id} thành công!`);
      setReview((prev) => (prev ? { ...prev, status: 1 } : null));
      onUpdated?.();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi phê duyệt đánh giá.");
    }
  };

  const handleConfirmReject = async (id: number, adminNote: string) => {
    try {
      await updateAdminReviewStatus(id, { status: 2, admin_note: adminNote });
      toast.success(`Đã từ chối / ẩn đánh giá #${id}.`);
      setReview((prev) => (prev ? { ...prev, status: 2, admin_note: adminNote } : null));
      setIsRejectOpen(false);
      onUpdated?.();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi từ chối đánh giá.");
    }
  };

  const handleConfirmReply = async (id: number, content: string) => {
    try {
      const reply = await replyAdminReview(id, content);
      toast.success("Đã gửi phản hồi đánh giá thành công!");
      setReview((prev) =>
        prev
          ? {
              ...prev,
              replies: [...(prev.replies || []), reply],
            }
          : null
      );
      setIsReplyOpen(false);
      onUpdated?.();
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi gửi phản hồi đánh giá.");
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
        <div className="relative flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-2xl">
          <Loader2 size={20} className="animate-spin text-blue-600" />
          <span className="text-sm font-semibold text-slate-700">Đang tải chi tiết đánh giá #{reviewId}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
        <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b">
            <h3 className="font-bold text-slate-900">Chi tiết đánh giá #{reviewId}</h3>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
          <p className="py-4 text-xs text-rose-600 font-medium">{error}</p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReviewDetailModal
        review={review}
        isOpen={isOpen && !isRejectOpen && !isReplyOpen}
        onClose={onClose}
        onApprove={handleApprove}
        onOpenReject={() => setIsRejectOpen(true)}
        onOpenReply={() => setIsReplyOpen(true)}
      />

      <ReviewRejectModal
        review={review}
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleConfirmReject}
      />

      <ReviewReplyModal
        review={review}
        isOpen={isReplyOpen}
        onClose={() => setIsReplyOpen(false)}
        onConfirm={handleConfirmReply}
      />
    </>
  );
}
