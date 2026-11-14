"use client";

import { useState } from "react";
import { ReviewAvatar } from "@/components/tours/reviews/ReviewAvatar";
import { StarRating } from "@/components/common/tours/StarRating";
import { CheckCircle, ChevronRight, X } from "lucide-react";
import type { TourReviewsSectionProps } from "shared";

export default function TourReviewsSection({
  averageRating = 5,
  totalReviews = 0,
  breakdown = [],
  reviews = [],
  onViewAll,
}: TourReviewsSectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const hasReviews = reviews && reviews.length > 0;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4 sm:p-5">
        <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
          Đánh giá của khách hàng
        </h2>

        {/* Tổng quan đánh giá */}
        <div className="mt-3 grid gap-4 md:grid-cols-[170px_1fr] md:items-start">
          <div>
            <div className="flex items-end gap-1">
              <span className="text-4xl font-black leading-none text-slate-900">
                {hasReviews ? averageRating.toFixed(1) : "5.0"}
              </span>
              <span className="pb-1 text-base font-bold text-slate-500">/5</span>
            </div>

            <div className="mt-2">
              <StarRating rating={hasReviews ? averageRating : 5} size="h-5 w-5" />
            </div>

            <p className="mt-2 text-xs font-medium text-slate-500">
              {totalReviews.toLocaleString("vi-VN")} đánh giá
            </p>
          </div>

          {breakdown && breakdown.length > 0 ? (
            <div className="space-y-1.5">
              {breakdown
                .slice()
                .sort((a, b) => b.stars - a.stars)
                .map((item) => (
                  <div
                    key={item.stars}
                    className="grid grid-cols-[40px_1fr_42px] items-center gap-3"
                  >
                    <span className="text-xs font-semibold text-slate-500">
                      {item.stars} sao
                    </span>

                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-amber-400 transition-all"
                        style={{
                          width: `${Math.max(0, Math.min(item.percent, 100))}%`,
                        }}
                      />
                    </div>

                    <span className="text-right text-xs font-semibold text-slate-500">
                      {item.percent}%
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-xs font-medium text-slate-400 self-center">
              Chưa có thông tin phân bổ đánh giá.
            </div>
          )}
        </div>
      </div>

      {/* Danh sách review */}
      <div className="border-t border-slate-100">
        {!hasReviews ? (
          <div className="p-8 text-center text-sm font-medium text-slate-500">
            Chưa có đánh giá nào cho tour này. Hãy là người đầu tiên trải nghiệm và chia sẻ nhận xét!
          </div>
        ) : (
          reviews.slice(0, 5).map((review, index) => (
            <article
              key={review.id}
              className={`p-4 sm:p-5 ${
                index > 0 ? "border-t border-slate-100" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <ReviewAvatar review={review} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold text-slate-900 sm:text-base">
                    {review.name}
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <StarRating rating={review.rating} size="h-3.5 w-3.5" />

                    {review.timeAgo ? (
                      <>
                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                        <span className="text-xs font-medium text-slate-400">
                          {review.timeAgo}
                        </span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              {review.title && (
                <p className="mt-2 font-bold text-slate-900 text-sm">
                  {review.title}
                </p>
              )}

              <p className="mt-2 text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
                {review.content}
              </p>

              {/* Uploaded Images */}
              {review.images && review.images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {review.images.map((imgUrl, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setSelectedImage(imgUrl)}
                      className="relative h-14 w-14 overflow-hidden rounded-xl border border-slate-200 transition hover:opacity-90 active:scale-95 cursor-pointer shadow-xs"
                    >
                      <img
                        src={imgUrl}
                        alt="Ảnh chụp từ khách hàng"
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Replies from JourniTrip/Staff */}
              {review.replies && review.replies.length > 0 && (
                <div className="mt-3 space-y-2">
                  {review.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center gap-1.5 font-bold text-blue-900">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white">
                          <CheckCircle size={10} />
                        </span>
                        <span>{reply.userName || "JourniTrip CSKH"}</span>
                        {reply.createdAt && (
                          <span className="text-[10px] font-normal text-slate-400">
                            • {new Date(reply.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 leading-relaxed pl-5 whitespace-pre-wrap">
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

      {hasReviews && (
        <div className="border-t border-slate-100 px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onViewAll}
            className="group inline-flex items-center gap-1 text-sm font-extrabold text-[#0b63b6] transition hover:text-sky-700 cursor-pointer"
          >
            Xem tất cả đánh giá
            <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
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
    </section>
  );
}
