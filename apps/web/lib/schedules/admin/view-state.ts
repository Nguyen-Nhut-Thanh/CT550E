export const SCHEDULE_LIST_STATE_KEY = "admin:schedules:list-view";

export interface ScheduleListViewState {
  selectedTourId: number | null;
  tourPage: number;
  schedulePage: number;
  searchTerm: string;
  tourTypeFilter: string;
  scheduleStatusFilter: string;
}

export function restoreScheduleListView(value: string | null): ScheduleListViewState {
  const defaults: ScheduleListViewState = {
    selectedTourId: null, tourPage: 1, schedulePage: 1,
    searchTerm: "", tourTypeFilter: "all", scheduleStatusFilter: "upcoming",
  };
  if (!value) return defaults;
  try {
    const saved = JSON.parse(value);
    if (!saved || typeof saved !== "object") return defaults;
    const positiveInteger = (value: unknown): value is number =>
      Number.isSafeInteger(value) && Number(value) > 0;
    return {
      selectedTourId: positiveInteger(saved.selectedTourId) ? saved.selectedTourId : null,
      tourPage: positiveInteger(saved.tourPage) ? saved.tourPage : 1,
      schedulePage: positiveInteger(saved.schedulePage) ? saved.schedulePage : 1,
      searchTerm: typeof saved.searchTerm === "string" ? saved.searchTerm : "",
      tourTypeFilter: ["all", "domestic", "outbound", "international"].includes(saved.tourTypeFilter) ? saved.tourTypeFilter : "all",
      scheduleStatusFilter: ["upcoming", "past", "selling", "full", "hidden", "all"].includes(saved.scheduleStatusFilter) ? saved.scheduleStatusFilter : "upcoming",
    };
  } catch {
    return defaults;
  }
}

// Only clamp after the corresponding request succeeds, never against an empty loading list.
export function reconcileScheduleListPage(page: number, totalPages: number, ready: boolean) {
  return ready ? Math.min(page, Math.max(1, totalPages)) : page;
}
