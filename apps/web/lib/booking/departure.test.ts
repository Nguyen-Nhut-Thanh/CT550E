import assert from 'node:assert/strict';
import test from 'node:test';
import type { TourSchedule } from 'shared';
import { buildTourBookingHref, resolveBookingDeparture, resolvePickupPoint } from './departure';

const point = (id: number) => ({ pickup_point_id: id, name: `Điểm ${id}`, address: `Địa chỉ ${id}`, pickup_at: '2026-11-06T01:00:00Z', sort_order: id });
const schedules: TourSchedule[] = [
  { tour_schedule_id: 123, start_date: '2026-11-06T01:00:00Z', end_date: '2026-11-07T10:00:00Z', price: 11100000, quota: 20, booked_count: 0, pickup_points: [point(11), point(12)] },
  { tour_schedule_id: 86, start_date: '2026-11-06T01:00:00Z', end_date: '2026-11-07T10:00:00Z', price: 12000000, quota: 20, booked_count: 0, pickup_points: [] },
];

test('popup departure and pickup survive the tour-to-booking URL handoff', () => {
  const href = buildTourBookingHref(7, schedules[0], 12);
  const params = new URL(href, 'https://example.invalid').searchParams;
  assert.equal(params.get('tourId'), '7');
  const selection = resolveBookingDeparture(schedules, params.get('scheduleId'), params.get('pickupPointId'));
  assert.equal(selection.schedule?.tour_schedule_id, 123);
  assert.equal(selection.pickup?.pickup_point_id, 12);
});

test('one pickup is selected automatically, including direct booking links', () => {
  const schedule = { ...schedules[0], pickup_points: [point(11)] };
  const params = new URL(buildTourBookingHref(7, schedule), 'https://example.invalid').searchParams;
  assert.equal(params.get('pickupPointId'), '11');
  assert.equal(resolveBookingDeparture([schedule], '123').pickup?.pickup_point_id, 11);
});

test('changing departure cannot reuse a pickup from another trip', () => {
  assert.equal(resolvePickupPoint(schedules[1], 12), null);
  assert.equal(new URL(buildTourBookingHref(7, schedules[1], 12), 'https://example.invalid').searchParams.has('pickupPointId'), false);
});

test('removed pickup is not accepted and a removed trip never silently becomes another trip', () => {
  assert.equal(resolveBookingDeparture(schedules, '123', '999').pickup, null);
  assert.equal(resolveBookingDeparture(schedules, '999', '12').schedule, null);
  assert.equal(resolveBookingDeparture(schedules, '999', '12').pickup, null);
});

test('multiple pickups require an actual choice and malformed IDs are rejected', () => {
  assert.equal(resolvePickupPoint(schedules[0]), null);
  assert.equal(resolvePickupPoint(schedules[0], '11x'), null);
  assert.equal(resolvePickupPoint(schedules[0], '11.5'), null);
});

test('direct booking without a departure parameter still uses the first available trip', () => {
  assert.equal(resolveBookingDeparture(schedules).schedule?.tour_schedule_id, 123);
  assert.deepEqual(resolveBookingDeparture([], null, '12'), { schedule: null, pickup: null });
});
