import type { ScheduleLike } from 'shared';

export function getScheduleBookedCount(schedule: ScheduleLike) {
  return schedule._count?.bookings || 0;
}

export function isSchedulePast(schedule: ScheduleLike) {
  return new Date(schedule.start_date) < new Date();
}

export function isScheduleFull(schedule: ScheduleLike) {
  return getScheduleBookedCount(schedule) >= schedule.quota;
}

export function getScheduleStatusMeta(
  schedule: ScheduleLike,
  options?: { isParentHidden?: boolean },
) {
  const past = isSchedulePast(schedule);
  const full = isScheduleFull(schedule);
  const isParentHidden = options?.isParentHidden ?? false;

  if(past) return { label: "Đã khởi hành", tone: "muted" as const };
  if(schedule.status === 0) return { label: "Tạm khóa", tone: "warning" as const };
  if(isParentHidden) return { label: "Bị ẩn theo tour gốc", tone: "muted" as const };
  if(full) return { label: "Đã hết chỗ", tone: "warning" as const };
  return { label: "Đang hoạt động", tone: "success" as const };
}

export function matchesScheduleStatusFilter(
  schedule: ScheduleLike,
  filterType: string,
) {
  const past = isSchedulePast(schedule);
  const full = isScheduleFull(schedule);

  if(filterType === "upcoming") return !past && schedule.status === 1;
  if(filterType === "past") return past;
  if(filterType === "full") return full && !past;
  if(filterType === "hidden") return schedule.status === 0;
  return true;
}
