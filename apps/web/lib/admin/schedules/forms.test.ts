import assert from "node:assert/strict";
import test from "node:test";
import { buildScheduleFormFromResponse, buildSchedulePayload, createDefaultScheduleForm, createEmptyPickupPoint, pickupDateToInput, pickupInputToDate, updateScheduleBasePrice, updateScheduleStart } from "./forms";

test("schedule attraction selection survives reopening and clearing independently of daily activities", () => {
  const response = { tour_schedule_attractions: [{ location_id: 10, sort_order: 0 }], tour_itineraries: [{ day_number: 1, activities: [{ time: "08:00", title: "Ăn sáng", description: "", location_id: 20 }] }] };
  const form = buildScheduleFormFromResponse(response);
  assert.deepEqual(form.attraction_ids, [10]);
  assert.deepEqual(buildSchedulePayload(form).attraction_ids, [10]);
  assert.deepEqual(buildScheduleFormFromResponse({ ...response, tour_schedule_attractions: [] }).attraction_ids, []);
  assert.deepEqual(buildSchedulePayload({ ...form, attraction_ids: [] }).attraction_ids, []);
  assert.equal(form.itinerary[0].activities?.[0].location_id, 20);
});

test("a new schedule starts with one independent editable pickup point", () => {
  const first = createDefaultScheduleForm();
  const second = createDefaultScheduleForm();
  assert.equal(first.pickup_points.length, 1);
  assert.notEqual(first.pickup_points[0], second.pickup_points[0]);
  assert.equal(createEmptyPickupPoint({ start_date: "2027-01-03", start_time: "08:30" }).pickup_at, "2027-01-03T08:30");
});

test("changing departure follows tour duration and only moves untouched pickup times", () => {
  let form = updateScheduleStart(createDefaultScheduleForm(), "2027-01-30", "08:00", 3);
  assert.equal(form.end_date, "2027-02-01");
  assert.equal(form.pickup_points[0].pickup_at, "2027-01-30T08:00");
  form.pickup_points.push({ name: "Điểm riêng", address: "Địa chỉ riêng", note: "", pickup_at: "2027-01-30T06:30" });
  form = updateScheduleStart(form, "2027-02-03", "09:30", 3);
  assert.equal(form.pickup_points[0].pickup_at, "2027-02-03T09:30");
  assert.equal(form.pickup_points[1].pickup_at, "2027-01-30T06:30");
});

test("base price synchronizes adults without mutating child prices or existing state", () => {
  const form = createDefaultScheduleForm();
  form.prices[1].price = 500000;
  const next = updateScheduleBasePrice(form, 11100000);
  assert.equal(next.price, 11100000);
  assert.equal(next.prices[0].price, 11100000);
  assert.equal(next.prices[1].price, 500000);
  assert.equal(form.prices[0].price, 0);
});

test("an existing schedule keeps its departure location and pickup identities when resaved", () => {
  const form = buildScheduleFormFromResponse({ departure_location_id: 8, start_date: "2027-02-03T01:00:00Z", end_date: "2027-02-04T10:00:00Z", pickup_points: [{ pickup_point_id: 3, name: "Bến xe", address: "Địa chỉ", pickup_at: "2027-02-03T00:30:00Z", sort_order: 0 }] });
  const payload = buildSchedulePayload(form);
  assert.equal(payload.departure_location_id, 8);
  assert.equal(payload.pickup_points[0].pickup_at, "2027-02-03T00:30:00.000Z");
  assert.equal(buildScheduleFormFromResponse({ pickup_points: [] }).pickup_points.length, 0);
});

test("the date-time picker preserves Vietnam pickup wall time, including midnight and clearing", () => {
  const date = pickupInputToDate("2027-02-03T00:05");
  assert.ok(date);
  assert.equal(date.getHours(), 0);
  assert.equal(date.getMinutes(), 5);
  assert.equal(pickupDateToInput(date), "2027-02-03T00:05");
  const form = createDefaultScheduleForm();
  form.pickup_points[0].pickup_at = pickupDateToInput(date);
  assert.equal(buildSchedulePayload(form).pickup_points[0].pickup_at, "2027-02-02T17:05:00.000Z");
  assert.equal(pickupDateToInput(null), "");
  for (const value of ["", "2027-02-30T08:00", "2027-02-03T24:00"]) assert.equal(pickupInputToDate(value), null);
});

test("hotel and room selections are restored from their separate per-day allocations", () => {
  const form = buildScheduleFormFromResponse({
    tour_itineraries: [{ day_number: 1, title: "Ngày 1" }, { day_number: 2, title: "Ngày 2" }],
    tour_schedule_hotels: [
      { day_from: 1, day_to: 1, hotel_id: 10, room_type_id: 101, nights: 1 },
      { day_from: 2, day_to: 2, hotel_id: 20, room_type_id: 202, nights: 1 },
    ],
  });
  assert.deepEqual(form.itinerary.map(day => [day.hotel_id, day.room_type_id]), [[10, 101], [20, 202]]);
  const payload = buildSchedulePayload(form);
  assert.deepEqual(payload.itinerary.map(day => [day.day_number, day.hotel_id, day.room_type_id]), [[1, 10, 101], [2, 20, 202]]);
});
