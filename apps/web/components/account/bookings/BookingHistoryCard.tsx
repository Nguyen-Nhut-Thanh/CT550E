"use client";

import { openSupportChat } from "@/lib/chat/support";
import { formatVND } from "@/lib/utils/currency";
import { normalizeImageSrc, PLACEHOLDER_IMAGE } from "@/lib/utils/images";
import { AdminRowActions } from "@/components/admin/common/AdminRowActions";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  MapPin,
  MessageCircle,
  RotateCcw,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { BookingItemUI } from "shared";

interface BookingHistoryCardProps {
  item: BookingItemUI;
  striped?: boolean;
  grouped?: boolean;
  rawBooking?: any;
  onReview?: (item: BookingItemUI) => void;
  onCancelRequest?: (rawBooking: any) => void;
}

export function BookingHistoryCard({
  item,
  striped = false,
  grouped = false,
  rawBooking,
  onReview,
  onCancelRequest,
}: BookingHistoryCardProps) {
  const imageSrc = normalizeImageSrc(item.image) || PLACEHOLDER_IMAGE;

  const isCancelRequested =
    rawBooking?.status === "cancel_requested" ||
    (item.status === "unknown" && item.statusText === "Đang yêu cầu hủy");
  const isCancellable =
    item.status !== "cancelled" && item.status !== "completed";
  const bookingDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
    : null;

  return (
    <article className={`group relative flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 ${grouped ? "rounded-none border-0 border-b border-slate-200 last:border-b-0 shadow-none hover:shadow-none" : "rounded-xl border border-slate-100/90 shadow-[0_1px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(15,23,42,0.05)]"} ${striped ? "bg-[#f7faff]" : "bg-white"} p-1 sm:p-1.5 transition-all duration-300 hover:border-slate-200/80`}>
      {/* Left Column: Image Thumbnail */}
      <Link
        href={`/booking/${item.id}`}
        className="relative aspect-[16/10] w-full md:w-[260px] lg:w-[280px] shrink-0 overflow-hidden rounded-xl bg-slate-100 block group/thumb"
      >
        <Image
          src={imageSrc}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover/thumb:scale-105"
          sizes="(max-width: 768px) 100vw, 280px"
        />

      </Link>

      {/* Middle Column: Tour Information */}
      <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
        {/* Title */}
        <h3 className="text-base sm:text-[17px] font-bold text-slate-900 leading-snug line-clamp-1">
          <Link
            href={`/booking/${item.id}`}
            className="hover:text-[#1766c2] transition-colors"
            title={item.name}
          >
            {item.name}
          </Link>
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs font-medium text-slate-700">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <span className="truncate">{item.location || "Chưa cập nhật điểm khởi hành"}</span>
        </div>

        {/* Departure dates & Duration */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Calendar className="h-3.5 w-3.5 shrink-0 text-blue-600" />
            <span className="text-blue-700">Khởi hành: {item.startDate} – {item.endDate}</span>
          </div>
          {item.duration && (
            <>
              <span className="text-slate-300">•</span>
              <span className="whitespace-nowrap font-semibold text-slate-800">
                {item.duration}
              </span>
            </>
          )}
        </div>

        {/* Guests / Passengers */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-700">
          <Users className="h-3.5 w-3.5 shrink-0 text-slate-500" />
          <span>{item.passengers}</span>
          {bookingDate && <><span className="mx-0.5 text-slate-400">•</span><span className="text-blue-700">Ngày đặt {bookingDate}</span></>}
        </div>

        {/* Price display */}
        <div className="pt-1">
          <span className="text-[11px] text-slate-600 font-medium block">
            Tổng tiền thanh toán
          </span>
          <span className="text-base sm:text-lg font-black text-red-600 tracking-tight">
            {formatVND(item.price)}
          </span>
        </div>
      </div>

      {/* Right Column: Status Badge & Action Buttons */}
      <div className="flex flex-col md:items-end justify-between self-stretch gap-2 shrink-0 pt-3 md:pt-0 md:pr-1.5 border-t md:border-t-0 border-slate-100">
        <div className="flex justify-end md:mr-2 md:mt-2">
          <AdminRowActions
            label={`Thao tác với đơn đặt tour #${item.id}`}
            buttonText="Thao tác"
            actions={[
              { label: "Xem chi tiết", icon: <Eye size={16} />, href: `/booking/${item.id}`, access: "view" },
              ...(item.status === "completed" || item.status === "cancelled" ? [{ label: "Đặt lại tour", icon: <RotateCcw size={16} />, href: `/tours/${item.tourId}`, access: "view" as const }] : []),
              { label: "Liên hệ hỗ trợ", icon: <MessageCircle size={16} />, onClick: () => openSupportChat({ booking_id: item.id }), access: "view" },
              ...(item.paymentStatus === "unpaid" && item.status !== "cancelled" ? [{ label: "Thanh toán ngay", icon: <CreditCard size={16} />, href: `/booking/${item.id}`, access: "view" as const }] : []),
              ...(item.status === "completed" && onReview ? [{ label: item.review ? `Xem đánh giá (${item.review.rating}★)` : "Đánh giá", icon: <Star size={16} />, onClick: () => onReview(item), access: "view" as const }] : []),
              ...(isCancellable && onCancelRequest ? [isCancelRequested
                ? { label: "Đang chờ duyệt hủy", icon: <Clock size={16} />, disabled: true, title: "Yêu cầu hủy của bạn đang được ban quản lý xem xét", access: "view" as const }
                : { label: "Yêu cầu hủy tour", icon: <XCircle size={16} />, onClick: () => onCancelRequest(rawBooking || item), danger: true, access: "view" as const }] : []),
            ]}
          />
        </div>

        {/* Status Badge */}
        <div className="flex flex-wrap items-center justify-end gap-2 md:mr-2 md:mb-2">
          {item.status === "completed" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3.5 py-1 text-xs font-bold shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Đã hoàn thành</span>
            </span>
          )}

          {item.status === "ongoing" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 px-3.5 py-1 text-xs font-bold shadow-2xs">
              <Clock className="h-3.5 w-3.5 text-blue-600" />
              <span>Đang diễn ra</span>
            </span>
          )}

          {item.status === "cancelled" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 px-3.5 py-1 text-xs font-bold shadow-2xs">
              <XCircle className="h-3.5 w-3.5 text-rose-500" />
              <span>Đã hủy</span>
            </span>
          )}

          {item.status === "upcoming" && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold shadow-2xs ${
                item.paymentStatus === "unpaid"
                  ? "bg-amber-50 text-amber-800 border border-amber-200/60"
                  : "bg-sky-50 text-sky-700 border border-sky-200/60"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{item.statusText}</span>
            </span>
          )}

          {item.status === "unknown" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 px-3.5 py-1 text-xs font-bold shadow-2xs">
              <Clock className="h-3.5 w-3.5" />
              <span>{item.statusText}</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

