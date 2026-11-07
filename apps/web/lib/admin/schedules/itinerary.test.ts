import assert from "node:assert/strict";
import test from "node:test";
import type { LocationOption } from "shared";
import { createDefaultScheduleForm, createEmptyItineraryDay } from "./forms";
import { getIncompleteItineraryDays, getItineraryProvinces, getProvinceAttractions, toggleScheduleAttraction, updateItineraryActivity } from "./itinerary";

test("completeness checks every expected day and keeps transport and hotel allocation optional", () => {
  const first = { ...createEmptyItineraryDay(1), title: 'Khám phá', meals: 'Sáng, trưa', activities: [{ time: '08:00', title: 'Tham quan', description: '' }] };
  const second = { ...createEmptyItineraryDay(2), title: 'Ngày về', meals: 'Không bao gồm', content: 'Nội dung lịch trình cũ' };
  assert.deepEqual(getIncompleteItineraryDays([first, second], 2), []);
  assert.deepEqual(getIncompleteItineraryDays([first], 3), [2, 3]);
  assert.deepEqual(getIncompleteItineraryDays([], 2), [1, 2]);
  assert.deepEqual(getIncompleteItineraryDays([{ ...first, title: ' ' }, { ...second, meals: ' ' }], 2), [1, 2]);
});

test("missing daily content, activity times and titles or half-selected hotel details trigger confirmation", () => {
  const complete = { ...createEmptyItineraryDay(1), title: 'Ngày 1', meals: 'Sáng', activities: [{ time: '08:00', title: 'Ăn sáng', description: '' }] };
  for (const day of [
    { ...complete, activities: [] }, { ...complete, activities: [{ time: '', title: 'Ăn sáng', description: '' }] },
    { ...complete, activities: [{ time: '08:00', title: ' ', description: 'Nội dung' }] },
    { ...complete, hotel_id: 7, room_type_id: '' }, { ...complete, hotel_id: '', room_type_id: 70 },
  ]) assert.deepEqual(getIncompleteItineraryDays([day], 1), [1]);
  assert.deepEqual(getIncompleteItineraryDays([{ ...complete, hotel_id: 7, room_type_id: 70 }], 1), []);
});

const locations: LocationOption[] = [
  { location_id: 1, level_id: 5, name: "Đà Nẵng" }, { location_id: 2, level_id: 5, name: "Quảng Ninh" },
  { location_id: 10, level_id: 6, parent_id: 1, name: "Cầu Rồng" }, { location_id: 11, level_id: 6, parent_id: 2, name: "Vịnh Hạ Long" },
  { location_id: 12, level_id: 4, parent_id: 1, name: "Không phải điểm tham quan" },
];

test("attraction choices follow tour province order and only include direct level-six children", () => {
  assert.deepEqual(getItineraryProvinces(locations, [{ location_id: 2, visit_order: 2 }, { location_id: 1, visit_order: 1 }]).map(item => item.location_id), [1, 2]);
  assert.deepEqual(getProvinceAttractions(locations, 1).map(item => item.location_id), [10]);
});

test("attractions are selected once per schedule without changing daily content or requiring a time", () => {
  const form = createDefaultScheduleForm();
  form.itinerary = [createEmptyItineraryDay(1), createEmptyItineraryDay(2)];
  form.itinerary[0].activities = [{ time: "08:00", title: "Ăn sáng", description: "Nhà hàng", location_id: null }];
  const selected = { ...form, attraction_ids: toggleScheduleAttraction(form.attraction_ids, 10, true) };
  assert.deepEqual(form.attraction_ids, []);
  assert.deepEqual(selected.attraction_ids, [10]);
  assert.equal(selected.itinerary, form.itinerary);
  assert.equal(selected.itinerary[1].activities?.length, 0);
  assert.deepEqual(toggleScheduleAttraction(selected.attraction_ids, 10, true), [10]);
  assert.deepEqual(toggleScheduleAttraction(selected.attraction_ids, 10, false), []);
});

test("editing the time column keeps the attraction link and leaves other content unchanged", () => {
  const activities = [{ time: "", title: "Cầu Rồng", description: "", location_id: 10 }];
  const next = updateItineraryActivity(activities, 0, { time: "09:30" });
  assert.equal(next[0].location_id, 10);
  assert.equal(next[0].time, "09:30");
  assert.equal(activities[0].time, "");
});
