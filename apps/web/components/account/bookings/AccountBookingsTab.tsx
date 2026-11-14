"use client";

import { BookingCancelModal } from "@/components/booking/cancel/BookingCancelModal";
import { getBookingPaymentStatus, getBookingTripStatus } from "@/lib/account/booking-status";
import { useDismiss } from "@/lib/ui/useDismiss";
import { formatDate } from "@/lib/utils/dateTime";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Clock,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { AccountBookingsTabProps, BookingItemUI, BookingStatusFilter } from "shared";
import { BookingHistoryCard } from "./BookingHistoryCard";
import { TourReviewModal } from "./TourReviewModal";

export function AccountBookingsTab({ bookings = [] }: AccountBookingsTabProps) {
  const [activeFilter, setActiveFilter] = useState<BookingStatusFilter>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "departure">("newest");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement | null>(null);
  useDismiss(sortRef, isSortOpen, () => setIsSortOpen(false));

  const [localReviews, setLocalReviews] = useState<Record<number, any>>({});
  const [reviewModalBooking, setReviewModalBooking] = useState<BookingItemUI | null>(null);
  const [cancelModalBooking, setCancelModalBooking] = useState<any | null>(null);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const formattedBookings: BookingItemUI[] = useMemo(() => {
    if (bookings && bookings.length > 0) {
      return bookings.map((b) => {
        const id = b.booking_id;
        const tour = b.tour_schedules?.tours as any;
        const tourId = tour?.tour_id || 0;
        const name = tour?.name || `Đơn đặt tour #${b.booking_id}`;

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

        const rawSummary = tour?.summary || tour?.description || "";
        const summary = rawSummary ? rawSummary.replace(/<[^>]*>/g, "").trim() : "";

        const { status, statusText } = getBookingTripStatus(b, now);
        const { paymentStatus, paymentStatusText } = getBookingPaymentStatus(b);

        const price = b.total_amount ? Number(b.total_amount) : 2890000;
        const image =
          b.tour_schedules?.tours?.tour_images?.[0]?.image_url ||
          "/images/shared/travel-cover.png";

        const location = b.tour_schedules?.departure_location?.name || "Chưa cập nhật điểm khởi hành";

        const duration = tour?.duration_days
          ? `${tour.duration_days} ngày ${tour.duration_nights || tour.duration_days - 1} đêm`
          : "";

        const createdAt = b.created_at
          ? typeof b.created_at === "string"
            ? b.created_at
            : new Date(b.created_at).toISOString()
          : undefined;

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
          location,
          duration,
          createdAt,
        };
      });
    }

    return [];
  }, [bookings, now, localReviews]);

  const upcomingCount = useMemo(
    () => formattedBookings.filter((b) => b.status === "upcoming").length,
    [formattedBookings]
  );
  const ongoingCount = useMemo(
    () => formattedBookings.filter((b) => b.status === "ongoing").length,
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
    let result = [...formattedBookings];

    if (activeFilter !== "all") {
      result = result.filter((b) => b.status === activeFilter);
    }

    if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    } else if (sortBy === "departure") {
      result.sort((a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime());
    } else {
      // newest
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return result;
  }, [formattedBookings, activeFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* FULL SCENIC HERO BANNER (Không đóng khung, ảnh phong cảnh trải dài tràn viền) */}
      <div className="relative z-20 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8">
        {/* Full Landscape Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/about/travel-dreams-banner.png"
            alt="Scenic banner"
            fill
            priority
            className="object-cover object-[center_28%]"
          />
          {/* Soft bottom fade to blend with page background #f6f8fb */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent 85% to-[#f6f8fb]/40" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 mx-auto max-w-[1240px] px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4 lg:px-8 flex flex-col justify-between min-h-[165px] sm:min-h-[185px]">
          {/* Top Row: Title + Airplane */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-3.5">
              {/* Rounded Calendar Icon Badge */}
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-[#dbeafe]/90 text-[#1766c2] shadow-xs backdrop-blur-xs">
                <CalendarDays className="h-6 w-6 text-[#1766c2] stroke-[2.3]" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                  Lịch sử đặt tour
                </h1>
                <p className="mt-0.5 text-xs font-medium text-slate-700 sm:text-sm">
                  Cùng nhìn lại những hành trình tuyệt vời mà bạn đã trải nghiệm cùng JourniTrip!
                </p>
              </div>
            </div>

            {/* Right: Airplane SVG */}
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              <svg
                className="h-8 w-8 -rotate-12 text-slate-700/80 transition-transform duration-300 hover:translate-x-1 hover:-translate-y-1"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            </div>
          </div>

          {/* Bottom Row: Filter Pills & Sort Dropdown (Sitting directly over the water) */}
          <div className="mt-5 sm:mt-6 lg:mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Tất cả */}
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-xs ${
                  activeFilter === "all"
                    ? "bg-[#1766c2] text-white shadow-sm ring-2 ring-white/60"
                    : "bg-white/90 text-slate-700 backdrop-blur-md hover:bg-white hover:text-slate-900"
                }`}
              >
                {activeFilter === "all" && <Check className="h-3.5 w-3.5" />}
                <span>Tất cả ({formattedBookings.length})</span>
              </button>

              {/* Đã hoàn thành */}
              <button
                type="button"
                onClick={() => setActiveFilter("completed")}
                className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-xs ${
                  activeFilter === "completed"
                    ? "bg-[#1766c2] text-white shadow-sm ring-2 ring-white/60"
                    : "bg-white/90 text-slate-700 backdrop-blur-md hover:bg-white hover:text-slate-900"
                }`}
              >
                {activeFilter === "completed" && <Check className="h-3.5 w-3.5" />}
                <span>Đã hoàn thành ({completedCount})</span>
              </button>

              {/* Đang diễn ra */}
              <button
                type="button"
                onClick={() => setActiveFilter("ongoing")}
                className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-xs ${
                  activeFilter === "ongoing"
                    ? "bg-[#1766c2] text-white shadow-sm ring-2 ring-white/60"
                    : "bg-white/90 text-slate-700 backdrop-blur-md hover:bg-white hover:text-slate-900"
                }`}
              >
                {activeFilter === "ongoing" && <Check className="h-3.5 w-3.5" />}
                <span>Đang diễn ra ({ongoingCount})</span>
              </button>

              {/* Sắp diễn ra (hiển thị khi có chuyến sắp tới) */}
              {upcomingCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveFilter("upcoming")}
                  className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-xs ${
                    activeFilter === "upcoming"
                      ? "bg-[#1766c2] text-white shadow-sm ring-2 ring-white/60"
                      : "bg-white/90 text-slate-700 backdrop-blur-md hover:bg-white hover:text-slate-900"
                  }`}
                >
                  {activeFilter === "upcoming" && <Check className="h-3.5 w-3.5" />}
                  <span>Sắp diễn ra ({upcomingCount})</span>
                </button>
              )}

              {/* Đã hủy */}
              <button
                type="button"
                onClick={() => setActiveFilter("cancelled")}
                className={`flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold transition-all shadow-xs ${
                  activeFilter === "cancelled"
                    ? "bg-[#1766c2] text-white shadow-sm ring-2 ring-white/60"
                    : "bg-white/90 text-slate-700 backdrop-blur-md hover:bg-white hover:text-slate-900"
                }`}
              >
                {activeFilter === "cancelled" && <Check className="h-3.5 w-3.5" />}
                <span>Đã hủy ({cancelledCount})</span>
              </button>
            </div>

            {/* Right: Sort Dropdown (Thời gian đặt) */}
            <div ref={sortRef} className="relative">
              <button
                type="button"
                onClick={() => setIsSortOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-white/80 bg-white/95 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:text-slate-900"
              >
                <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                <span>
                  {sortBy === "newest"
                    ? "Thời gian đặt"
                    : sortBy === "oldest"
                    ? "Đặt cũ nhất"
                    : "Khởi hành gần nhất"}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                    isSortOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isSortOpen && (
                <div className="absolute right-0 top-full z-30 mt-1.5 w-48 overflow-hidden rounded-2xl border border-slate-100 bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("newest");
                      setIsSortOpen(false);
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                      sortBy === "newest"
                        ? "bg-blue-50 text-[#1766c2]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Mới đặt nhất
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("oldest");
                      setIsSortOpen(false);
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                      sortBy === "oldest"
                        ? "bg-blue-50 text-[#1766c2]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Đặt cũ nhất
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSortBy("departure");
                      setIsSortOpen(false);
                    }}
                    className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold transition ${
                      sortBy === "departure"
                        ? "bg-blue-50 text-[#1766c2]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Khởi hành gần nhất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Cards List */}
      {filteredList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/80 px-6 py-16 text-center shadow-xs">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#1766c2] shadow-xs">
            <CalendarDays className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {activeFilter === "all"
              ? "Chưa có đơn đặt tour nào"
              : activeFilter === "completed"
              ? "Chưa có chuyến đi nào hoàn thành"
              : activeFilter === "ongoing"
              ? "Hiện không có chuyến đi nào đang diễn ra"
              : activeFilter === "upcoming"
              ? "Chưa có chuyến đi nào sắp diễn ra"
              : "Không có đơn đặt tour nào đã hủy"}
          </h3>
          <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            Khám phá các tour du lịch tuyệt vời và sẵn sàng cho những chuyến đi đáng nhớ cùng JourniTrip!
          </p>
          <Link
            href="/tours"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1766c2] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
          >
            Khám phá tour ngay
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_2px_14px_rgba(15,23,42,0.05)]">
          {filteredList.map((item, index) => {
            const rawBooking = bookings.find((b) => b.booking_id === item.id);
            return (
              <BookingHistoryCard
                key={item.id}
                item={item}
                striped={index % 2 === 0}
                grouped
                rawBooking={rawBooking}
                onReview={(b) => setReviewModalBooking(b)}
                onCancelRequest={(b) => setCancelModalBooking(b)}
              />
            );
          })}
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

      {/* Popup Modal Hủy Tour / Yêu Cầu Hủy */}
      <BookingCancelModal
        open={Boolean(cancelModalBooking)}
        booking={cancelModalBooking}
        onClose={() => setCancelModalBooking(null)}
        onSuccess={() => {
          setCancelModalBooking(null);
          window.location.reload();
        }}
      />
    </div>
  );
}
