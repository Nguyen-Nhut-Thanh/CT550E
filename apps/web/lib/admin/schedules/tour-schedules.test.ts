import assert from "node:assert/strict";
import test from "node:test";
import type { AdminSchedule } from "shared";
import { filterTourSchedules, getSchedulePickupOptions } from "./tour-schedules";

const defaults = { search: "", pickup: "all", time: "all", status: "all" };
const schedule = (id: number, changes: Partial<AdminSchedule> = {}): AdminSchedule => ({
  tour_schedule_id: id, start_date: "2099-11-04T01:00:00Z", end_date: "2099-11-05T10:00:00Z",
  price: 11100000, quota: 20, status: 1, booked_count: 6,
  departure_location: { location_id: 1, name: "Đà Nẵng" }, ...changes,
});

test("searches Vietnamese names without accents and dates shown in the table", () => {
  const items = [schedule(74), schedule(75, { departure_location: { location_id: 2, name: "An Giang" } })];
  assert.deepEqual(filterTourSchedules(items, { ...defaults, search: "da nang" }).map(item => item.tour_schedule_id), [74]);
  assert.equal(filterTourSchedules(items, { ...defaults, search: "4/11/2099" }).length, 2);
});

test("pickup choices include origins and actual pickup points, with duplicate names combined", () => {
  const point = { pickup_point_id: 1, name: "Bến xe", address: "Đà Nẵng", pickup_at: "2099-11-04T00:00:00Z", sort_order: 0 };
  const items = [schedule(74, { pickup_points: [point] }), schedule(75)];
  assert.equal(getSchedulePickupOptions(items).length, 2);
  assert.deepEqual(filterTourSchedules(items, { ...defaults, pickup: "ben xe" }).map(item => item.tour_schedule_id), [74]);
});

test("month boundaries follow Vietnam time, including December to January", () => {
  const now = new Date("2099-12-15T01:00:00Z");
  const items = [schedule(1, { start_date: "2099-12-31T16:59:59Z" }), schedule(2, { start_date: "2099-12-31T17:00:00Z" })];
  assert.deepEqual(filterTourSchedules(items, { ...defaults, time: "this-month" }, now).map(item => item.tour_schedule_id), [1]);
  assert.deepEqual(filterTourSchedules(items, { ...defaults, time: "next-month" }, now).map(item => item.tour_schedule_id), [2]);
});

test("status filtering uses passenger counts and keeps hidden schedules accessible", () => {
  const items = [schedule(1), schedule(2, { booked_count: 20, _count: { bookings: 2 } }), schedule(3, { status: 0 })];
  assert.deepEqual(filterTourSchedules(items, { ...defaults, status: "selling" }).map(item => item.tour_schedule_id), [1]);
  assert.deepEqual(filterTourSchedules(items, { ...defaults, status: "full" }).map(item => item.tour_schedule_id), [2]);
  assert.deepEqual(filterTourSchedules(items, { ...defaults, status: "hidden" }).map(item => item.tour_schedule_id), [3]);
});
