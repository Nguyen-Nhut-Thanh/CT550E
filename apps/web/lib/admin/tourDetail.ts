import { TOUR_POLICY_DEFINITIONS } from "@/lib/tourPolicyDefinitions";
import type { TourDetailForm, TourPolicyContentMap } from "shared";

export function normalizeTourDetailForm(tourData: TourDetailForm | null | undefined) {
  if (!tourData) return null;

  return {
    ...tourData,
    policy_contents: TOUR_POLICY_DEFINITIONS.reduce<TourPolicyContentMap>((acc, definition) => {
      const matched = tourData.tour_policies?.find(
        (policy) => policy.policy_type === definition.key,
      );
      if (matched?.content) {
        acc[definition.key] = matched.content;
      }
      return acc;
    }, {}),
    destinations:
      tourData.tour_destinations?.map((destination) => destination.location_id) || [],
    images: tourData.tour_images?.map((image) => image.image_url) || [],
  };
}

export function getTotalTourBookings(tourData: TourDetailForm | null | undefined) {
  return (
    tourData?.tour_schedules?.reduce(
      (total, schedule) => total + (schedule._count?.bookings || 0),
      0,
    ) || 0
  );
}
