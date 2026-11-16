import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { WorkforceSchedule } from 'shared';
import { filterWorkforceTrips, getWorkforceTripStatus } from './trips';

const now = Date.parse('2026-10-30T05:00:00Z');
const defaults = { status: 'all', search: '', missingCrew: false } as const;

function trip(id: number, start: string, end: string, overrides: Partial<WorkforceSchedule> = {}): WorkforceSchedule {
  return {
    tour_schedule_id: id, code: `CH${id}`, start_date: start, end_date: end,
    status: 1, booked_count: 0, operating_region: 'north',
    departure_location: { name: 'Hà Nội' }, tours: { name: 'Hành trình Hà Giang' },
    crew: [], crew_ready: false, crew_required_count: 1, crew_confirmed_count: 0, crew_issues: [],
    ...overrides,
  };
}

test('trip status respects exact departure/end instants and Vietnam offsets', () => {
  const schedule = trip(1, '2026-10-30T12:00:00+07:00', '2026-11-01T12:00:00+07:00');
  assert.equal(getWorkforceTripStatus(schedule, now - 1), 'upcoming');
  assert.equal(getWorkforceTripStatus(schedule, now), 'ongoing');
  const end = Date.parse(schedule.end_date);
  assert.equal(getWorkforceTripStatus(schedule, end - 1), 'ongoing');
  assert.equal(getWorkforceTripStatus(schedule, end), 'completed');
});

test('time filters separate future, ongoing, and ended trips', () => {
  const schedules = [
    trip(1, '2026-10-31T00:00:00Z', '2026-11-01T00:00:00Z'),
    trip(2, '2026-10-29T00:00:00Z', '2026-10-31T00:00:00Z'),
    trip(3, '2026-10-28T00:00:00Z', '2026-10-29T00:00:00Z'),
  ];
  for (const [status, id] of [['upcoming', 1], ['ongoing', 2], ['completed', 3]] as const) {
    assert.deepEqual(filterWorkforceTrips(schedules, { ...defaults, status }, now).map(item => item.tour_schedule_id), [id]);
  }
});

test('search, missing crew, personal assignments and time filters combine', () => {
  const assigned = trip(1, '2026-10-31T00:00:00Z', '2026-11-01T00:00:00Z', {
    crew: [{ assignment_id: 1, tour_schedule_id: 1, user_id: 7, roles: ['guide'], status: 'pending',
      report_at: '2026-10-31T00:00:00Z', release_at: '2026-11-01T00:00:00Z', user: { full_name: 'Nhân viên' } }],
  });
  const schedules = [assigned, { ...assigned, tour_schedule_id: 2, crew_ready: true }, { ...assigned, tour_schedule_id: 3, crew: [] }];
  for (const search of [' HÀ GIANG ', 'ch1', 'hà nội']) {
    assert.deepEqual(filterWorkforceTrips(schedules, { status: 'upcoming', search, missingCrew: true, userId: 7 }, now).map(item => item.tour_schedule_id), [1]);
  }
  assert.equal(filterWorkforceTrips(schedules, { ...defaults, search: 'Không tồn tại' }, now).length, 0);
  assert.equal(filterWorkforceTrips(schedules, { ...defaults, userId: 8 }, now).length, 0);
});

test('sorts nearest departures and recent history without mutating source data', () => {
  const schedules = [
    trip(1, '2026-11-03T00:00:00Z', '2026-11-04T00:00:00Z'),
    trip(2, '2026-10-28T00:00:00Z', '2026-10-29T00:00:00Z'),
    trip(3, '2026-10-20T00:00:00Z', '2026-10-30T04:59:00Z'),
    trip(4, '2026-10-31T00:00:00Z', '2026-11-01T00:00:00Z'),
    trip(5, '2026-10-29T00:00:00Z', '2026-11-01T00:00:00Z'),
  ];
  assert.deepEqual(filterWorkforceTrips(schedules, defaults, now).map(item => item.tour_schedule_id), [5, 4, 1, 3, 2]);
  assert.deepEqual(schedules.map(item => item.tour_schedule_id), [1, 2, 3, 4, 5]);
});
