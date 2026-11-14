"use client";

import {
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Headphones,
  MapPin,
  MessageSquare,
  ShieldAlert,
  Star,
  ThumbsDown,
  User,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { AdminReviewItem } from "shared";

interface ReviewDetailModalProps {
  review: AdminReviewItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (reviewId: number) => Promise<void>;
  onOpenReject: (review: AdminReviewItem) => void;
  onOpenReply: (review: AdminReviewItem) => void;
  onContactCustomer?: (review: AdminReviewItem) => void;
}

export function ReviewDetailModal({
  review,
  isOpen,
  onClose,
  onApprove,
  onOpenReject,
  onOpenReply,
  onContactCustomer,
}: ReviewDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  if (!isOpen || !review) return null;

  const handleApprove = async () => {
    setApproving(true);
    try {
      await onApprove(review.review_id);
      onClose();
    } finally {
      setApproving(false);
    }
  };

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          <CheckCircle size={14} />
          Đã phê duyệt
        </span>
      );
    }
    if (status === 2) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
          <ThumbsDown size={14} />
          Đã từ chối / Ẩn
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
        <Clock size={14} />
        Chờ kiểm duyệt
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl transition-all [scrollbar-width:thin]">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-900">
              Chi tiết đánh giá #{review.review_id}
            </h3>
            {getStatusBadge(review.status)}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer & Tour Card */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            {/* Khách hàng */}
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white bg-blue-100 shadow-sm">
                {review.user?.avatar_url ? (
                  <Image
                    src={review.user.avatar_url}
                    alt={review.user.full_name || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-blue-600">
                    {(review.user?.full_name || "U")[0]}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400">Khách hàng</p>
                <p className="truncate text-sm font-bold text-slate-900">
                  {review.user?.full_name || "Khách hàng ẩn danh"}
                </p>
                <p className="text-xs text-slate-500">Mã KH: #{review.user_id}</p>
              </div>
            </div>

            {/* Tour & Booking */}
            <div className="min-w-0 border-t border-slate-200/60 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
              <p className="text-xs font-medium text-slate-400">Tour trải nghiệm</p>
              <Link
                href={`/tours/${review.tour_id}`}
                target="_blank"
                className="group flex items-center gap-1.5 truncate text-sm font-bold text-blue-600 hover:text-blue-800"
              >
                <span className="truncate">{review.tour_name}</span>
                <ExternalLink size={13} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                <span>Mã: <strong className="text-slate-700">{review.tour_code}</strong></span>
                {review.booking_id && (
                  <span>Đơn đặt: <strong className="text-slate-700">#{review.booking_id}</strong></span>
                )}
              </div>
            </div>
          </div>

          {/* Rating, Title, and Review Text */}
          <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={
                        i < review.rating
                          ? "fill-amber-400 text-amber-500"
                          : "fill-slate-100 text-slate-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-800">
                  {review.rating}/5 sao
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar size={13} />
                <span>
                  {new Date(review.created_at).toLocaleString("vi-VN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
            </div>

            {review.title && (
              <h4 className="text-base font-bold text-slate-900">
                {review.title}
              </h4>
            )}

            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
              {review.comment || "Khách hàng không để lại nhận xét chi tiết."}
            </p>

            {/* Images Gallery */}
            {review.images && review.images.length > 0 && (
              <div className="pt-3">
                <p className="mb-2 text-xs font-semibold text-slate-500">
                  Hình ảnh đính kèm ({review.images.length} ảnh):
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {review.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className="group relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 shadow-sm transition hover:scale-105"
                    >
                      <Image
                        src={img}
                        alt={`Ảnh review ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/10 opacity-0 transition group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ghi chú quản trị nếu có */}
          {review.admin_note && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50/60 p-4 text-xs text-rose-900">
              <ShieldAlert size={18} className="shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-bold">Ghi chú của Quản trị viên:</span>
                <p className="mt-0.5 text-rose-800">{review.admin_note}</p>
              </div>
            </div>
          )}

          {/* Replies list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-600" />
                Phản hồi từ JourniTrip ({review.replies?.length || 0})
              </h4>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReply(review);
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                + Thêm phản hồi
              </button>
            </div>

            {review.replies && review.replies.length > 0 ? (
              <div className="space-y-2.5">
                {review.replies.map((reply) => (
                  <div
                    key={reply.reply_id}
                    className="rounded-xl border border-slate-200/70 bg-slate-50/80 p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-blue-700">
                        {reply.user?.full_name || "Quản trị viên / Hỗ trợ viên"}
                      </span>
                      <span className="text-slate-400">
                        {new Date(reply.created_at).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs italic text-slate-400">
                Chưa có phản hồi nào cho đánh giá này.
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            {onContactCustomer && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onContactCustomer(review);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
              >
                <Headphones size={14} className="text-amber-700" />
                Chat xử lý với khách
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReply(review);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              <MessageSquare size={14} />
              Trả lời khách
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {review.status !== 2 && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenReject(review);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                <ThumbsDown size={14} />
                Từ chối / Ẩn
              </button>
            )}

            {review.status !== 1 && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={approving}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle size={14} />
                {approving ? "Đang duyệt..." : "Phê duyệt đánh giá"}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-black">
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/90"
            >
              <X size={20} />
            </button>
            <img
              src={selectedImage}
              alt="Ảnh phóng to"
              className="max-h-[85vh] w-auto max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

