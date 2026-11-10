"use client";

import { getBookingPaymentStatus, getBookingTripStatus } from "@/lib/account/booking-status";
import { openSupportChat } from "@/lib/chat/support";
import { formatVND } from "@/lib/utils/currency";
import { CalendarDays, CheckCircle2, Clock, CreditCard, Eye, MessageCircle, Star, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AccountBookingsTabProps, BookingItemUI, BookingStatusFilter } from "shared";
import { AdminRowActions } from "@/components/admin/common/AdminRowActions";
import { TourReviewModal } from "./TourReviewModal";

export function AccountBookingsTab({ bookings = [] }: AccountBookingsTabProps) {
  const [activeFilter, setActiveFilter] = useState<BookingStatusFilter>("all");
  const [localReviews, setLocalReviews] = useState<Record<number, any>>({});
  const [reviewModalBooking, setReviewModalBooking] = useState<BookingItemUI | null>(null);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const formattedBookings: BookingItemUI[] = useMemo(() => {
    if (bookings && bookings.length > 0) {
      return bookings.map((b) => {
        const id = b.booking_id;
        const tourId = (b.tour_schedules?.tours as any)?.tour_id || 0;
        const name = b.tour_schedules?.tours?.name || `Đơn đặt tour #${b.booking_id}`;
        const startDate = b.tour_schedules?.start_date
          ? new Date(b.tour_schedules.start_date).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
          : "Chưa xác định";
        const endDate = b.tour_schedules?.end_date
          ? new Date(b.tour_schedules.end_date).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
          : "Chưa xác định";

        const passParts: string[] = [];
        if (b.adult_count) passParts.push(`${b.adult_count} người lớn`);
        if (b.child_count) passParts.push(`${b.child_count} trẻ em`);
        if (b.infant_count) passParts.push(`${b.infant_count} em bé`);
        const passengers = passParts.join(", ") || "1 người lớn";

        const tour = b.tour_schedules?.tours as any;
        const rawSummary = tour?.summary || tour?.description || "";
        const summary = rawSummary ? rawSummary.replace(/<[^>]*>/g, "").trim() : "";

        const { status, statusText } = getBookingTripStatus(b, now);
        const { paymentStatus, paymentStatusText } = getBookingPaymentStatus(b);

        const price = b.total_amount ? Number(b.total_amount) : 2890000;
        const image =
          b.tour_schedules?.tours?.tour_images?.[0]?.image_url ||
          "/images/shared/travel-cover.png";

        const review = localReviews[id] || (b.reviews?.[0] ? (b.reviews[0] as any) : null);

        return {
          id,
          tourId,
          name,
          summary,
          startDate,
          endDate,
          passengers,
          status,
          statusText,
          paymentStatus,
          paymentStatusText,
          price,
          image,
          review,
        };
      });
    }

    return [];
  }, [bookings, now, localReviews]);

  const upcomingCount = useMemo(
    () => formattedBookings.filter((b) => b.status === "upcoming").length,
    [formattedBookings]
  );
  const completedCount = useMemo(
    () => formattedBookings.filter((b) => b.status === "completed").length,
    [formattedBookings]
  );
  const cancelledCount = useMemo(
    () => formattedBookings.filter((b) => b.status === "cancelled").length,
    [formattedBookings]
  );

  const filteredList = useMemo(() => {
    if (activeFilter === "all") return formattedBookings;
    return formattedBookings.filter((b) => b.status === activeFilter);
  }, [formattedBookings, activeFilter]);

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Lịch sử đặt tour</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Danh sách các tour bạn đã đặt và tình trạng hiện tại
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {([
          { id: "all", label: "Tất cả", count: formattedBookings.length },
          { id: "upcoming", label: "Sắp diễn ra", count: upcomingCount },
          { id: "ongoing", label: "Đang diễn ra", count: formattedBookings.filter(item => item.status === "ongoing").length },
          { id: "completed", label: "Đã hoàn thành", count: completedCount },
          { id: "cancelled", label: "Đã hủy", count: cancelledCount },
          { id: "unknown", label: "Khác", count: formattedBookings.filter(item => item.status === "unknown").length },
        ] as const).filter(filter => filter.id !== "unknown" || filter.count > 0).map(filter => (
          <button key={filter.id} type="button" onClick={() => setActiveFilter(filter.id)} aria-pressed={activeFilter === filter.id}
            className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${activeFilter === filter.id ? "bg-[#1766c2] text-white shadow-sm" : "bg-slate-100/90 text-slate-600 hover:bg-slate-200"}`}>
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>

      {/* Booking Cards List */}
      {filteredList.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">Chưa có đơn đặt tour nào trong mục này</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              {/* Left Side: Thumbnail & Infos */}
              <div className="flex items-start sm:items-stretch gap-4 min-w-0 flex-1">
                <Link
                  href={`/booking/${item.id}`}
                  className="relative aspect-[16/10] w-36 sm:w-40 shrink-0 overflow-hidden rounded-xl bg-slate-100 block group self-start sm:self-auto"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 144px, 160px"
                  />
                </Link>

                <div className="flex flex-col justify-between min-w-0 flex-1 py-0.5 space-y-1 sm:space-y-0">
                  {/* Hàng 1: Tên tour */}
                  <h3 className="text-base font-extrabold text-slate-900 truncate leading-snug">
                    <Link
                      href={`/booking/${item.id}`}
                      className="hover:text-[#095fff] transition-colors"
                      title={item.name}
                    >
                      {item.name}
                    </Link>
                  </h3>

                  {/* Hàng 2: Mô tả ngắn của tour */}
                  <p className="text-xs text-slate-500 truncate" title={item.summary}>
                    {item.summary || "Khám phá lịch trình du lịch hấp dẫn và trải nghiệm tuyệt vời."}
                  </p>

                  {/* Hàng 3: Lịch khởi hành */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{item.startDate} - {item.endDate}</span>
                  </div>

                  {/* Hàng 4: Số lượng khách */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{item.passengers}</span>
                  </div>
                </div>
              </div>

              {/* Right Side: Status, Price & Action Buttons */}
              <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {/* Status & Price */}
                <div className="text-left sm:text-right space-y-1.5">
                  <div className="flex flex-wrap items-center gap-1.5 justify-start sm:justify-end">
                    {/* Tag trạng thái thanh toán */}
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        item.paymentStatus === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : item.paymentStatus === "refunded"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {item.paymentStatus === "paid" ? (
                        <CheckCircle2 size={12} className="shrink-0" />
                      ) : (
                        <Clock size={12} className="shrink-0" />
                      )}
                      <span>{item.paymentStatusText}</span>
                    </span>

                    {/* Tag trạng thái chuyến đi */}
                    {(item.status === "ongoing" || item.status === "unknown") && (
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${item.status === "ongoing" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                        {item.statusText}
                      </span>
                    )}
                    {item.status === "completed" && (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          {item.statusText}
                        </span>
                        {item.review && (
                          <span
                            onClick={() => setReviewModalBooking(item)}
                            title="Bấm để xem lại bài đánh giá"
                            className="inline-flex items-center gap-1 cursor-pointer rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-700 hover:bg-amber-100 transition shadow-2xs"
                          >
                            <Star size={11} className="fill-amber-400 text-amber-500" />
                            <span>{item.review.rating}★</span>
                          </span>
                        )}
                      </div>
                    )}
                    {item.status === "upcoming" && (
                      <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-700">
                        {item.statusText}
                      </span>
                    )}
                    {item.status === "cancelled" && (
                      <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                        {item.statusText}
                      </span>
                    )}
                  </div>

                  <div className="text-base font-extrabold text-slate-900 sm:text-lg">
                    {formatVND(item.price)}
                  </div>
                </div>

                {/* Component Thao tác chuẩn như bên Quản lý tour */}
                <div className="flex items-center">
                  <AdminRowActions
                    label={`Thao tác với đơn đặt tour #${item.id}`}
                    actions={[
                      ...(item.paymentStatus === "unpaid" && item.status !== "cancelled"
                        ? [
                            {
                              label: "Thanh toán ngay",
                              icon: <CreditCard size={16} className="text-emerald-600" />,
                              href: `/booking/${item.id}`,
                              access: "view" as const,
                            },
                          ]
                        : []),
                      {
                        label: "Xem chi tiết",
                        icon: <Eye size={16} />,
                        href: `/booking/${item.id}`,
                        access: "view",
                      },
                      {
                        label: "Liên hệ nhân viên",
                        icon: <MessageCircle size={16} />,
                        onClick: () => openSupportChat({ booking_id: item.id }),
                        access: "view",
                      },
                      {
                        label: item.review ? `Xem đánh giá (${item.review.rating}★)` : "Đánh giá",
                        icon: <Star size={16} />,
                        disabled: item.status !== "completed",
                        title:
                          item.status !== "completed"
                            ? "Chỉ có thể đánh giá sau khi hoàn thành chuyến đi"
                            : undefined,
                        onClick: () => setReviewModalBooking(item),
                        access: "view",
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Popup Modal Đánh Giá Tour */}
      <TourReviewModal
        open={Boolean(reviewModalBooking)}
        booking={reviewModalBooking}
        onClose={() => setReviewModalBooking(null)}
        onSuccess={(bookingId, newReview) => {
          setLocalReviews((prev) => ({ ...prev, [bookingId]: newReview }));
        }}
      />
    </div>
  );
}
