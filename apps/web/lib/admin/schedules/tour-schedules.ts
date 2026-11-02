import type { AdminSchedule } from "shared";
import { matchesScheduleStatusFilter } from "./status";

export function normalizeScheduleSearch(value: string) {
  return value.toLocaleLowerCase("vi-VN").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
}

export function formatScheduleDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });
}

export function getSchedulePickupOptions(schedules: AdminSchedule[]) {
  const names = new Map<string, string>();
  for (const schedule of schedules) {
    for (const name of [schedule.departure_location?.name, ...(schedule.pickup_points ?? []).map(point => point.name)]) {
      if (name?.trim()) names.set(normalizeScheduleSearch(name), name.trim());
    }
  }
  return [...names.entries()].sort((a, b) => a[1].localeCompare(b[1], "vi"))
    .map(([value, label]) => ({ value, label }));
}

export function filterTourSchedules(schedules: AdminSchedule[], filters: {
  search: string;
  pickup: string;
  time: string;
  status: string;
}, now = new Date()) {
  const search = normalizeScheduleSearch(filters.search);
  const vietnamNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const monthOffset = filters.time === "next-month" ? 1 : 0;
  const monthStart = Date.UTC(vietnamNow.getUTCFullYear(), vietnamNow.getUTCMonth() + monthOffset, 1) - 7 * 60 * 60 * 1000;
  const monthEnd = Date.UTC(vietnamNow.getUTCFullYear(), vietnamNow.getUTCMonth() + monthOffset + 1, 1) - 7 * 60 * 60 * 1000;

  return schedules.filter(schedule => {
    const names = [schedule.departure_location?.name ?? "", ...(schedule.pickup_points ?? []).map(point => point.name)];
    const searchable = [String(schedule.tour_schedule_id), formatScheduleDate(schedule.start_date), formatScheduleDate(schedule.end_date), ...names].join(" ");
    if (search && !normalizeScheduleSearch(searchable).includes(search)) return false;
    if (filters.pickup !== "all" && !names.some(name => normalizeScheduleSearch(name) === filters.pickup)) return false;

    const start = new Date(schedule.start_date).getTime();
    if (filters.time === "upcoming" && start < now.getTime()) return false;
    if (filters.time === "past" && start >= now.getTime()) return false;
    if (["this-month", "next-month"].includes(filters.time) && !(start >= monthStart && start < monthEnd)) return false;
    return matchesScheduleStatusFilter(schedule, filters.status);
  });
}
