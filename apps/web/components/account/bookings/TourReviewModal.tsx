"use client";

import { useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  CheckCircle2,
  Headphones,
  ImagePlus,
  Loader2,
  MessageCircle,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { Dialog } from "@/components/common/overlays/Dialog";
import { openSupportChat } from "@/lib/chat/support";
import { createTourReview, uploadReviewImage } from "@/lib/account/reviewsApi";
import type { BookingItemUI } from "shared";

const EMOTIONS = [
  { rating: 1, label: "Rất thất vọng", icon: "😡" },
  { rating: 2, label: "Chưa hài lòng", icon: "🙁" },
  { rating: 3, label: "Bình thường", icon: "😐" },
  { rating: 4, label: "Hài lòng", icon: "🙂" },
  { rating: 5, label: "Tuyệt vời!", icon: "😍" },
];

const NEGATIVE_CHIPS = [
  "Xe đưa đón trễ",
  "Hướng dẫn viên thiếu nhiệt tình",
  "Bữa ăn chưa ngon",
  "Khách sạn chưa tốt",
  "Lịch trình gấp gáp",
  "Dịch vụ chưa đúng cam kết",
];

const POSITIVE_CHIPS = [
  "Hướng dẫn viên nhiệt tình",
  "Khách sạn đẹp & sạch",
  "Lịch trình hợp lý",
  "Ăn uống phong phú",
  "Xe đời mới êm ái",
  "Đáng giá tiền",
];

export function TourReviewModal({
  open,
  booking,
  onClose,
  onSuccess,
}: {
  open: boolean;
  booking: BookingItemUI | null;
  onClose: () => void;
  onSuccess: (bookingId: number, review: any) => void;
}) {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingReview = booking?.review;
  const isViewOnly = Boolean(existingReview);

  const [rating, setRating] = useState<number>(existingReview?.rating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState<string>(existingReview?.comment || "");
  const [images, setImages] = useState<string[]>(
    Array.isArray(existingReview?.images) ? (existingReview.images as string[]) : []
  );

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeRating = hoverRating || rating;
  const activeEmotion = useMemo(
    () => EMOTIONS.find((e) => e.rating === activeRating) || EMOTIONS[4],
    [activeRating]
  );

  const isLowRating = activeRating <= 2;

  // Toggle feedback chip text in comment
  const handleToggleChip = (chip: string) => {
    if (isViewOnly) return;
    setComment((prev) => {
      const trimmed = prev.trim();
      if (trimmed.includes(chip)) {
        return trimmed
          .replace(new RegExp(`(\\s*,?\\s*${chip}|${chip}\\s*,?\\s*)`, "g"), "")
          .trim();
      }
      return trimmed ? `${trimmed}, ${chip}` : chip;
    });
  };

  // Upload single photo
  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (images.length >= 5) {
      setError("Bạn chỉ có thể tải lên tối đa 5 hình ảnh.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chỉ chọn tệp hình ảnh (JPG, PNG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước ảnh tối đa là 5MB.");
      return;
    }

    try {
      setUploadingImage(true);
      setError(null);
      const { url } = await uploadReviewImage(file);
      setImages((prev) => [...prev, url]);
    } catch (err: any) {
      setError(err?.message || "Không thể tải ảnh lên, vui lòng thử lại.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    if (isViewOnly) return;
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!booking) return;

    if (!comment.trim() || comment.trim().length < 10) {
      setError("Vui lòng viết nhận xét chi tiết ít nhất 10 ký tự.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const result = await createTourReview(booking.tourId, {
        tour_id: booking.tourId,
        booking_id: booking.id,
        rating,
        comment: comment.trim(),
        images: images.length > 0 ? images : undefined,
      });

      setSuccessMessage(result.message);
      onSuccess(booking.id, {
        review_id: result.review.review_id,
        tour_id: booking.tourId,
        booking_id: booking.id,
        rating,
        comment: comment.trim(),
        images,
        status: result.review.status,
        created_at: new Date().toISOString(),
      });

      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
      }, 1600);
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !booking) return null;

  return (
    <Dialog onClose={onClose} labelledBy={titleId}>
      <div className="w-[min(560px,calc(100vw-32px))] max-h-[calc(100dvh-48px)] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0 bg-gradient-to-r from-blue-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-xs">
              <Star className="fill-amber-400 text-amber-500" size={24} />
            </div>
            <div>
              <h3 id={titleId} className="text-lg font-extrabold text-slate-900 leading-tight">
                {isViewOnly ? "Đánh giá của bạn" : "Đánh giá trải nghiệm chuyến đi"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {isViewOnly
                  ? "Xem lại nhận xét và điểm đánh giá cho tour này"
                  : "Chia sẻ cảm nhận thực tế giúp cải thiện chất lượng dịch vụ"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng popup"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm text-slate-700 [scrollbar-width:thin]">
          {/* Tour Brief Card */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#f8faff] border border-[#e5eef9]">
            <div className="relative aspect-[16/10] w-24 shrink-0 overflow-hidden rounded-xl bg-slate-200">
              <Image
                src={booking.image}
                alt={booking.name}
                fill
                className="object-cover"
                sizes="100px"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <span className="text-[11px] font-bold text-[#095fff] tracking-wide uppercase">
                Đơn đặt #{booking.id}
              </span>
              <h4 className="font-extrabold text-slate-900 text-sm truncate" title={booking.name}>
                {booking.name}
              </h4>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <CalendarDays size={13} className="text-slate-400 shrink-0" />
                <span>
                  {booking.startDate} - {booking.endDate}
                </span>
              </div>
            </div>
          </div>

          {/* Success Notification */}
          {successMessage && (
            <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-50 p-4 text-emerald-800 border border-emerald-200 animate-in fade-in">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <p className="text-xs font-semibold">{successMessage}</p>
            </div>
          )}

          {/* Error Notification */}
          {error && (
            <div className="rounded-2xl bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 border border-rose-200 animate-in fade-in">
              {error}
            </div>
          )}

          {/* Existing Review Status Banner */}
          {isViewOnly && (
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-3.5 border border-slate-200 text-xs font-semibold">
              <span className="text-slate-600">Trạng thái bài đánh giá:</span>
              {existingReview?.status === 1 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  ✓ Đã được duyệt công khai
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                  ⏳ Đang chờ quản trị viên duyệt
                </span>
              )}
            </div>
          )}

          {/* Star Rating Picker */}
          <div className="text-center space-y-2 py-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bạn đánh giá thế nào về chuyến đi?
            </p>
            <div className="flex items-center justify-center gap-2.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={isViewOnly}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => !isViewOnly && setHoverRating(star)}
                  onMouseLeave={() => !isViewOnly && setHoverRating(null)}
                  className={`p-1.5 transition-transform ${
                    isViewOnly ? "cursor-default" : "hover:scale-120 cursor-pointer"
                  }`}
                  aria-label={`${star} sao`}
                >
                  <Star
                    size={36}
                    className={`transition-colors ${
                      star <= activeRating
                        ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                        : "text-slate-200"
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-700 animate-in fade-in">
              <span>{activeEmotion.icon}</span>
              <span>{activeEmotion.label}</span>
            </div>
          </div>

          {/* Service Recovery Banner (Khi khách đánh giá 1 - 2 sao) */}
          {isLowRating && !isViewOnly && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-amber-900 transition-all animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Headphones size={20} />
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-amber-900">
                    Chúng tôi rất tiếc vì trải nghiệm của bạn chưa trọn vẹn!
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Nếu bạn có điều gì chưa hài lòng về chất lượng dịch vụ, hướng dẫn viên, khách sạn
                    hay xe đưa đón, xin vui lòng liên hệ ngay để nhân viên kịp thời lắng nghe và hỗ trợ
                    giải quyết thỏa đáng cho bạn.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      openSupportChat({ booking_id: booking.id });
                      onClose();
                    }}
                    className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    <MessageCircle size={15} />
                    Liên hệ nhân viên hỗ trợ ngay
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Feedback Chips */}
          {!isViewOnly && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600">
                Gợi ý phản hồi nhanh (bấm để thêm vào nhận xét):
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(isLowRating ? NEGATIVE_CHIPS : POSITIVE_CHIPS).map((chip) => {
                  const active = comment.includes(chip);
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleToggleChip(chip)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
                        active
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {active ? `✓ ${chip}` : `+ ${chip}`}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Comment Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="review-comment" className="font-bold text-slate-700">
                Nhận xét chi tiết <span className="text-rose-500">*</span>
              </label>
              {!isViewOnly && (
                <span className="text-slate-400 font-medium">{comment.length}/1000 ký tự</span>
              )}
            </div>
            <textarea
              id="review-comment"
              rows={4}
              maxLength={1000}
              disabled={isViewOnly || submitting}
              placeholder="Chia sẻ trải nghiệm thực tế của bạn về lịch trình, dịch vụ, tài xế, hướng dẫn viên và cảnh đẹp chuyến đi..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white p-3.5 text-xs text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-50 disabled:bg-slate-50 disabled:text-slate-600 leading-relaxed"
            />
          </div>

          {/* Upload Images Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Hình ảnh chuyến đi {!isViewOnly && "(tối đa 5 ảnh)"}
            </label>

            <div className="flex flex-wrap gap-2.5">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative group aspect-square w-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                >
                  <Image src={imgUrl} alt={`Ảnh ${idx + 1}`} fill className="object-cover" />
                  {!isViewOnly && (
                    <button
                      type="button"
                      aria-label="Xóa ảnh"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}

              {!isViewOnly && images.length < 5 && (
                <button
                  type="button"
                  disabled={uploadingImage}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center aspect-square w-20 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:border-slate-400 transition"
                >
                  {uploadingImage ? (
                    <Loader2 size={20} className="animate-spin text-blue-600" />
                  ) : (
                    <>
                      <ImagePlus size={20} />
                      <span className="text-[10px] font-bold mt-1">Thêm ảnh</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadImage}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            {isViewOnly ? "Đóng" : "Hủy bỏ"}
          </button>

          {!isViewOnly && (
            <button
              type="button"
              disabled={submitting || !comment.trim()}
              onClick={handleSubmit}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#095fff] px-6 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              <span>Gửi đánh giá</span>
            </button>
          )}
        </div>
      </div>
    </Dialog>
  );
}

