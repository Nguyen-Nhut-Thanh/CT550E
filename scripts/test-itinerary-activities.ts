import 'reflect-metadata';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { SchedulesAdminService } from '../apps/api/src/modules/schedules/schedules-admin.service';
import { ToursPublicService } from '../apps/api/src/modules/tours/tours-public.service';
import { ToursAdminService } from '../apps/api/src/modules/tours/tours-admin.service';
import { LocationsAdminService } from '../apps/api/src/modules/locations/locations-admin.service';
import { normalizeActivities } from '../apps/api/src/modules/schedules/itinerary-activities';

config({ path: resolve(__dirname, '../.env'), quiet: true });
config({ path: resolve(__dirname, '../apps/api/.env'), quiet: true });
const prisma = new PrismaClient();
const rollback = new Error('ROLLBACK_ITINERARY_FIXTURES');
let assertions = 0;
function check(value: unknown) { assert.ok(value); assertions++; }

async function main() {
  for (const value of [null, {}, [null], [{ time: '24:00', title: 'Invalid' }], [{ time: '08:70', title: 'Invalid' }], [{ time: '08:00', title: ' ' }], [{ time: '08:00', title: 'A', location_id: -1 }]]) {
    assert.throws(() => normalizeActivities(value)); assertions++;
  }
  check(normalizeActivities([{ time: '18:00', title: 'Later' }, { time: '05:30', title: 'Earlier' }])[0].title === 'Earlier');
  const before = await prisma.itinerary_activities.count();
  const attractionsBefore = await prisma.tour_schedule_attractions.count();
  const transportsBefore = await prisma.tour_schedule_transports.count();
  try {
    await prisma.$transaction(async tx => {
      let savepointNumber = 0;
      const db = new Proxy(tx, { get(target, key) {
        if (key === '$transaction') return async (callback: (client: typeof tx) => Promise<unknown>) => {
          const name = `itinerary_test_${++savepointNumber}`;
          await tx.$executeRawUnsafe(`SAVEPOINT ${name}`);
          try {
            const result = await callback(tx);
            await tx.$executeRawUnsafe(`RELEASE SAVEPOINT ${name}`);
            return result;
          } catch (error) {
            await tx.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT ${name}`);
            await tx.$executeRawUnsafe(`RELEASE SAVEPOINT ${name}`);
            throw error;
          }
        };
        const value = Reflect.get(target, key);
        return typeof value === 'function' ? value.bind(target) : value;
      } });
      const schedules = new SchedulesAdminService(db as never, {} as never);
      (schedules as any).logger = { error() {} };
      const tours = new ToursAdminService(db as never);
      const publicTours = new ToursPublicService(db as never);
      const locationService = new LocationsAdminService(db as never);
      const key = `TI-${Date.now()}`;
      const province = await tx.locations.create({ data: { name: `${key}-City`, slug: `${key}-city`, level_id: 5, location_type: 'province_state' } });
      const outsideProvince = await tx.locations.create({ data: { name: `${key}-OutsideCity`, slug: `${key}-outside-city`, level_id: 5, location_type: 'province_state' } });
      const createAttraction = (name: string, parent_id: number) => tx.locations.create({ data: {
        name: `${key}-${name}`, slug: `${key}-${name}`, level_id: 6, location_type: 'attraction', parent_id,
        note: `Giới thiệu ${name}`, location_images: { create: { image_url: '/images/tours/itinerary-landscape.jpg', is_cover: 1 } },
      } });
      const first = await createAttraction('First', province.location_id);
      const unselected = await createAttraction('Unselected', province.location_id);
      const outside = await createAttraction('Outside', outsideProvince.location_id);
      const standalone = await createAttraction('Standalone', province.location_id);
      const transport = await tx.transports.findFirstOrThrow();
      const tour = await tours.create({ code: key, name: key, description: 'Test', duration_days: 2, duration_nights: 1, departure_location: province.location_id, transport_id: transport.transport_id, destinations: [province.location_id] });
      const payload = { start_date: new Date(Date.now() + 14 * 86400000).toISOString(), end_date: new Date(Date.now() + 15 * 86400000).toISOString(), price: 1000000, quota: 10 };
      const activity = { time: '05:30', title: 'Tham quan', description: 'Đi thuyền', location_id: first.location_id };
      const schedule = await schedules.createSchedule(tour.tour_id, { ...payload, attraction_ids: [first.location_id, first.location_id], itinerary: [{ day_number: 1, title: 'Ngày khám phá', content: 'Ghi chú ngày', activities: [
        { time: '11:30', title: 'Ăn trưa', description: 'Nhà hàng', location_id: null }, activity,
      ] }, { day_number: 2, title: 'Ngày về', content: 'Nội dung cũ' }] });
      let detail = await schedules.findOneSchedule(schedule.tour_schedule_id);
      check(detail.tour_itineraries[0].activities[0].time === '05:30');
      check(detail.tour_schedule_attractions.length === 1 && detail.tour_schedule_attractions[0].location_id === first.location_id);
      check(detail.tour_itineraries[0].activities[1].location_id === null);
      check(detail.tour_itineraries[1].content === 'Nội dung cũ' && detail.tour_itineraries[1].activities.length === 0);
      const second = await schedules.createSchedule(tour.tour_id, { ...payload, itinerary: [{ day_number: 1, activities: [{ ...activity, location_id: unselected.location_id }] }] });
      const alternateTransport = await tx.transports.create({ data: { name: `${key}-Boat`, provider_id: transport.provider_id, transport_type: 'boat' } });
      const dailyTransportSchedule = await schedules.createSchedule(tour.tour_id, { ...payload, itinerary: [
        { day_number: 1, title: 'Đi đường bộ', transport_id: transport.transport_id },
        { day_number: 2, title: 'Đi thuyền', transport_id: String(alternateTransport.transport_id) },
      ] });
      const transportScheduleId = dailyTransportSchedule.tour_schedule_id;
      let transportDetail = await schedules.findOneSchedule(transportScheduleId);
      check(transportDetail.duration_days === 2);
      assert.deepEqual(transportDetail.tour_schedule_transports.map(row => [row.day_from, row.day_to, row.transport_id]), [[1, 1, transport.transport_id], [2, 2, alternateTransport.transport_id]]); assertions++;
      const publicTransportSchedule = (await publicTours.publicDetail(tour.tour_id)).tour_schedules.find(item => item.tour_schedule_id === transportScheduleId)!;
      check(publicTransportSchedule.tour_schedule_transports.length === 2 && publicTransportSchedule.tour_schedule_transports[1].transports.name === alternateTransport.name);
      await schedules.updateSchedule(transportScheduleId, { itinerary: [{ day_number: 1, transport_id: null }, { day_number: 2 }] });
      transportDetail = await schedules.findOneSchedule(transportScheduleId);
      check(transportDetail.tour_schedule_transports.length === 1 && transportDetail.tour_schedule_transports[0].day_from === 2 && transportDetail.tour_schedule_transports[0].transport_id === alternateTransport.transport_id);
      await schedules.updateSchedule(transportScheduleId, { price: 1200000 });
      check((await schedules.findOneSchedule(transportScheduleId)).tour_schedule_transports.length === 1);
      for (const transport_id of [-1, 0, 'abc', false, {}, [transport.transport_id]]) {
        await assert.rejects(() => schedules.updateSchedule(transportScheduleId, { itinerary: [{ day_number: 1, title: 'Must rollback', transport_id }] } as never)); assertions++;
      }
      const unknownId = (await tx.transports.aggregate({ _max: { transport_id: true } }))._max.transport_id! + 1;
      await assert.rejects(() => schedules.updateSchedule(transportScheduleId, { itinerary: [{ day_number: 1, title: 'Must rollback', transport_id: unknownId }] })); assertions++;
      transportDetail = await schedules.findOneSchedule(transportScheduleId);
      check(transportDetail.tour_itineraries[0].title !== 'Must rollback' && transportDetail.tour_schedule_transports[0].transport_id === alternateTransport.transport_id);
      await schedules.updateSchedule(transportScheduleId, { itinerary: [{ day_number: 1, transport_id: '' }, { day_number: 2, transport_id: null }] });
      check((await schedules.findOneSchedule(transportScheduleId)).tour_schedule_transports.length === 0);
      check((await schedules.findOneSchedule(schedule.tour_schedule_id)).tour_schedule_transports.length === 0);
      await tx.tour_schedule_transports.create({ data: { tour_schedule_id: transportScheduleId, transport_id: transport.transport_id, transport_role: 'main', note: 'Legacy note' } });
      const transfer = await tx.tour_schedule_transports.create({ data: { tour_schedule_id: transportScheduleId, transport_id: alternateTransport.transport_id, transport_role: 'transfer', day_from: 1, day_to: 1, note: 'Auxiliary transport' } });
      await schedules.updateSchedule(transportScheduleId, { itinerary: [{ day_number: 1, transport_id: null }, { day_number: 2 }] });
      transportDetail = await schedules.findOneSchedule(transportScheduleId);
      const mainTransport = transportDetail.tour_schedule_transports.filter(row => row.transport_role === 'main');
      check(mainTransport.length === 1 && mainTransport[0].day_from === 2 && mainTransport[0].day_to === 2 && mainTransport[0].note === 'Legacy note');
      check(transportDetail.tour_schedule_transports.some(row => row.schedule_transport_id === transfer.schedule_transport_id && row.note === 'Auxiliary transport'));
      await schedules.updateSchedule(transportScheduleId, { itinerary: [{ day_number: 1, transport_id: transport.transport_id }, { day_number: 2, transport_id: transport.transport_id }] });
      await schedules.updateSchedule(transportScheduleId, { itinerary: [{ day_number: 1, transport_id: transport.transport_id }, { day_number: 2, transport_id: transport.transport_id }] });
      check((await schedules.findOneSchedule(transportScheduleId)).tour_schedule_transports.filter(row => row.transport_role === 'main').length === 2);
      await schedules.updateSchedule(transportScheduleId, { itinerary: [] });
      transportDetail = await schedules.findOneSchedule(transportScheduleId);
      check(transportDetail.tour_itineraries.length === 0 && transportDetail.tour_schedule_transports.length === 1 && transportDetail.tour_schedule_transports[0].transport_role === 'transfer');
      await schedules.deleteSchedule(transportScheduleId);
      check(await tx.tour_schedule_transports.count({ where: { tour_schedule_id: transportScheduleId } }) === 0);
      const publicDetail = await publicTours.publicDetail(tour.tour_id);
      const publicDay = publicDetail.tour_schedules.find(item => item.tour_schedule_id === schedule.tour_schedule_id)!.tour_itineraries![0];
      check(publicDay.activities?.length === 2);
      const publicAttractions = publicDetail.tour_schedules.find(item => item.tour_schedule_id === schedule.tour_schedule_id)!.tour_schedule_attractions;
      check(publicAttractions.length === 1 && publicAttractions[0].location?.note === 'Giới thiệu First');
      check(publicAttractions[0].location?.location_images[0].image_url === '/images/tours/itinerary-landscape.jpg');
      check(publicDay.activities?.[0].location?.parent_id === province.location_id);
      check(publicDay.activities?.[0].location?.note === 'Giới thiệu First');
      check(publicDay.activities?.[0].location?.location_images?.[0].image_url === '/images/tours/itinerary-landscape.jpg');
      check(!publicDay.activities?.some(item => item.location_id === unselected.location_id));
      check(publicDetail.tour_schedules.find(item => item.tour_schedule_id === second.tour_schedule_id)?.tour_itineraries?.[0].activities?.[0].location_id === unselected.location_id);
      await schedules.updateSchedule(schedule.tour_schedule_id, { itinerary: [{ day_number: 1, title: 'Đổi ghi chú', content: 'Cập nhật' }] });
      detail = await schedules.findOneSchedule(schedule.tour_schedule_id);
      check(detail.tour_itineraries[0].activities.length === 2); // Older clients preserve activities when omitted.
      check(detail.tour_schedule_attractions.length === 1); // Omitted list also preserves independent selections.
      for (const attraction_ids of [[outside.location_id], [province.location_id], [-1], ['1'], null]) {
        await assert.rejects(() => schedules.updateSchedule(schedule.tour_schedule_id, { attraction_ids } as never)); assertions++;
      }
      check((await schedules.findOneSchedule(schedule.tour_schedule_id)).tour_schedule_attractions[0].location_id === first.location_id);
      const independent = await schedules.createSchedule(tour.tour_id, { ...payload, attraction_ids: [standalone.location_id] });
      const independentDetail = await schedules.findOneSchedule(independent.tour_schedule_id);
      check(independentDetail.tour_itineraries.length === 0 && independentDetail.tour_schedule_attractions.length === 1);
      const publicIndependent = (await publicTours.publicDetail(tour.tour_id)).tour_schedules.find(item => item.tour_schedule_id === independent.tour_schedule_id)!;
      check(publicIndependent.tour_schedule_attractions[0].location?.name === standalone.name && publicIndependent.tour_itineraries.length === 0);
      const standaloneUsage = (await locationService.findOne(standalone.location_id))!.usage_summary;
      check(!standaloneUsage.can_delete && !standaloneUsage.can_change_structure && standaloneUsage.schedule_attractions_count === 1 && standaloneUsage.itinerary_activities_count === 0);
      await assert.rejects(() => locationService.remove(standalone.location_id)); assertions++;
      await assert.rejects(() => tours.update(tour.tour_id, { destinations: [] }), /được chọn cho chuyến/); assertions++;
      await assert.rejects(() => schedules.updateSchedule(schedule.tour_schedule_id, { itinerary: [{ day_number: 1, activities: [{ ...activity, location_id: outside.location_id }] }] })); assertions++;
      await assert.rejects(() => schedules.updateSchedule(schedule.tour_schedule_id, { itinerary: [{ day_number: 1, activities: [{ ...activity, location_id: province.location_id }] }] })); assertions++;
      await assert.rejects(() => schedules.updateSchedule(schedule.tour_schedule_id, { itinerary: [{ day_number: 3, activities: [] }] })); assertions++;
      await assert.rejects(() => schedules.updateSchedule(schedule.tour_schedule_id, { itinerary: [{ day_number: 1 }, { day_number: 1 }] })); assertions++;
      check((await schedules.findOneSchedule(schedule.tour_schedule_id)).tour_itineraries[0].activities.length === 2);
      await assert.rejects(() => tours.update(tour.tour_id, { destinations: [] })); assertions++;
      await assert.rejects(() => locationService.remove(first.location_id)); assertions++;
      const usage = (await locationService.findOne(first.location_id))!.usage_summary;
      check(!usage.can_change_structure && usage.itinerary_activities_count === 1);
      await schedules.updateSchedule(schedule.tour_schedule_id, { itinerary: [{ day_number: 1, activities: [] }] });
      check((await schedules.findOneSchedule(schedule.tour_schedule_id)).tour_itineraries[0].activities.length === 0);
      check((await schedules.findOneSchedule(schedule.tour_schedule_id)).tour_schedule_attractions.length === 1);
      await schedules.updateSchedule(schedule.tour_schedule_id, { attraction_ids: [] });
      await schedules.updateSchedule(schedule.tour_schedule_id, { itinerary: [{ day_number: 1, activities: [activity] }] });
      check((await schedules.findOneSchedule(schedule.tour_schedule_id)).tour_schedule_attractions.length === 0);
      check((await publicTours.publicDetail(tour.tour_id)).tour_schedules.find(item => item.tour_schedule_id === schedule.tour_schedule_id)!.tour_schedule_attractions.length === 0);
      await schedules.deleteSchedule(independent.tour_schedule_id);
      check(await tx.tour_schedule_attractions.count({ where: { tour_schedule_id: independent.tour_schedule_id } }) === 0);
      throw rollback;
    }, { timeout: 60000 });
  } catch (error) { if (error !== rollback) throw error; }
  check(await prisma.itinerary_activities.count() === before);
  check(await prisma.tour_schedule_attractions.count() === attractionsBefore);
  check(await prisma.tour_schedule_transports.count() === transportsBefore);
  console.log(`Passed ${assertions} itinerary assertions; all fixtures rolled back.`);
}
main().catch(error => {
  if (error instanceof assert.AssertionError) console.error(error.stack);
  console.error('Itinerary test failed:', error instanceof assert.AssertionError ? error.message : error?.constructor?.name, error?.code || '', error?.meta?.modelName || '', error?.meta?.constraint || '');
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
