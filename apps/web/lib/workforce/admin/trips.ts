import type { WorkforceSchedule } from 'shared';

export type WorkforceTripStatus = 'upcoming' | 'ongoing' | 'completed';
export type WorkforceTripFilter = WorkforceTripStatus | 'all';

export const WORKFORCE_TRIP_STATUSES = {
  upcoming: { label: 'Sắp khởi hành', className: 'bg-blue-50 text-blue-700' },
  ongoing: { label: 'Đang diễn ra', className: 'bg-emerald-50 text-emerald-700' },
  completed: { label: 'Đã kết thúc', className: 'bg-slate-100 text-slate-600' },
} as const;

export function getWorkforceTripStatus(
  schedule: Pick<WorkforceSchedule, 'start_date' | 'end_date'>,
  now = Date.now(),
): WorkforceTripStatus {
  if (Date.parse(schedule.end_date) <= now) return 'completed';
  if (Date.parse(schedule.start_date) <= now) return 'ongoing';
  return 'upcoming';
}

/** Lọc trước khi phân trang; ưu tiên chuyến đang đi, sắp đi rồi lịch sử gần nhất. */
export function filterWorkforceTrips(schedules: WorkforceSchedule[], filters: {
  status: WorkforceTripFilter;
  search: string;
  missingCrew: boolean;
  userId?: number;
}, now = Date.now()) {
  const search = filters.search.trim().toLocaleLowerCase('vi');
  const rank = { ongoing: 0, upcoming: 1, completed: 2 };
  return schedules.filter(schedule =>
    (filters.status === 'all' || getWorkforceTripStatus(schedule, now) === filters.status)
    && (!filters.missingCrew || !schedule.crew_ready)
    && (filters.userId === undefined || schedule.crew.some(member => member.user_id === filters.userId))
    && `${schedule.tours.name} ${schedule.code || ''} ${schedule.departure_location.name}`.toLocaleLowerCase('vi').includes(search),
  ).sort((a, b) => {
    const statusA = getWorkforceTripStatus(a, now);
    const statusB = getWorkforceTripStatus(b, now);
    const order = rank[statusA] - rank[statusB];
    if (order) return order;
    const dateOrder = statusA === 'completed'
      ? Date.parse(b.end_date) - Date.parse(a.end_date)
      : Date.parse(a.start_date) - Date.parse(b.start_date);
    return dateOrder || a.tour_schedule_id - b.tour_schedule_id;
  });
}
