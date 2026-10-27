import type { LocationItem } from "shared";

export type LocationFilters = { search: string; level: string; region: string; sort: string };
export const DEFAULT_LOCATION_FILTERS: LocationFilters = { search: "", level: "all", region: "all", sort: "updated" };

export function getLocationRegionId(item: LocationItem, byId: Map<number, LocationItem>) {
  const visited = new Set<number>();
  let current: LocationItem | undefined = item;
  while (current && !visited.has(current.location_id)) {
    if (current.level_id === 4) return current.location_id;
    visited.add(current.location_id);
    current = current.parent_id ? byId.get(current.parent_id) : undefined;
  }
  return null;
}

export function filterManagedLocations(items: LocationItem[], filters: LocationFilters) {
  const byId = new Map(items.map(item => [item.location_id, item]));
  const search = filters.search.trim().toLocaleLowerCase("vi");
  const result = items.filter(item => (!search || [item.name, item.slug, item.note].some(value => value?.toLocaleLowerCase("vi").includes(search)))
    && (filters.level === "all" || String(item.level_id) === filters.level)
    && (filters.region === "all" || String(getLocationRegionId(item, byId)) === filters.region));
  return result.sort((a, b) => {
    if (filters.sort === "name") return a.name.localeCompare(b.name, "vi");
    if (filters.sort === "nameDesc") return b.name.localeCompare(a.name, "vi");
    const aTime = Date.parse(a.updated_at ?? "") || 0;
    const bTime = Date.parse(b.updated_at ?? "") || 0;
    return (filters.sort === "oldest" ? aTime - bTime : bTime - aTime) || a.name.localeCompare(b.name, "vi");
  });
}

export function getLocationStatistics(items: LocationItem[]) {
  return { total: items.length, provinces: items.filter(item => item.level_id === 5).length, attractions: items.filter(item => item.level_id === 6).length, featured: items.filter(item => item.is_featured).length };
}
