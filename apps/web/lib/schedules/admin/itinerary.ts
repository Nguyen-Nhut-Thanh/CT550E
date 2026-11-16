import type { ItineraryActivity, ItineraryFormItem, LocationOption, TourInfo } from "shared";

export function getIncompleteItineraryDays(itinerary: ItineraryFormItem[], durationDays: number) {
  const days = Math.max(1, durationDays || 0, ...itinerary.map(day => day.day_number));
  return Array.from({ length: days }, (_, index) => index + 1).filter(number => {
    const day = itinerary.find(item => item.day_number === number);
    if (!day || !day.title.trim() || !day.meals.trim()) return true;
    if (Boolean(day.hotel_id) !== Boolean(day.room_type_id)) return true;
    return day.activities?.length
      ? day.activities.some(activity => !/^([01]\d|2[0-3]):[0-5]\d$/.test(activity.time) || !activity.title.trim())
      : !day.content.trim();
  });
}

export function getItineraryProvinces(locations: LocationOption[], destinations: NonNullable<TourInfo["tour_destinations"]>) {
  const seen = new Set<number>();
  return [...destinations].sort((a, b) => a.visit_order - b.visit_order).flatMap(destination => {
    const location = locations.find(item => item.location_id === destination.location_id);
    if (seen.has(destination.location_id) || (location && location.level_id !== 5)) return [];
    seen.add(destination.location_id);
    return [{ location_id: destination.location_id, name: location?.name || destination.locations?.name || "Tỉnh/thành chưa có tên" }];
  });
}

export function getProvinceAttractions(locations: LocationOption[], provinceId: number | undefined) {
  if (provinceId === undefined) return [];
  return locations.filter(item => item.level_id === 6 && item.parent_id === provinceId).sort((a, b) => a.name.localeCompare(b.name, "vi"));
}

export function toggleScheduleAttraction(ids: number[], locationId: number, selected: boolean) {
  return selected ? [...new Set([...ids, locationId])] : ids.filter(id => id !== locationId);
}

export function updateItineraryActivity(activities: ItineraryActivity[], index: number, changes: Partial<ItineraryActivity>) {
  return activities.map((activity, current) => current === index ? { ...activity, ...changes } : activity);
}
