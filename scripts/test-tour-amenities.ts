import 'reflect-metadata';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { ToursAdminService } from '../apps/api/src/modules/tours/tours-admin.service';
import { ToursPublicService } from '../apps/api/src/modules/tours/tours-public.service';
import { normalizeAmenities } from '../apps/api/src/modules/tours/tour-amenities';
import { getTourAmenities } from '../apps/web/lib/tours/amenities';
import type { TourAmenity, TourSchedule } from 'shared';

config({ path: resolve(__dirname, '../.env'), quiet: true });
config({ path: resolve(__dirname, '../apps/api/.env'), quiet: true });
const prisma = new PrismaClient();
const rollback = new Error('ROLLBACK_AMENITY_FIXTURES');
let assertions = 0;
function check(value: unknown) { assert.ok(value); assertions++; }

async function main() {
  const insurance: TourAmenity = { kind: 'insurance', title: 'Bảo hiểm du lịch', content: 'Phạm vi và điều kiện bảo hiểm đã xác nhận.' };
  for (const input of [null, {}, [null], [{ kind: 'invalid', title: 'A', content: 'B' }], [insurance, insurance], [{ ...insurance, title: ' ' }], [{ ...insurance, content: '' }], [{ ...insurance, title: 'A'.repeat(151) }], [{ ...insurance, content: 'A'.repeat(20001) }]]) {
    assert.throws(() => normalizeAmenities(input)); assertions++;
  }
  check(normalizeAmenities([{ ...insurance, amenity_id: 999, tour_id: 999, sort_order: 90 }])[0].sort_order === 0);
  check(normalizeAmenities([{ kind: 'hotel', title: 'Khách sạn', content: '' }]).length === 1);
  check(getTourAmenities([], null).length === 0);
  const before = await prisma.tour_amenities.count();
  try {
    await prisma.$transaction(async tx => {
      const db = new Proxy(tx, { get(target, key) {
        if (key === '$transaction') return (callback: (client: typeof tx) => Promise<unknown>) => callback(tx);
        const value = Reflect.get(target, key);
        return typeof value === 'function' ? value.bind(target) : value;
      } });
      const admin = new ToursAdminService(db as never);
      const publicTours = new ToursPublicService(db as never);
      const key = `AM-${Date.now()}`;
      const province = await tx.locations.findFirstOrThrow({ where: { level_id: 5 } });
      const transport = await tx.transports.findFirstOrThrow();
      const tour = await admin.create({ code: key, name: key, summary: '  Mô tả ngắn trên thẻ tour.  ', description: 'Fixture', duration_days: 2, departure_location: province.location_id, transport_id: transport.transport_id,
        tour_amenities: [insurance, { kind: 'cuisine', title: 'Ẩm thực địa phương', content: 'Bữa sáng và bữa trưa.' }],
      });
      let detail = (await admin.detail(tour.tour_id)).tour;
      check(detail.summary === 'Mô tả ngắn trên thẻ tour.');
      check(detail.tour_amenities.length === 2 && detail.tour_amenities[0].kind === 'insurance');
      await admin.update(tour.tour_id, { description: 'Updated without amenities' });
      check((await admin.detail(tour.tour_id)).tour.summary === 'Mô tả ngắn trên thẻ tour.');
      check((await admin.detail(tour.tour_id)).tour.tour_amenities.length === 2);
      const scheduleIds: number[] = [];
      for (const stars of [4, 3]) {
        const hotel = await tx.hotels.create({ data: { name: `${key}-${stars} sao`, address: `Địa chỉ ${stars}`, description: `Giới thiệu ${stars}`, location_id: province.location_id, star_rating: stars } });
        const room = await tx.hotel_room_types.create({ data: { hotel_id: hotel.hotel_id, name: 'Deluxe' } });
        const schedule = await tx.tour_schedules.create({ data: {
          tour_id: tour.tour_id, departure_location_id: province.location_id,
          tour_schedule_amenities: { create: detail.tour_amenities.map(item => ({
            kind: item.kind, title: item.title, content: item.content, sort_order: item.sort_order, source_amenity_id: item.amenity_id,
          })) },
          start_date: new Date(Date.now() + stars * 86400000), end_date: new Date(Date.now() + (stars + 1) * 86400000), price: 1000000, quota: 10,
          tour_schedule_hotels: { create: { hotel_id: hotel.hotel_id, room_type_id: room.room_type_id, nights: 1, day_from: 1, day_to: 2, note: 'Ghi chú lưu trú' } },
          tour_schedule_transports: { create: { transport_id: transport.transport_id, note: `Xe chuyến ${stars}`, day_from: 1, day_to: 2 } },
        } });
        scheduleIds.push(schedule.tour_schedule_id);
      }
      const pub = await publicTours.publicDetail(tour.tour_id);
      check(pub.summary === 'Mô tả ngắn trên thẻ tour.' && !Object.hasOwn(pub, 'sightseeing_summary'));
      check((await publicTours.publicList({ search: key })).items[0]?.summary === 'Mô tả ngắn trên thẻ tour.');
      await admin.update(tour.tour_id, { summary: null });
      check((await publicTours.publicDetail(tour.tour_id)).summary === null);
      await admin.update(tour.tour_id, { summary: 'Mô tả đã sửa' });
      check((await publicTours.publicDetail(tour.tour_id)).summary === 'Mô tả đã sửa');
      await admin.update(tour.tour_id, { summary: '   ' });
      check((await publicTours.publicDetail(tour.tour_id)).summary === null);
      check(pub.tour_amenities.length === 2);
      const publicAmenities = pub.tour_amenities as TourAmenity[];
      for (const [index, stars] of [4, 3].entries()) {
        const schedule = pub.tour_schedules.find(item => item.tour_schedule_id === scheduleIds[index])!;
        check(!!schedule);
        const items = getTourAmenities(publicAmenities, schedule as unknown as TourSchedule);
        const hotel = items.find(item => item.kind === 'hotel')!;
        check(hotel.title === `Khách sạn ${stars} sao`);
        check(hotel.content.includes(`${key}-${stars} sao`) && hotel.content.includes(`Địa chỉ ${stars}`) && hotel.content.includes('Deluxe') && hotel.content.includes('1 đêm') && hotel.content.includes('Ghi chú lưu trú'));
        check(!hotel.content.includes(`${key}-${stars === 4 ? 3 : 4} sao`));
        check(items.find(item => item.kind === 'transport')?.content.includes(`Xe chuyến ${stars}`));
        check(items.find(item => item.kind === 'insurance')?.content === insurance.content);
        check(items.filter(item => item.kind === 'hotel').length === 1);
      }
      const withNote = getTourAmenities([], { ...pub.tour_schedules[0], tour_schedule_amenities: [{ kind: 'hotel', title: 'Khách sạn', content: 'Ghi chú chung', is_visible: true }] } as unknown as TourSchedule);
      check(withNote.find(item => item.kind === 'hotel')?.content.startsWith('Ghi chú chung\n\n'));
      check(publicAmenities.length === 2); // Resolver must not mutate API data across schedule changes.
      await admin.update(tour.tour_id, { tour_amenities: [{ ...insurance, content: 'Điều kiện mới' }] });
      detail = (await admin.detail(tour.tour_id)).tour;
      check(detail.tour_amenities.length === 1 && detail.tour_amenities[0].content === 'Điều kiện mới');
      await assert.rejects(admin.update(tour.tour_id, { tour_amenities: [insurance, insurance] })); assertions++;
      check((await admin.detail(tour.tour_id)).tour.tour_amenities[0].content === 'Điều kiện mới');
      await admin.update(tour.tour_id, { tour_amenities: [] });
      check((await publicTours.publicDetail(tour.tour_id)).tour_amenities.length === 0);
      await admin.update(tour.tour_id, { tour_amenities: [insurance] });
      await admin.deleteTour(tour.tour_id);
      check(await tx.tour_amenities.count({ where: { tour_id: tour.tour_id } }) === 0);
      throw rollback;
    }, { timeout: 30000 });
  } catch (error) { if (error !== rollback) throw error; }
  check(await prisma.tour_amenities.count() === before);
  console.log(`Passed ${assertions} amenity checks. All fixture data rolled back.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
