"use client";

import { BookingCancelModal } from "@/components/booking/cancel_request/UserBookingCancelModal";
import { getBookingPaymentStatus, getBookingTripStatus } from "@/lib/booking/client/status";
import { formatDate } from "@/lib/utils/dateTime";
import {
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AccountBookingsTabProps, BookingItemUI, BookingStatusFilter } from "shared";
import { AccountPageBanner } from "@/components/banners/account_banner/UserAccountPageBanner";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { BookingHistoryCard } from "@/components/tour_cards/booking_history/UserBookingHistoryCard";
import { TourReviewModal } from "@/components/reviews/customer_reviews/UserTourReviewModal";

export function AccountBookingsTab({ bookings = [] }: AccountBookingsTabProps) {
  const [activeFilter, setActiveFilter] = useState<BookingStatusFilter>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "departure">("newest");

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

        const { status, statusText, statusReason, isCancelUnapproved } = getBookingTripStatus(b, now);
        const { paymentStatus, paymentStatusText } = getBookingPaymentStatus(b);

        const price = b.total_amount ? Number(b.total_amount) : 2890000;
        const image =
          b.tour_schedules?.cover_image_url ||
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
          tourType: tour?.tour_type,
          startDate,
          endDate,
          passengers,
          status,
          statusText,
          statusReason,
          isCancelUnapproved,
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
    <div className="w-full min-w-0 space-y-6">
      <AccountPageBanner
        title="Lịch sử đặt tour"
        description="Cùng nhìn lại những hành trình tuyệt vời mà bạn đã trải nghiệm cùng JourniTrip!"
        icon={CalendarDays}
        filterAriaLabel="Lọc lịch sử đặt tour"
        activeFilter={activeFilter}
        onFilterChange={(value) => setActiveFilter(value as BookingStatusFilter)}
        filters={[
          { value: "all", label: `Tất cả (${formattedBookings.length})` },
          { value: "completed", label: `Đã hoàn thành (${completedCount})` },
          { value: "ongoing", label: `Đang diễn ra (${ongoingCount})` },
          ...(upcomingCount > 0 ? [{ value: "upcoming", label: `Sắp diễn ra (${upcomingCount})` }] : []),
          { value: "cancelled", label: `Đã hủy (${cancelledCount})` },
        ]}
        controls={
            <CustomDropdown
              ariaLabel="Sắp xếp lịch sử đặt tour"
              variant="compact"
              matchTriggerWidth
              icon={CalendarDays}
              selectedValue={sortBy}
              options={[
                { value: "newest", label: "Thời gian đặt" },
                { value: "oldest", label: "Đặt cũ nhất" },
                { value: "departure", label: "Khởi hành gần nhất" },
              ]}
              onSelect={(value) => setSortBy(value as typeof sortBy)}
              className="w-[188px] [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:rounded-full [&_button[aria-haspopup=listbox]]:border-slate-200/90 [&_button[aria-haspopup=listbox]]:bg-white/95 [&_button[aria-haspopup=listbox]]:px-4 [&_button[aria-haspopup=listbox]]:py-2 [&_button[aria-haspopup=listbox]]:text-xs [&_button[aria-haspopup=listbox]]:shadow-none"
            />
        }
      />

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
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredList.map((item) => {
            const rawBooking = bookings.find((b) => b.booking_id === item.id);
            return (
              <BookingHistoryCard
                key={item.id}
                item={item}
                rawBooking={rawBooking}
                onReview={(b: BookingItemUI) => setReviewModalBooking(b)}
                onCancelRequest={(b: any) => setCancelModalBooking(b)}
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

