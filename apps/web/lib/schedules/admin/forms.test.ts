import assert from "node:assert/strict";
import test from "node:test";
import { buildScheduleFormFromResponse, buildSchedulePayload, createDefaultScheduleForm, createEmptyPickupPoint, getSchedulePickupError, pickupDateToInput, pickupInputToDate, updateScheduleBasePrice, updateScheduleStart } from "./forms";

test("pickup validation compares Vietnam date and time and rejects equal or later times", () => {
  const form = updateScheduleStart(createDefaultScheduleForm(), '2027-01-01', '00:05', 2);
  form.pickup_points[0].pickup_at = '2026-12-31T23:59';
  assert.equal(getSchedulePickupError(form), null);
  assert.equal(new Date(buildSchedulePayload(form).start_date).toISOString(), '2026-12-31T17:05:00.000Z');
  for (const pickup of ['2027-01-01T00:05', '2027-01-01T00:06', '2027-01-02T00:00']) {
    form.pickup_points[0].pickup_at = pickup;
    assert.match(getSchedulePickupError(form)!, /Điểm đón 1:.*phải sớm hơn/);
  }
  form.pickup_points[0].pickup_at = '2026-12-31T23:59';
  form.start_date = '2026-12-31';
  assert.match(getSchedulePickupError(form)!, /phải sớm hơn/);
});

test("saved unfinished days restore the exact inputs rather than filled defaults or old allocations", () => {
  const draft = { day_number: 1, title: '', content: 'Đang nhập', meals: '', hotel_id: 7, room_type_id: null, transport_id: null, activities: [{ time: '', title: 'Đang viết', description: 'Mô tả dở' }, { time: '08:00', title: '', description: '' }] };
  const form = buildScheduleFormFromResponse({
    duration_days: 1,
    tour_itineraries: [{ day_number: 1, title: 'Ngày 1', meals: 'Sáng', draft_data: draft }],
    tour_schedule_hotels: [{ hotel_id: 99, room_type_id: 999, day_from: 1 }],
    tour_schedule_transports: [{ transport_id: 99, transport_role: 'main', day_from: 1, day_to: 1 }],
  });
  assert.equal(form.itinerary[0].title, '');
  assert.equal(form.itinerary[0].meals, '');
  assert.deepEqual([form.itinerary[0].hotel_id, form.itinerary[0].room_type_id, form.itinerary[0].transport_id], [7, '', '']);
  assert.deepEqual(form.itinerary[0].activities, draft.activities);
  assert.deepEqual(buildSchedulePayload(form).itinerary[0].activities, draft.activities);
});

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

test("each day restores its own optional transport and clearing a choice sends null", () => {
  const form = buildScheduleFormFromResponse({
    duration_days: 3,
    tour_itineraries: [{ day_number: 1, title: "Ngày 1" }, { day_number: 2, title: "Ngày 2" }, { day_number: 3, title: "Ngày 3" }],
    tour_schedule_transports: [
      { transport_id: 11, transport_role: "main", day_from: 1, day_to: 1 },
      { transport_id: 22, transport_role: "main", day_from: 2, day_to: 2 },
      { transport_id: 33, transport_role: "transfer", day_from: 3, day_to: 3 },
    ],
  });
  assert.deepEqual(form.itinerary.map(day => day.transport_id), [11, 22, ""]);
  assert.deepEqual(buildSchedulePayload(form).itinerary.map(day => day.transport_id), [11, 22, null]);
  form.itinerary[0].transport_id = "";
  assert.deepEqual(buildSchedulePayload(form).itinerary.map(day => day.transport_id), [null, 22, null]);
});

test("legacy transport ranges fill days without itinerary rows and specific days take precedence", () => {
  const form = buildScheduleFormFromResponse({
    duration_days: 3,
    tour_schedule_transports: [
      { schedule_transport_id: 1, transport_id: 11, transport_role: "main", day_from: null, day_to: null },
      { schedule_transport_id: 2, transport_id: 22, transport_role: "main", day_from: 2, day_to: 2 },
    ],
  });
  assert.deepEqual(form.itinerary.map(day => [day.day_number, day.transport_id]), [[1, 11], [2, 22], [3, 11]]);
  const empty = buildScheduleFormFromResponse({ duration_days: 2, tour_schedule_transports: [] });
  assert.deepEqual(empty.itinerary.map(day => day.transport_id), ["", ""]);
});
