"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { getPublicTourDetail } from "@/lib/client/api/tourApi";
import type { PublicTourDetail } from "shared";
import {
  TourDetailHero,
  TourBookingCard,
  TourVideoHighlights,
  TourDepartureCalendar,
  TourAmenities,
  TourHighlightsList,
  TourItineraryTimeline,
  TourSmartMap,
  TourRecommendedList,
  TourReviewsSection,
} from "@/components/tours/detail";

export default function TourDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const rawId = resolvedParams.id;
  const tourId = rawId.split("-")[0];

  const [tour, setTour] = useState<PublicTourDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTour() {
      try {
        setLoading(true);
        const data = await getPublicTourDetail(tourId);
        if (!active) return;
        setTour(data);
        setSelectedScheduleId(null);
      } catch {
        if (!active) return;
        setTour(null);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadTour();

    return () => {
      active = false;
    };
  }, [tourId]);

  const selectedSchedule =
    selectedScheduleId != null && tour?.tour_schedules
      ? tour.tour_schedules.find((s) => s.tour_schedule_id === selectedScheduleId) ?? null
      : null;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 p-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-bold text-slate-800">Không tìm thấy thông tin tour.</p>
          <Link href="/tours" className="mt-4 inline-block text-sm font-bold text-sky-600 hover:underline">
            ← Quay lại danh sách tour
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 pt-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Main 2-Column Grid Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Main Left Column (col-span-8) */}
          <div className="lg:col-span-8 space-y-8 min-w-0">
            {/* 1. Hero Gallery & Information */}
            <TourDetailHero tour={tour} />

            {/* 2. Trải nghiệm trước điểm đến (Video Highlights) */}
            <TourVideoHighlights />

            {/* 3. Lịch khởi hành (Tour Departure Calendar) */}
            <TourDepartureCalendar
              schedules={tour.tour_schedules || []}
              selectedScheduleId={selectedScheduleId}
              onSelect={(schedId) => setSelectedScheduleId(schedId)}
              onReset={() => setSelectedScheduleId(null)}
            />

            {/* 4. Tiện ích nổi bật (Amenities) */}
            <TourAmenities />

            {/* 5. Điểm nổi bật của chương trình (Tour Highlights) */}
            <TourHighlightsList />

            {/* 6. Lịch trình chi tiết (Itinerary Timeline) */}
            <TourItineraryTimeline itineraries={selectedSchedule?.tour_itineraries} />

            {/* 7. Bản đồ thông minh (Smart Map Widget) */}
            <TourSmartMap tour={tour} />

            {/* 8. Đánh giá của khách hàng (Reviews Widget) */}
            <TourReviewsSection
              averageRating={Number(tour.rating_avg) || 5}
              totalReviews={tour.rating_count ?? (tour.reviews ? tour.reviews.length : 0)}
              reviews={(tour.reviews || []).map((r: any) => ({
                id: r.review_id || r.id || Math.random(),
                name: r.users?.full_name || r.user_name || r.name || "Khách hàng",
                rating: Number(r.rating) || 5,
                content: r.comment || r.content || "",
                timeAgo: r.created_at ? new Date(r.created_at).toLocaleDateString("vi-VN") : undefined,
                avatarUrl: r.users?.avatar_url || r.avatar_url || undefined,
              }))}
            />
          </div>

          {/* Right Sticky Sidebar Column (col-span-4) */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <TourBookingCard
              tour={tour}
              selectedSchedule={selectedSchedule}
            />
          </div>
        </div>

        {/* Bottom Full-Width Section: Tour phù hợp với bạn */}
        <div className="pt-2">
          <TourRecommendedList />
        </div>
      </div>
    </div>
  );
}
