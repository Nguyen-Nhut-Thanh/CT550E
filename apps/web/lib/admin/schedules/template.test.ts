import assert from 'node:assert/strict';
import test from 'node:test';
import type { TourScheduleTemplate } from 'shared';
import { applyScheduleTemplate, buildScheduleTemplatePayload, setTemplatePickupDate } from './template';
import { buildSchedulePayload, createDefaultScheduleForm, updateScheduleStart } from './forms';

const template: TourScheduleTemplate = {
  departure_location_id: 5, attraction_ids: [10, 20],
  pickup_points: [
    { name: 'Điểm đêm trước', address: 'Địa chỉ A', note: 'Có mặt trước 15 phút', day_offset: -1, time: '23:30' },
    { name: 'Điểm buổi sáng', address: 'Địa chỉ B', note: '', day_offset: 0, time: '06:30' },
    { name: 'Điểm ngày hai', address: 'Địa chỉ C', note: '', day_offset: 1, time: '00:05' },
  ],
  itinerary: [
    { day_number: 1, title: 'Khám phá', content: 'Ghi chú', meals: 'Sáng, trưa', hotel_id: 7, room_type_id: 70, transport_id: 8, activities: [{ time: '09:00', title: 'Tham quan', description: 'Đi bộ', location_id: null }] },
    { day_number: 2, title: 'Ngày về', transport_id: null, activities: [] },
  ],
};

test('template fills an independent editable schedule, including attractions, hotels and optional transports', () => {
  const current = createDefaultScheduleForm();
  current.price = 1230000; current.quota = 25; current.cover_image_url = '/new-cover.jpg'; current.note = 'Ghi chú riêng'; current.status = 0;
  const copied = applyScheduleTemplate(current, template, 2);
  assert.deepEqual(copied.attraction_ids, [10, 20]);
  assert.equal(copied.departure_location_id, 5);
  assert.deepEqual(copied.itinerary.map(day => [day.hotel_id, day.room_type_id, day.transport_id]), [[7, 70, 8], ['', '', '']]);
  assert.deepEqual([copied.price, copied.quota, copied.cover_image_url, copied.note, copied.status], [1230000, 25, '/new-cover.jpg', 'Ghi chú riêng', 0]);
  assert.equal(copied.prices, current.prices);
  assert.equal(copied.tour_schedule_amenities, current.tour_schedule_amenities);
  copied.attraction_ids.pop(); copied.itinerary[0].activities![0].title = 'Chỉnh riêng'; copied.pickup_points[0].name = 'Tên riêng';
  assert.deepEqual(template.attraction_ids, [10, 20]);
  assert.equal(template.itinerary[0].activities![0].title, 'Tham quan');
  assert.equal(template.pickup_points[0].name, 'Điểm đêm trước');
  assert.equal(applyScheduleTemplate(copied, template, 2).itinerary[0].activities![0].title, 'Tham quan');
});

test('a template without a departure date waits for the chosen date and rebases every pickup across year boundaries', () => {
  const pending = applyScheduleTemplate(createDefaultScheduleForm(), template, 2);
  assert.ok(pending.pickup_points.every(point => point.pickup_at === ''));
  const dated = updateScheduleStart(pending, '2027-01-01', '08:00', 2);
  assert.deepEqual(dated.pickup_points.map(point => point.pickup_at), ['2026-12-31T23:30', '2027-01-01T06:30', '2027-01-02T00:05']);
  const payload = buildSchedulePayload(dated);
  assert.equal(payload.pickup_points[0].pickup_at, '2026-12-31T16:30:00.000Z');
  assert.equal(payload.pickup_points[2].pickup_at, '2027-01-01T17:05:00.000Z');
  assert.ok(payload.pickup_points.every(point => !('day_offset' in point) && !('pickup_time' in point) && !('pickup_point_id' in point)));
  const later = updateScheduleStart(dated, '2027-02-28', '09:00', 2);
  assert.deepEqual(later.pickup_points.map(point => point.pickup_at), ['2027-02-27T23:30', '2027-02-28T06:30', '2027-03-01T00:05']);
});

test('applying after selecting the date computes pickup dates immediately and keeps manually overridden times', () => {
  const current = updateScheduleStart(createDefaultScheduleForm(), '2028-02-29', '10:00', 2);
  const copied = applyScheduleTemplate(current, template, 2);
  assert.equal(copied.start_time, '10:00');
  assert.equal(copied.end_date, '2028-03-01');
  assert.equal(copied.pickup_points[0].pickup_at, '2028-02-28T23:30');
  copied.pickup_points[1] = { ...copied.pickup_points[1], pickup_at: '2028-03-02T07:30', day_offset: undefined, pickup_time: undefined };
  assert.equal(updateScheduleStart(copied, '2028-03-03', '10:00', 2).pickup_points[1].pickup_at, '2028-03-02T07:30');
});

test('saving a template uses relative days and time without actual dates, schedule identity or passenger data', () => {
  const copied = applyScheduleTemplate(updateScheduleStart(createDefaultScheduleForm(), '2027-06-03', '08:00', 2), template, 2);
  const result = buildScheduleTemplatePayload(copied);
  assert.deepEqual(result.pickup_points, template.pickup_points);
  assert.deepEqual(result.attraction_ids, template.attraction_ids);
  assert.ok(!('start_date' in result) && !('tour_schedule_id' in result) && !('booked_count' in result) && !('quota' in result));
  assert.equal(result.itinerary[1].transport_id, null);
  assert.deepEqual(buildScheduleTemplatePayload(applyScheduleTemplate(copied, { ...template, pickup_points: [], attraction_ids: [], itinerary: [] }, 2)).attraction_ids, []);
});

test('the combined date-time picker saves its relative day and restores the same reference date and time', () => {
  const base = updateScheduleStart(createDefaultScheduleForm(), '2027-01-01', '08:00', 2);
  let edited = applyScheduleTemplate(base, template, 2);
  edited = setTemplatePickupDate(edited, 0, '2026-12-31T22:45');
  const saved = buildScheduleTemplatePayload(edited);
  assert.equal(saved.reference_date, '2027-01-01');
  assert.equal(saved.pickup_points[0].day_offset, -1);
  assert.equal(saved.pickup_points[0].time, '22:45');
  const reopened = applyScheduleTemplate(updateScheduleStart(createDefaultScheduleForm(), saved.reference_date!, '08:00', 2), saved, 2);
  assert.equal(reopened.pickup_points[0].pickup_at, '2026-12-31T22:45');
  const moved = updateScheduleStart(edited, '2027-02-01', '08:00', 2);
  assert.equal(moved.pickup_points[0].pickup_at, '2027-01-31T22:45');
  assert.throws(() => buildScheduleTemplatePayload(setTemplatePickupDate(edited, 0, '')), /chọn ngày và giờ/);
});
