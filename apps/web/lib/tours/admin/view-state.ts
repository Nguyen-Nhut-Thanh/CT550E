import { DEFAULT_TOUR_FILTERS, type TourManagementFilters } from "./management";

export const TOUR_LIST_STATE_KEY = "admin:tours:list-view";

export interface TourListViewState {
  page: number;
  filters: TourManagementFilters;
}

export function restoreTourListView(value: string | null): TourListViewState {
  const fallback = { page: 1, filters: { ...DEFAULT_TOUR_FILTERS } };
  if (!value) return fallback;
  try {
    const saved = JSON.parse(value);
    if (!saved || typeof saved !== "object") return fallback;
    const filters = { ...DEFAULT_TOUR_FILTERS };
    for (const key of Object.keys(filters) as Array<keyof TourManagementFilters>) {
      if (typeof saved.filters?.[key] === "string") filters[key] = saved.filters[key];
    }
    return {
      page: Number.isSafeInteger(saved.page) && saved.page > 0 ? saved.page : 1,
      filters,
    };
  } catch {
    return fallback;
  }
}
