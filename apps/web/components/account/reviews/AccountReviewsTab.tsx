"use client";

import { Dialog } from "@/components/common/overlays/Dialog";
import { StarRating } from "@/components/common/tours/StarRating";
import { ImageWithFallback } from "@/components/common/media/ImageWithFallback";
import { getMyReviews, updateMyReview } from "@/lib/account/reviewsApi";
import { useAccountResource } from "@/lib/account/useAccountResource";
import { Loader2, MoreHorizontal, Pencil, Star, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { AccountReviewItem } from "shared";

export function AccountReviewsTab() {
  const {
    data: reviews = [],
    loading,
    error,
    refresh: load,
    update: setReviews,
  } = useAccountResource("reviews", getMyReviews);
  const [approvedOnly, setApprovedOnly] = useState(false);
  const [editing, setEditing] = useState<AccountReviewItem | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [notice, setNotice] = useState("");
  const [gallery, setGallery] = useState<{
    images: string[];
    index: number;
  } | null>(null);
  const [menu, setMenu] = useState<number | null>(null);
  function edit(review: AccountReviewItem) {
    setEditing(review);
    setRating(review.rating);
    setComment(review.comment ?? "");
    setEditError("");
    setMenu(null);
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setEditError("");
    try {
      const result = await updateMyReview(editing.review_id, {
        rating,
        comment,
      });
      setReviews((items) =>
        items.map((item) =>
          item.review_id === editing.review_id
            ? { ...item, rating, comment: comment.trim(), status: 0 }
            : item,
        ),
      );
      setNotice(result.message);
      setEditing(null);
    } catch (cause) {
      setEditError(
        cause instanceof Error ? cause.message : "Không thể lưu đánh giá.",
      );
    } finally {
      setSaving(false);
    }
  }
  const approved = reviews.filter((review) => review.status === 1);
  const visible = approvedOnly ? approved : reviews;
  return (
    <div className="w-full space-y-5 pt-1">
      <header>
        <h1 className="text-[26px] font-extrabold tracking-tight text-slate-900">
          Bài đánh giá
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Những đánh giá bạn đã viết về các tour
        </p>
      </header>
      <div className="flex gap-2" aria-label="Lọc bài đánh giá">
        {[false, true].map((value) => (
          <button
            key={String(value)}
            aria-pressed={approvedOnly === value}
            onClick={() => setApprovedOnly(value)}
            className={`rounded-full px-6 py-2 text-sm font-semibold transition ${approvedOnly === value ? "bg-[#2094d3] text-white shadow-sm" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
          >
            {value ? "Đã đánh giá" : "Tất cả"}{" "}
            {!loading && `(${value ? approved.length : reviews.length})`}
          </button>
        ))}
      </div>
      {notice && (
        <p
          role="status"
          className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"
        >
          {notice}
        </p>
      )}
      {loading ? (
        <div
          role="status"
          className="flex justify-center gap-3 rounded-2xl bg-white py-16 text-sm text-slate-500"
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          Đang tải bài đánh giá...
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl bg-white p-10 text-center">
          <p className="text-sm text-rose-600">{error}</p>
          <button
            onClick={() => void load()}
            className="mt-4 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-600"
          >
            Thử lại
          </button>
        </div>
      ) : !visible.length ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center">
          <Star className="mx-auto mb-3 h-10 w-10 text-amber-300" />
          <p className="font-semibold text-slate-700">
            {approvedOnly
              ? "Chưa có bài đánh giá được duyệt"
              : "Bạn chưa có bài đánh giá nào"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {approvedOnly
              ? "Bài đánh giá sẽ xuất hiện tại đây sau khi được duyệt."
              : "Chia sẻ cảm nhận của bạn sau mỗi chuyến đi."}
          </p>
          <Link
            href="/account/bookings"
            className="mt-5 inline-block text-sm font-semibold text-blue-600"
          >
            Xem lịch sử đặt tour
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white px-4 sm:px-5">
          {visible.map((review) => (
            <article
              key={review.review_id}
              className="flex flex-col gap-4 py-5 sm:flex-row"
            >
              <Link href={`/tours/${review.tour_id}`} className="shrink-0">
                <ImageWithFallback
                  src={review.tour_image || "/images/shared/travel-cover.png"}
                  fallback="/images/shared/travel-cover.png"
                  alt={review.tour_name}
                  className="h-40 w-full rounded-lg object-cover sm:h-[112px] sm:w-[170px]"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/tours/${review.tour_id}`}
                  className="text-[15px] font-bold text-slate-900 hover:text-blue-600"
                >
                  {review.tour_name}
                </Link>
                <p className="mt-0.5 text-xs text-slate-400">
                  Đánh giá ngày{" "}
                  {new Date(review.created_at).toLocaleDateString("vi-VN", {
                    timeZone: "Asia/Bangkok",
                  })}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StarRating rating={review.rating} />
                  <span className="text-sm font-semibold text-slate-600">
                    {review.rating.toFixed(1)}
                  </span>
                  {review.status !== 1 && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] ${review.status === 0 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-600"}`}
                    >
                      {review.status === 0 ? "Chờ duyệt" : "Chưa được duyệt"}
                    </span>
                  )}
                </div>
                {review.title && (
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {review.title}
                  </p>
                )}
                <p className="mt-1.5 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-slate-500">
                  {review.comment || "Không có nội dung nhận xét."}
                </p>
                <div className="mt-2 flex gap-1.5">
                  {review.images.slice(0, 4).map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      onClick={() =>
                        setGallery({ images: review.images, index })
                      }
                      className="relative h-10 w-11 overflow-hidden rounded-md"
                      aria-label={`Xem ảnh đánh giá ${index + 1}`}
                    >
                      <img
                        src={image}
                        alt={`Ảnh chuyến đi ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {index === 3 && review.images.length > 4 && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-semibold text-white">
                          +{review.images.length - 3}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start">
                <button
                  aria-label={`Tùy chọn đánh giá ${review.tour_name}`}
                  aria-expanded={menu === review.review_id}
                  onClick={() =>
                    setMenu(menu === review.review_id ? null : review.review_id)
                  }
                  className="rounded p-1 text-slate-500 hover:bg-slate-100"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                {menu === review.review_id && (
                  <div className="absolute right-0 top-8 z-10 rounded-lg border bg-white p-2 shadow-lg">
                    <Link
                      href={`/tours/${review.tour_id}`}
                      className="block whitespace-nowrap px-3 py-2 text-sm text-slate-600"
                    >
                      Xem chi tiết tour
                    </Link>
                    <button
                      onClick={() => edit(review)}
                      className="px-3 py-2 text-sm text-blue-600"
                    >
                      Chỉnh sửa đánh giá
                    </button>
                  </div>
                )}
                <button
                  onClick={() => edit(review)}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#eef8ff] px-3 py-2 text-xs font-semibold text-[#2586bd] hover:bg-blue-100 sm:mt-3"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Chỉnh sửa
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      {editing && (
        <Dialog
          onClose={() => {
            if (!saving) setEditing(null);
          }}
          labelledBy="edit-review-title"
        >
          <section className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 id="edit-review-title" className="text-lg font-bold">
                Chỉnh sửa đánh giá
              </h2>
              <button
                disabled={saving}
                onClick={() => setEditing(null)}
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-500">{editing.tour_name}</p>
            <form onSubmit={save} className="mt-5 space-y-4">
              <fieldset>
                <legend className="mb-2 text-sm font-semibold">
                  Mức độ hài lòng
                </legend>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      disabled={saving}
                      aria-label={`${value} sao`}
                      aria-pressed={rating === value}
                      onClick={() => setRating(value)}
                    >
                      <Star
                        className={`h-7 w-7 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="block text-sm font-semibold">
                Nhận xét
                <textarea
                  autoFocus
                  required
                  maxLength={5000}
                  disabled={saving}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  rows={5}
                  className="mt-2 block w-full rounded-lg border border-slate-200 p-3 font-normal focus:border-blue-400 focus:outline-none"
                />
              </label>
              <p className="text-xs text-slate-500">
                Sau khi lưu, đánh giá sẽ được gửi lại để duyệt.
              </p>
              {editError && (
                <p role="alert" className="text-sm text-rose-600">
                  {editError}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setEditing(null)}
                  className="rounded-lg px-4 py-2 text-sm text-slate-500"
                >
                  Hủy
                </button>
                <button
                  disabled={saving || !comment.trim()}
                  className="flex items-center gap-2 rounded-lg bg-[#2094d3] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}Lưu
                  đánh giá
                </button>
              </div>
            </form>
          </section>
        </Dialog>
      )}
      {gallery && (
        <Dialog
          onClose={() => setGallery(null)}
          labelledBy="review-gallery-title"
          overlayClassName="bg-slate-950/90"
        >
          <div className="flex flex-col items-center gap-4">
            <h2 id="review-gallery-title" className="sr-only">
              Ảnh đánh giá
            </h2>
            <button
              autoFocus
              onClick={() => setGallery(null)}
              aria-label="Đóng ảnh"
              className="absolute right-5 top-5 p-2 text-white"
            >
              <X />
            </button>
            <img
              src={gallery.images[gallery.index]}
              alt={`Ảnh đánh giá ${gallery.index + 1}`}
              className="max-h-[70vh] max-w-full rounded-lg object-contain"
            />
            <div className="flex items-center gap-5 text-sm text-white">
              <button
                disabled={gallery.index === 0}
                onClick={() =>
                  setGallery({ ...gallery, index: gallery.index - 1 })
                }
                className="disabled:opacity-30"
              >
                Ảnh trước
              </button>
              <span>
                {gallery.index + 1} / {gallery.images.length}
              </span>
              <button
                disabled={gallery.index === gallery.images.length - 1}
                onClick={() =>
                  setGallery({ ...gallery, index: gallery.index + 1 })
                }
                className="disabled:opacity-30"
              >
                Ảnh sau
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
