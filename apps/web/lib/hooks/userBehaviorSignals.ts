import type { UserBehaviorSignals } from "shared";

export const SIGNALS_STORAGE_KEY = "journitrip_user_signals";
export const SIGNALS_CHANGED_EVENT = "tour-signals-change";
type Filters = NonNullable<UserBehaviorSignals["applied_filters"]>;
const isId = (value: unknown): value is number => Number.isInteger(value) && Number(value) > 0 && Number(value) <= 2147483647;
const isAmount = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;
const emptySignals = (): UserBehaviorSignals => ({ viewed_tours: [], searched_keywords: [], wishlist_tour_ids: [] });

function cleanFilters(value: unknown): Filters | undefined {
  if (!value || typeof value !== "object") return undefined;
  const input = value as Filters;
  const result: Filters = {};
  const min = input.price_range?.min;
  const max = input.price_range?.max;
  if ((isAmount(min) || isAmount(max)) && !(isAmount(min) && isAmount(max) && min > max)) {
    result.price_range = { ...(isAmount(min) ? { min } : {}), ...(isAmount(max) ? { max } : {}) };
  }
  if (isId(input.departure_location_id)) result.departure_location_id = input.departure_location_id;
  if (typeof input.destination === "string" && input.destination.trim()) result.destination = input.destination.trim().slice(0, 200);
  if (["domestic", "outbound", "international"].includes(input.tour_type ?? "")) result.tour_type = input.tour_type;
  return Object.keys(result).length ? result : undefined;
}

function cleanSignals(value: unknown): UserBehaviorSignals {
  if (!value || typeof value !== "object") return emptySignals();
  const input = value as UserBehaviorSignals;
  const views = new Map<number, UserBehaviorSignals["viewed_tours"][number]>();
  for (const view of Array.isArray(input.viewed_tours) ? input.viewed_tours : []) {
    if (!view || !isId(view.tourId) || typeof view.viewedAt !== "string" || !Number.isFinite(Date.parse(view.viewedAt))) continue;
    if (!views.has(view.tourId)) views.set(view.tourId, {
      tourId: view.tourId, viewedAt: new Date(view.viewedAt).toISOString(),
      ...(isAmount(view.duration) ? { duration: view.duration } : {}),
    });
    if (views.size === 10) break;
  }
  const keywords = new Map<string, string>();
  for (const keyword of Array.isArray(input.searched_keywords) ? input.searched_keywords : []) {
    if (typeof keyword !== "string" || !keyword.trim()) continue;
    const clean = keyword.trim().slice(0, 200);
    if (!keywords.has(clean.toLowerCase())) keywords.set(clean.toLowerCase(), clean);
    if (keywords.size === 5) break;
  }
  return {
    viewed_tours: [...views.values()],
    searched_keywords: [...keywords.values()],
    applied_filters: cleanFilters(input.applied_filters),
    wishlist_tour_ids: [...new Set((Array.isArray(input.wishlist_tour_ids) ? input.wishlist_tour_ids : []).filter(isId))].slice(0, 200),
  };
}

export function getUserSignals(): UserBehaviorSignals {
  if (typeof window === "undefined") return emptySignals();
  try {
    return cleanSignals(JSON.parse(localStorage.getItem(SIGNALS_STORAGE_KEY) ?? "null"));
  } catch {
    return emptySignals();
  }
}

export function saveUserSignals(signals: Partial<UserBehaviorSignals>) {
  if (typeof window === "undefined") return;
  try {
    const current = getUserSignals();
    const updated = cleanSignals({ ...current, ...signals });
    if (JSON.stringify(current) === JSON.stringify(updated)) return;
    localStorage.setItem(SIGNALS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(SIGNALS_CHANGED_EVENT));
  } catch {
    // Browsing and search remain usable when browser storage is unavailable.
  }
}

export function trackTourView(tourId: number) {
  if (!isId(tourId) || typeof window === "undefined") return;
  const current = getUserSignals();
  saveUserSignals({ viewed_tours: [
    { tourId, viewedAt: new Date().toISOString() },
    ...current.viewed_tours.filter(view => view.tourId !== tourId),
  ] });
}

export function trackSearchKeyword(keyword: string) {
  const clean = keyword.trim();
  if (!clean || typeof window === "undefined") return;
  const current = getUserSignals();
  saveUserSignals({ searched_keywords: [clean, ...current.searched_keywords.filter(term => term.toLowerCase() !== clean.toLowerCase())] });
}

/** Record the submitted search and replace the previous constraints, including clearing them. */
export function trackTourSearch(keyword: string, filters: Filters = {}) {
  const current = getUserSignals();
  const clean = keyword.trim();
  saveUserSignals({
    searched_keywords: clean
      ? [clean, ...current.searched_keywords.filter(term => term.toLowerCase() !== clean.toLowerCase())]
      : current.searched_keywords,
    applied_filters: filters,
  });
}
