import type { TourAmenity } from 'shared';

/** Return only amenities entered for the tour, excluding kinds explicitly hidden by admin. */
export function getTourAmenities(saved: TourAmenity[]): TourAmenity[] {
  const hidden = new Set(saved.filter(item => 'is_visible' in item && item.is_visible === false).map(item => item.kind));
  return saved
    .filter(item => !hidden.has(item.kind))
    .map(item => ({ ...item }))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}
