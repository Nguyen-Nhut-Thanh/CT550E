"use client";

import TourAmenities from "@/components/tours/detail/TourAmenities";
import TourBookingCard from "@/components/tours/booking/TourBookingCard";
import TourDepartureCalendar from "@/components/tours/booking/TourDepartureCalendar";
import TourDetailHero from "@/components/tours/detail/TourDetailHero";
import TourHighlightsList from "@/components/tours/detail/TourHighlightsList";
import TourItineraryTimeline from "@/components/tours/detail/TourItineraryTimeline";
import { TourPoliciesSection } from "@/components/tours/detail/TourPoliciesSection";
import TourSmartMap from "@/components/tours/detail/TourSmartMap";
import TourRecommendedList from "@/components/tours/recommendations/TourRecommendedList";
import TourReviewsSection from "@/components/tours/reviews/TourReviewsSection";
import TourVideoHighlights from "@/components/tours/detail/TourVideoHighlights";
import { getPublicTourDetail } from "@/lib/tours/api";
import { resolvePickupPoint } from '@/lib/booking/departure';
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import type { PublicTourDetail } from "shared";

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
  const [selectedPickupPointId, setSelectedPickupPointId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTour() {
      try {
        setLoading(true);
        const data = await getPublicTourDetail(tourId);
        if (!active) return;
        setTour(data);
        const query = new URLSearchParams(window.location.search);
        const requestedSchedule = Number(query.get("scheduleId"));
        const schedule = data.tour_schedules?.find(item => item.tour_schedule_id === requestedSchedule);
        setSelectedScheduleId(schedule?.tour_schedule_id ?? null);
        setSelectedPickupPointId(resolvePickupPoint(schedule, query.get('pickupPointId'))?.pickup_point_id ?? null);
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
  const displaySchedule = selectedSchedule || tour?.tour_schedules?.[0];

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
    <div className="min-h-screen bg-[#f8fafc] pb-4 pt-6">
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
              selectedPickupPointId={selectedPickupPointId}
              onSelect={(schedId, pickupId) => {
                const schedule = tour.tour_schedules?.find(item => item.tour_schedule_id === schedId);
                setSelectedScheduleId(schedId);
                setSelectedPickupPointId(resolvePickupPoint(schedule, pickupId)?.pickup_point_id ?? null);
              }}
              onReset={() => { setSelectedScheduleId(null); setSelectedPickupPointId(null); }}
            />

            {/* 4. Tiện ích nổi bật (Amenities) */}
            <TourAmenities key={`amenities-${tourId}-${displaySchedule?.tour_schedule_id ?? 'none'}`} amenities={tour.tour_amenities || []} schedule={displaySchedule} />

            {/* 5. Điểm nổi bật của chương trình (Tour Highlights) */}
            <TourHighlightsList />
            <TourSmartMap tour={tour} attractions={displaySchedule?.tour_schedule_attractions} />

            {/* 6. Lịch trình chi tiết (Itinerary Timeline) */}
            <TourItineraryTimeline key={`itinerary-${tourId}-${displaySchedule?.tour_schedule_id ?? 'none'}`} itineraries={displaySchedule?.tour_itineraries} />
            <TourPoliciesSection policies={tour.tour_policies} />

            {/* 7. Đánh giá của khách hàng (Reviews Widget) */}
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
              selectedPickupPointId={selectedPickupPointId}
            />
          </div>
        </div>

      </div>

      {/* Closing section spans the viewport outside the main content container. */}
      <div className="mt-10 w-full">
        <TourRecommendedList />
      </div>
    </div>
  );
}
