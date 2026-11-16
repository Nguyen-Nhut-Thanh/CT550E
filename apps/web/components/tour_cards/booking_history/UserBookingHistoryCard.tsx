"use client";

import { openSupportChat } from "@/lib/chat/support";
import { formatVND } from "@/lib/utils/currency";
import { normalizeImageSrc, PLACEHOLDER_IMAGE } from "@/lib/utils/images";
import { AdminRowActions } from "@/components/common/admin_shared/tables/AdminRowActions";
import { CalendarDays, CheckCircle2, Clock, CreditCard, Eye, Globe2, MapPin, MessageCircle, Plane, RotateCcw, Star, Users, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useId } from "react";
import type { BookingItemUI } from "shared";

interface BookingHistoryCardProps {
  item: BookingItemUI;
  rawBooking?: any;
  onReview?: (item: BookingItemUI) => void;
  onCancelRequest?: (rawBooking: any) => void;
}

export function BookingHistoryCard({ item, rawBooking, onReview, onCancelRequest }: BookingHistoryCardProps) {
  const imageSrc = normalizeImageSrc(item.image) || PLACEHOLDER_IMAGE;
  const waveId = `booking-history-wave-${useId().replace(/:/g, "")}`;
  const isCancelRequested = rawBooking?.status === "cancel_requested" || (item.status === "unknown" && item.statusText === "Đang yêu cầu hủy");
  const isCancellable = item.status !== "cancelled" && item.status !== "completed";
  const bookingDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
    : null;
  const isInternational = item.tourType === "outbound" || item.tourType === "international";
  const statusLabel = item.paymentStatus === "unpaid" && item.status === "upcoming" ? "Chờ thanh toán" : item.statusText;
  const statusClass = item.status === "cancelled"
    ? "border-rose-200 bg-rose-50 text-rose-700"
    : item.status === "completed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : item.status === "ongoing"
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : item.paymentStatus === "unpaid"
          ? "border-amber-200 bg-amber-50 text-amber-800"
          : "border-sky-200 bg-sky-50 text-sky-700";
  const StatusIcon = item.status === "cancelled" ? XCircle : item.status === "completed" ? CheckCircle2 : Clock;

  return (
    <article className="group relative flex w-full min-w-0 flex-col gap-3 overflow-visible rounded-[24px] border border-blue-100/80 bg-white p-3 shadow-[0_12px_32px_rgba(30,64,175,0.07)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_rgba(30,64,175,0.12)] sm:p-3.5 md:flex-row md:gap-3.5">
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
        <defs>
          <clipPath id={`${waveId}-main`} clipPathUnits="objectBoundingBox">
            <path d="M .065 0 L .90 0 Q .97 0 .98 .07 C 1 .32 .99 .72 .95 .89 C .93 .96 .82 .98 .65 .97 C .42 .95 .20 .98 .065 .99 Q 0 .99 0 .92 L 0 .07 Q 0 0 .065 0 Z" />
          </clipPath>
          <clipPath id={`${waveId}-back`} clipPathUnits="objectBoundingBox">
            <path d="M .065 0 L .91 0 Q .98 0 .99 .07 C 1.01 .36 1 .76 .96 .94 C .94 .99 .84 1 .64 .99 L .065 1 Q 0 1 0 .93 L 0 .07 Q 0 0 .065 0 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="relative h-[190px] w-full shrink-0 sm:h-[210px] md:h-[230px] md:w-[36%]">
        <div
          className="absolute inset-0 bg-gradient-to-br from-sky-100 via-blue-100/85 to-sky-200/75"
          style={{ clipPath: `url(#${waveId}-back)`, WebkitClipPath: `url(#${waveId}-back)` }}
        />
        <Link
          href={`/booking/${item.id}`}
          className="absolute inset-0 block overflow-hidden bg-sky-100"
          style={{ clipPath: `url(#${waveId}-main)`, WebkitClipPath: `url(#${waveId}-main)` }}
        >
          <Image
            src={imageSrc}
            alt={item.name}
            fill
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 325px"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
        </Link>
        <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1 rounded-full border border-white/15 bg-slate-900/45 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm backdrop-blur-md">
          {isInternational ? <Globe2 className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
          {isInternational ? "Nước ngoài" : "Trong nước"}
        </span>
      </div>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col justify-between py-1 md:py-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-extrabold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-[#1266f1] md:text-lg">
              <Link href={`/booking/${item.id}`} title={item.name}>{item.name}</Link>
            </h3>
            <div className="mt-1.5 flex flex-col gap-2 text-xs font-medium text-slate-500">
              <span className="flex min-w-0 items-center gap-1.5">
                <MapPin className="h-4 w-4 shrink-0 text-slate-900" />
                <span className="truncate">{item.location || "Chưa cập nhật điểm khởi hành"}</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <CalendarDays className="h-4 w-4 shrink-0 text-slate-900" />
                <span>Đặt ngày:</span>
                <span className="text-blue-700">{bookingDate || "Chưa cập nhật"}</span>
              </span>
            </div>
          </div>
          <div className="relative z-20 shrink-0">
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
        </div>

        <div className="mb-2 mt-2 flex flex-col gap-2 text-slate-700">
          <div className="flex min-w-0 items-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-900" />
            <span className="shrink-0 text-[11px] font-medium text-slate-500">Khởi hành:</span>
            <span className="truncate text-xs font-bold text-blue-700">{item.startDate} – {item.endDate}</span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-slate-900" />
            <span className="shrink-0 text-[11px] font-medium text-slate-500">Thời gian:</span>
            <span className="truncate text-xs font-bold text-slate-800">{item.duration || "Đang cập nhật"}</span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <Users className="h-4 w-4 shrink-0 text-slate-900" />
            <span className="shrink-0 text-[11px] font-medium text-slate-500">Hành khách:</span>
            <span className="truncate text-xs font-bold text-slate-800">{item.passengers}</span>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 pt-1 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-blue-100/70 bg-[#f3f7fd] px-3.5 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm"><CreditCard className="h-4 w-4" /></span>
            <span className="min-w-0">
              <span className="block text-[10px] font-medium leading-tight text-slate-500">Tổng tiền thanh toán</span>
              <span className="block truncate text-base font-extrabold leading-tight tracking-tight text-[#1266f1]">{formatVND(item.price)}</span>
            </span>
          </div>
          <div className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-bold sm:self-auto ${statusClass}`}>
            <StatusIcon className="h-3 w-3" />
            <span>{statusLabel}</span>
            {item.status === "ongoing" && <Plane className="h-3 w-3 -rotate-12" />}
          </div>
        </div>
      </div>
    </article>
  );
}
