import 'reflect-metadata';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { SchedulesAdminService } from '../apps/api/src/modules/schedules/schedules-admin.service';
import { ToursAdminService } from '../apps/api/src/modules/tours/tours-admin.service';
import { LocationsAdminService } from '../apps/api/src/modules/locations/locations-admin.service';
import type { TourScheduleTemplate } from 'shared';
config({ path: resolve(__dirname, '../.env'), quiet: true });
config({ path: resolve(__dirname, '../apps/api/.env'), quiet: true });
const prisma = new PrismaClient();
const rollback = new Error('ROLLBACK_TEMPLATE_FIXTURES');
let assertions = 0;
function check(value: unknown) { assert.ok(value); assertions++; }
async function main() {
  const before = await prisma.tour_schedule_templates.count();
  try {
    await prisma.$transaction(async tx => {
      let sequence = 0;
      const db = new Proxy(tx, { get(target, key) {
        if (key === '$transaction') return async (callback: (client: typeof tx) => Promise<unknown>) => {
          const name = `template_test_${++sequence}`;
          await tx.$executeRawUnsafe(`SAVEPOINT ${name}`);
          try { const result = await callback(tx); await tx.$executeRawUnsafe(`RELEASE SAVEPOINT ${name}`); return result; }
          catch (error) { await tx.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT ${name}`); await tx.$executeRawUnsafe(`RELEASE SAVEPOINT ${name}`); throw error; }
        };
        const value = Reflect.get(target, key); return typeof value === 'function' ? value.bind(target) : value;
      } });
      const service = new SchedulesAdminService(db as never, {} as never);
      (service as any).logger = { error() {} };
      const key = `ST-${Date.now()}`;
      const city = await tx.locations.create({ data: { name: `${key}-City`, slug: `${key}-city`, level_id: 5, location_type: 'province_state' } });
      const attraction = await tx.locations.create({ data: { name: `${key}-Place`, slug: `${key}-place`, level_id: 6, location_type: 'attraction', parent_id: city.location_id } });
      const transport = await tx.transports.findFirstOrThrow();
      const hotel = await tx.hotels.create({ data: { name: `${key}-Hotel`, location_id: city.location_id, address: 'Địa chỉ' } });
      const room = await tx.hotel_room_types.create({ data: { name: 'Phòng đôi', hotel_id: hotel.hotel_id } });
      const tour = await tx.tours.create({ data: { code: key, name: key, description: 'Test', duration_days: 2, duration_nights: 1, departure_location: city.location_id, transport_id: transport.transport_id, tour_destinations: { create: { location_id: city.location_id, visit_order: 1 } } } });
      check((await service.getScheduleTemplate(tour.tour_id)).template === null);
      const template: TourScheduleTemplate = {
        reference_date: '2027-01-01',
        departure_location_id: city.location_id, attraction_ids: [attraction.location_id],
        pickup_points: [{ name: 'Điểm đón', address: 'Địa chỉ', day_offset: -1, time: '23:30', note: 'Đón buổi tối' }],
        itinerary: [{ day_number: 1, title: 'Mẫu ngày 1', activities: [{ time: '08:00', title: 'Tham quan', description: 'Nội dung' }], hotel_id: hotel.hotel_id, room_type_id: room.room_type_id, transport_id: transport.transport_id }, { day_number: 2, title: 'Mẫu ngày 2', activities: [], transport_id: null }],
      };
      await service.saveScheduleTemplate(tour.tour_id, template);
      const locations = new LocationsAdminService(db as never);
      const tours = new ToursAdminService(db as never);
      const usage = (await locations.findOne(attraction.location_id))!.usage_summary;
      check(usage.schedule_templates_count === 1 && !usage.can_delete && !usage.can_change_structure);
      await assert.rejects(() => locations.remove(attraction.location_id)); assertions++;
      await assert.rejects(() => tours.update(tour.tour_id, { destinations: [] }), /mẫu lịch trình/); assertions++;
      const saved = (await service.getScheduleTemplate(tour.tour_id)).template as unknown as TourScheduleTemplate;
      check(saved.pickup_points[0].day_offset === -1 && saved.pickup_points[0].time === '23:30');
      check(saved.reference_date === '2027-01-01');
      check(saved.attraction_ids[0] === attraction.location_id && saved.itinerary[0].hotel_id === hotel.hotel_id && saved.itinerary[1].transport_id === null);
      const unfinished = [{ day_number: 1, title: '', meals: '', hotel_id: hotel.hotel_id, room_type_id: null, transport_id: null, activities: [
        { time: '', title: 'Đang nhập giờ', description: 'Nội dung dở' },
        { time: '08:00', title: '', description: 'Đang nhập tiêu đề' },
        { time: '09:00', title: 'Hoạt động đầy đủ', description: '' },
      ] }, { day_number: 2, title: '', meals: '', activities: [] }];
      await assert.rejects(() => service.saveScheduleTemplate(tour.tour_id, { ...template, itinerary: unfinished })); assertions++;
      await service.saveScheduleTemplate(tour.tour_id, { ...template, itinerary: unfinished, allow_incomplete_itinerary: true });
      const unfinishedTemplate = (await service.getScheduleTemplate(tour.tour_id)).template as unknown as TourScheduleTemplate;
      check(unfinishedTemplate.itinerary[0].title === '' && unfinishedTemplate.itinerary[0].hotel_id === hotel.hotel_id && unfinishedTemplate.itinerary[0].room_type_id === null);
      check(unfinishedTemplate.itinerary[0].activities![0].time === '' && unfinishedTemplate.itinerary[0].activities![1].title === '' && unfinishedTemplate.itinerary[0].activities!.length === 3);
      check(!('allow_incomplete_itinerary' in unfinishedTemplate));
      await service.saveScheduleTemplate(tour.tour_id, template);
      const start = new Date(Date.now() + 30 * 86400000); start.setUTCHours(1, 0, 0, 0);
      const draftPayload = { start_date: start.toISOString(), end_date: new Date(start.getTime() + 86400000).toISOString(), price: 1000000, quota: 20, itinerary: unfinished };
      await assert.rejects(() => service.createSchedule(tour.tour_id, draftPayload)); assertions++;
      const draftSchedule = await service.createSchedule(tour.tour_id, { ...draftPayload, allow_incomplete_itinerary: true });
      let draftDetail = await service.findOneSchedule(draftSchedule.tour_schedule_id);
      let savedDraft = draftDetail.tour_itineraries[0].draft_data as unknown as { title: string; hotel_id: number; room_type_id: null; activities: Array<{ time: string; title: string }> };
      check(savedDraft.title === '' && savedDraft.hotel_id === hotel.hotel_id && savedDraft.room_type_id === null);
      check(savedDraft.activities.length === 3 && savedDraft.activities[0].time === '' && savedDraft.activities[1].title === '');
      check(draftDetail.tour_itineraries[0].activities.length === 1 && draftDetail.tour_itineraries[0].activities[0].title === 'Hoạt động đầy đủ');
      check(draftDetail.tour_schedule_hotels.length === 0);
      await service.updateSchedule(draftSchedule.tour_schedule_id, { price: 1100000 });
      check((await service.findOneSchedule(draftSchedule.tour_schedule_id)).tour_itineraries[0].draft_data !== null);
      await service.updateSchedule(draftSchedule.tour_schedule_id, { itinerary: [{ day_number: 1, title: 'Ghi chú bổ sung' }, { day_number: 2 }] });
      savedDraft = (await service.findOneSchedule(draftSchedule.tour_schedule_id)).tour_itineraries[0].draft_data as unknown as typeof savedDraft;
      check(savedDraft.activities.length === 3 && savedDraft.title === 'Ghi chú bổ sung');
      await assert.rejects(() => service.updateSchedule(draftSchedule.tour_schedule_id, { allow_incomplete_itinerary: true, itinerary: [{ day_number: 1, activities: [{ time: '99:00', title: 'Sai giờ', description: '' }] }] })); assertions++;
      await service.updateSchedule(draftSchedule.tour_schedule_id, { itinerary: [
        { day_number: 1, title: 'Đã hoàn tất', meals: 'Sáng, trưa', hotel_id: hotel.hotel_id, room_type_id: room.room_type_id, transport_id: null, activities: [{ time: '08:00', title: 'Hoàn tất', description: 'Nội dung' }] },
        { day_number: 2, title: 'Ngày về', meals: 'Sáng', activities: [{ time: '09:00', title: 'Trở về', description: '' }] },
      ] });
      draftDetail = await service.findOneSchedule(draftSchedule.tour_schedule_id);
      check(draftDetail.tour_itineraries.every(day => day.draft_data === null));
      check(draftDetail.tour_itineraries[0].activities[0].title === 'Hoàn tất' && draftDetail.tour_schedule_hotels[0].room_type_id === room.room_type_id);
      await service.deleteSchedule(draftSchedule.tour_schedule_id);
      const schedule = await service.createSchedule(tour.tour_id, {
        start_date: start.toISOString(), end_date: new Date(start.getTime() + 86400000).toISOString(), price: 1000000, quota: 20,
        departure_location_id: saved.departure_location_id, attraction_ids: saved.attraction_ids, itinerary: saved.itinerary,
        pickup_points: saved.pickup_points.map(point => ({ name: point.name, address: point.address, note: point.note, pickup_at: new Date(start.getTime() - 86400000 + 15.5 * 3600000).toISOString() })),
      });
      const detail = await service.findOneSchedule(schedule.tour_schedule_id);
      check(detail.tour_itineraries[0].title === 'Mẫu ngày 1' && detail.tour_itineraries[0].activities[0].time === '08:00');
      check(detail.tour_schedule_hotels[0].hotel_id === hotel.hotel_id && detail.tour_schedule_transports[0].transport_id === transport.transport_id);
      check(detail.pickup_points[0].name === 'Điểm đón' && detail.tour_schedule_attractions[0].location_id === attraction.location_id);
      await service.saveScheduleTemplate(tour.tour_id, { ...template, attraction_ids: [], pickup_points: [], itinerary: [{ day_number: 1, title: 'Đã sửa mẫu', transport_id: null, activities: [] }] });
      const retained = await service.findOneSchedule(schedule.tour_schedule_id);
      check(retained.tour_itineraries[0].title === 'Mẫu ngày 1' && retained.pickup_points.length === 1 && retained.tour_schedule_attractions.length === 1);
      await service.updateSchedule(schedule.tour_schedule_id, { itinerary: [{ day_number: 1, title: 'Sửa riêng chuyến', activities: [], transport_id: null }], attraction_ids: [] });
      check(((await service.getScheduleTemplate(tour.tour_id)).template as unknown as TourScheduleTemplate).itinerary[0].title === 'Đã sửa mẫu');
      check((await service.findOneSchedule(schedule.tour_schedule_id)).tour_itineraries[0].title === 'Sửa riêng chuyến');
      for (const invalid of [null, {}, { ...template, reference_date: '2027-02-30' }, { ...template, pickup_points: [{ ...template.pickup_points[0], time: '24:00' }] }, { ...template, pickup_points: [{ ...template.pickup_points[0], day_offset: 2 }] }, { ...template, attraction_ids: [city.location_id] }, { ...template, itinerary: [{ day_number: 3 }] }, { ...template, itinerary: [{ day_number: 1, hotel_id: hotel.hotel_id }] }, { ...template, itinerary: [{ day_number: 1, transport_id: -1 }] }, { ...template, itinerary: [{ day_number: 1 }, { day_number: 1 }] }]) {
        await assert.rejects(() => service.saveScheduleTemplate(tour.tour_id, invalid)); assertions++;
      }
      check(((await service.getScheduleTemplate(tour.tour_id)).template as unknown as TourScheduleTemplate).itinerary[0].title === 'Đã sửa mẫu');
      throw rollback;
    }, { timeout: 60000 });
  } catch (error) { if (error !== rollback) throw error; }
  check(await prisma.tour_schedule_templates.count() === before);
  console.log(`Passed ${assertions} template assertions; all fixtures rolled back.`);
}
main().catch(error => { console.error(error instanceof assert.AssertionError ? error.stack : `Template test failed: ${error?.constructor?.name} ${error?.code || ''}`); process.exitCode = 1; }).finally(() => prisma.$disconnect());
