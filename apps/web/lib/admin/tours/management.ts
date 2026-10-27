import type { ToursPageTour } from "shared";
import { matchesTourSearch, matchesTourStatusFilter, matchesTourTypeFilter } from "./filters";

export const DEFAULT_TOUR_FILTERS = { search: "", type: "all", country: "all", status: "all", duration: "all", sort: "default" };
export type TourManagementFilters = typeof DEFAULT_TOUR_FILTERS;

export function filterManagedTours(items: ToursPageTour[], filters: TourManagementFilters) {
  const result = items.filter(tour => matchesTourSearch(tour, filters.search)
    && matchesTourTypeFilter(tour, filters.type) && matchesTourStatusFilter(tour, filters.status)
    && (filters.country === "all" || tour.countries?.some(country => String(country.location_id) === filters.country))
    && (filters.duration === "all" || (filters.duration === "short" ? tour.duration_days <= 2 : filters.duration === "medium" ? tour.duration_days >= 3 && tour.duration_days <= 5 : tour.duration_days > 5)));
  if (filters.sort === "priceAsc") result.sort((a, b) => Number(a.base_price) - Number(b.base_price));
  if (filters.sort === "priceDesc") result.sort((a, b) => Number(b.base_price) - Number(a.base_price));
  if (filters.sort === "name") result.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  return result;
}

export function getTourStatistics(items: ToursPageTour[]) {
  return { total: items.length, active: items.filter(tour => tour.status === 1).length, hidden: items.filter(tour => tour.status === 0).length, bookings: items.reduce((sum, tour) => sum + (tour.booked_count ?? 0), 0) };
}

export function getTourPageNumbers(current: number, total: number) {
  return Array.from({ length: total }, (_, index) => index + 1).filter(page => page === 1 || page === total || Math.abs(page - current) <= 1);
}
