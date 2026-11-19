import { formatDate } from "@/lib/utils/dateTime";
import type { AdminSchedule } from "shared";
import { matchesScheduleStatusFilter } from "./status";

export function normalizeScheduleSearch(value: string) {
  return value.toLocaleLowerCase("vi-VN").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
}

export function formatScheduleDate(value: string) {
  return formatDate(value, undefined, "—");
}

export function formatScheduleDateRange(
  startDateStr?: string | null,
  endDateStr?: string | null,
  durationDays?: number | null,
) {
  if (!startDateStr) {
    return { isSameDay: false, startFormatted: "—", endFormatted: "—", displayFormatted: "—" };
  }
  const startFormatted = formatScheduleDate(startDateStr);
  let endFormatted = endDateStr ? formatScheduleDate(endDateStr) : startFormatted;
  const startObj = new Date(startDateStr);
  const endObj = endDateStr ? new Date(endDateStr) : null;
  const sameDay =
    !endObj ||
    isNaN(endObj.getTime()) ||
    isNaN(startObj.getTime()) ||
    startObj.toISOString().slice(0, 10) === endObj.toISOString().slice(0, 10) ||
    startFormatted === endFormatted;

  if (sameDay && durationDays && durationDays > 1 && !isNaN(startObj.getTime())) {
    const computedEnd = new Date(startObj);
    computedEnd.setDate(computedEnd.getDate() + (durationDays - 1));
    endFormatted = formatScheduleDate(computedEnd.toISOString());
    return {
      isSameDay: false,
      startFormatted,
      endFormatted,
      displayFormatted: `${startFormatted} -> ${endFormatted}`,
    };
  }

  if (sameDay) {
    return {
      isSameDay: true,
      startFormatted,
      endFormatted,
      displayFormatted: `${startFormatted} (Trong ngày)`,
    };
  }

  return {
    isSameDay: false,
    startFormatted,
    endFormatted,
    displayFormatted: `${startFormatted} -> ${endFormatted}`,
  };
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
