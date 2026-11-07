import type { TourSchedule } from 'shared';

type ScheduleWithPickup = Pick<TourSchedule, 'tour_schedule_id' | 'pickup_points'>;

export function resolvePickupPoint(schedule: ScheduleWithPickup | null | undefined, requestedId?: string | number | null) {
  const points = schedule?.pickup_points ?? [];
  const id = Number(requestedId);
  const selected = Number.isSafeInteger(id) && id > 0 ? points.find(point => point.pickup_point_id === id) : undefined;
  return selected ?? (points.length === 1 ? points[0] : null);
}

export function buildTourBookingHref(tourId: number, schedule: ScheduleWithPickup, pickupPointId?: number | null) {
  const params = new URLSearchParams({ tourId: String(tourId), scheduleId: String(schedule.tour_schedule_id) });
  const pickup = resolvePickupPoint(schedule, pickupPointId);
  if (pickup) params.set('pickupPointId', String(pickup.pickup_point_id));
  return `/booking?${params}`;
}

export function resolveBookingDeparture(schedules: TourSchedule[], scheduleId?: string | null, pickupPointId?: string | null) {
  // A removed departure must not silently become a different trip.
  const schedule = scheduleId ? schedules.find(item => item.tour_schedule_id === Number(scheduleId)) ?? null : schedules[0] ?? null;
  return { schedule, pickup: resolvePickupPoint(schedule, pickupPointId) };
}
