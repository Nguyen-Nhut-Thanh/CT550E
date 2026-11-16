"use client";

import { useMemo, useState } from "react";
import { ReviewAvatar } from "@/components/reviews/customer_reviews/UserReviewAvatar";
import { StarRating } from "@/components/tour_cards/elements/UserStarRating";
import { Camera, CheckCircle, Image as ImageIcon, MessageSquare, Star, X } from "lucide-react";
import type { RatingBreakdownItem, ReviewItem } from "shared";

interface TourReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourName: string;
  averageRating: number;
  totalReviews: number;
  breakdown?: RatingBreakdownItem[];
  reviews: ReviewItem[];
}

export function TourReviewsModal({
  isOpen,
  onClose,
  tourName,
  averageRating,
  totalReviews,
  breakdown = [],
  reviews = [],
}: TourReviewsModalProps) {
  const [selectedStar, setSelectedStar] = useState<number | "all">("all");
  const [onlyWithImages, setOnlyWithImages] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (selectedStar !== "all" && r.rating !== selectedStar) {
        return false;
      }
      if (onlyWithImages && (!r.images || r.images.length === 0)) {
        return false;
      }
      return true;
    });
  }, [reviews, selectedStar, onlyWithImages]);

  const countWithImages = useMemo(() => {
    return reviews.filter((r) => r.images && r.images.length > 0).length;
  }, [reviews]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Đánh giá từ khách hàng
            </h3>
            <p className="line-clamp-1 text-xs font-medium text-slate-500">
              {tourName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 [scrollbar-width:thin]">
          {/* Top Rating Overview */}
          <div className="grid gap-5 rounded-2xl border border-blue-50 bg-blue-50/40 p-4 sm:grid-cols-[160px_1fr] sm:items-center">
            <div className="text-center sm:text-left">
              <div className="flex items-end justify-center gap-1 sm:justify-start">
                <span className="text-4xl font-black text-slate-900">
                  {averageRating.toFixed(1)}
                </span>
                <span className="pb-1 text-base font-bold text-slate-400">/5</span>
              </div>
              <div className="mt-1 flex justify-center sm:justify-start">
                <StarRating rating={averageRating} size="h-4 w-4" />
              </div>
              <p className="mt-1.5 text-xs font-semibold text-slate-500">
                {totalReviews.toLocaleString("vi-VN")} lượt đánh giá
              </p>
            </div>

            {/* Breakdown bars */}
            {breakdown && breakdown.length > 0 ? (
              <div className="space-y-1.5">
                {breakdown
                  .slice()
                  .sort((a, b) => b.stars - a.stars)
                  .map((item) => (
                    <button
                      type="button"
                      key={item.stars}
                      onClick={() =>
                        setSelectedStar((curr) =>
                          curr === item.stars ? "all" : item.stars
                        )
                      }
                      className={`grid w-full grid-cols-[45px_1fr_45px] items-center gap-3 rounded-lg px-2 py-0.5 text-left transition hover:bg-white/80 cursor-pointer ${
                        selectedStar === item.stars ? "bg-white font-bold shadow-xs ring-1 ring-blue-200" : ""
                      }`}
                    >
                      <span className="text-xs text-slate-600 font-medium">
                        {item.stars} sao
                      </span>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200/80">
                        <div
                          className="h-full rounded-full bg-amber-400 transition-all"
                          style={{
                            width: `${Math.max(0, Math.min(item.percent, 100))}%`,
                          }}
                        />
                      </div>
                      <span className="text-right text-xs text-slate-500">
                        {item.percent}%
                      </span>
                    </button>
                  ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 self-center">
                Chưa có dữ liệu phân bổ số sao.
              </div>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSelectedStar("all")}
              className={`rounded-full px-3.5 py-1.5 transition ${
                selectedStar === "all"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất cả ({reviews.length})
            </button>

            {[5, 4, 3, 2, 1].map((s) => {
              const count = reviews.filter((r) => r.rating === s).length;
              if (count === 0 && selectedStar !== s) return null;
              return (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSelectedStar((curr) => (curr === s ? "all" : s))}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 transition ${
                    selectedStar === s
                      ? "bg-amber-500 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Star size={12} className={selectedStar === s ? "fill-white text-white" : "fill-amber-400 text-amber-500"} />
                  <span>{s} sao ({count})</span>
                </button>
              );
            })}

            {countWithImages > 0 && (
              <button
                type="button"
                onClick={() => setOnlyWithImages((v) => !v)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 transition ${
                  onlyWithImages
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Camera size={13} />
                <span>Có hình ảnh ({countWithImages})</span>
              </button>
            )}
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="py-12 text-center text-sm font-medium text-slate-400">
                Không tìm thấy đánh giá phù hợp với bộ lọc đã chọn.
              </div>
            ) : (
              filteredReviews.map((review) => (
                <article
                  key={review.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <ReviewAvatar review={review} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {review.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <StarRating rating={review.rating} size="h-3.5 w-3.5" />
                        {review.timeAgo && (
                          <>
                            <span className="h-1 w-1 rounded-full bg-slate-300" />
                            <span className="text-xs text-slate-400 font-medium">
                              {review.timeAgo}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <p className="font-bold text-slate-900 text-sm">
                      {review.title}
                    </p>
                  )}

                  <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {review.content}
                  </p>

                  {/* Customer Uploaded Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {review.images.map((imgUrl, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setLightboxImage(imgUrl)}
                          className="relative h-16 w-16 overflow-hidden rounded-xl border border-slate-200 transition hover:opacity-90 active:scale-95 cursor-pointer shadow-xs"
                        >
                          <img
                            src={imgUrl}
                            alt="Ảnh chụp thực tế của khách"
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Official Replies from JourniTrip/Staff */}
                  {review.replies && review.replies.length > 0 && (
                    <div className="space-y-2 pt-2">
                      {review.replies.map((reply) => (
                        <div
                          key={reply.id}
                          className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs space-y-1.5"
                        >
                          <div className="flex items-center gap-1.5 font-bold text-blue-900">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                              <CheckCircle size={12} />
                            </span>
                            <span>{reply.userName || "JourniTrip CSKH"}</span>
                            {reply.createdAt && (
                              <span className="text-[11px] font-normal text-slate-400">
                                • {new Date(reply.createdAt).toLocaleDateString("vi-VN")}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 leading-relaxed pl-6 whitespace-pre-wrap">
                            {reply.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 bg-slate-50 px-6 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-300"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-black">
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/90"
            >
              <X size={20} />
            </button>
            <img
              src={lightboxImage}
              alt="Ảnh phóng to"
              className="max-h-[85vh] w-auto max-w-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

