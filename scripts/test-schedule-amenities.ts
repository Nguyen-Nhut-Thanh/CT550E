import 'reflect-metadata';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { copyTourAmenities, type TourAmenity, type ScheduleAmenity, type TourSchedule } from 'shared';
import { ToursAdminService } from '../apps/api/src/modules/tours/tours-admin.service';
import { ToursPublicService } from '../apps/api/src/modules/tours/tours-public.service';
import { SchedulesAdminService } from '../apps/api/src/modules/schedules/schedules-admin.service';
import { FlashDealsService } from '../apps/api/src/modules/flash-deals/flash-deals.service';
import { ChatService } from '../apps/api/src/modules/chat/chat.service';
import { getTourAmenities } from '../apps/web/lib/tours/amenities';

config({ path: resolve(__dirname, '../.env'), quiet: true });
config({ path: resolve(__dirname, '../apps/api/.env'), quiet: true });
const prisma = new PrismaClient();
const rollback = new Error('ROLLBACK_SCHEDULE_AMENITIES');
let checks = 0;
function check(value: unknown) { assert.ok(value); checks++; }
const template = (version: number): TourAmenity[] => [
  { kind: 'insurance', title: 'Bảo hiểm du lịch', content: `Điều khoản bảo hiểm ${version}` },
  { kind: 'cuisine', title: 'Ẩm thực', content: `Bữa ăn ${version}` },
  { kind: 'promotion', title: 'Khuyến mãi', content: `Ưu đãi ${version}` },
];

async function main() {
  const before = await prisma.tour_schedule_amenities.count();
  try {
    await prisma.$transaction(async tx => {
      const db = new Proxy(tx, { get(target, key) {
        if (key === '$transaction') return (callback: (client: typeof tx) => Promise<unknown>) => callback(tx);
        const value = Reflect.get(target, key);
        return typeof value === 'function' ? value.bind(target) : value;
      } });
      const tours = new ToursAdminService(db as never);
      const schedules = new SchedulesAdminService(db as never, { sendScheduleUpdatedEmail: () => { throw Error('Unexpected mail'); } } as never);
      (schedules as any).logger = { error() {} };
      const publicTours = new ToursPublicService(db as never);
      const deals = new FlashDealsService(db as never);
      const chat = new ChatService(db as never, {} as never);
      const province = await tx.locations.findFirstOrThrow({ where: { level_id: 5 } });
      const transport = await tx.transports.findFirstOrThrow();
      const key = `SA-${Date.now()}`;
      const tour = await tours.create({ code: key, name: key, description: 'Fixture', duration_days: 2, departure_location: province.location_id, transport_id: transport.transport_id, tour_amenities: template(1) });
      const payload = { start_date: new Date(Date.now() + 14 * 86400000).toISOString(), end_date: new Date(Date.now() + 15 * 86400000).toISOString(), price: 1000000, quota: 10 };
      const create = () => schedules.createSchedule(tour.tour_id, payload);
      const a = (await create())!;
      const b = (await create())!;
      const read = (id: number) => schedules.findOneSchedule(id);
      const contents = (rows: Array<{ content: string }>) => rows.map(item => item.content).join('|');
      check(a.use_tour_amenities && a.tour_schedule_amenities.length === 3);
      check(contents(a.tour_schedule_amenities) === contents(b.tour_schedule_amenities));
      check(a.tour_schedule_amenities.every(item => !!item.source_amenity_id));
      const rowIds = a.tour_schedule_amenities.map(item => item.schedule_amenity_id);
      await schedules.updateSchedule(a.tour_schedule_id, { use_tour_amenities: false });
      let detail = await read(a.tour_schedule_id);
      check(!detail.use_tour_amenities && JSON.stringify(detail.tour_schedule_amenities.map(item => item.schedule_amenity_id)) === JSON.stringify(rowIds));
      const custom = copyTourAmenities(template(1));
      custom[0].content = 'Bảo hiểm riêng chuyến A';
      custom.push({ kind: 'hotel', title: 'Khách sạn 5 sao', content: '', is_visible: false });
      custom.push({ kind: 'transport', title: 'Xe', content: '', is_visible: false });
      await schedules.updateSchedule(a.tour_schedule_id, { use_tour_amenities: false, tour_schedule_amenities: custom });
      check((await read(a.tour_schedule_id)).tour_schedule_amenities[0].content === 'Bảo hiểm riêng chuyến A');
      check((await read(b.tour_schedule_id)).tour_schedule_amenities[0].content === template(1)[0].content);
      await tours.update(tour.tour_id, { tour_amenities: template(2) });
      check((await read(a.tour_schedule_id)).tour_schedule_amenities[0].content === 'Bảo hiểm riêng chuyến A');
      check((await read(b.tour_schedule_id)).tour_schedule_amenities[0].content === template(1)[0].content);
      check((await read(b.tour_schedule_id)).tour_schedule_amenities.every(item => item.source_amenity_id === null));
      await schedules.updateSchedule(b.tour_schedule_id, { use_tour_amenities: true, copy_tour_amenities: false, quota: 11 });
      check((await read(b.tour_schedule_id)).tour_schedule_amenities[0].content === template(1)[0].content);
      const c = (await create())!;
      check(c.tour_schedule_amenities[0].content === template(2)[0].content);
      await schedules.updateSchedule(a.tour_schedule_id, { use_tour_amenities: true });
      detail = await read(a.tour_schedule_id);
      check(detail.use_tour_amenities && detail.tour_schedule_amenities.length === 3 && detail.tour_schedule_amenities[0].content === template(2)[0].content);
      await schedules.updateSchedule(b.tour_schedule_id, { use_tour_amenities: true, copy_tour_amenities: true });
      check((await read(b.tour_schedule_id)).tour_schedule_amenities[0].content === template(2)[0].content);

      const editedCopy = copyTourAmenities(template(2));
      editedCopy[1].content = 'Bữa ăn riêng chuyến D';
      editedCopy[2].content = 'Ưu đãi riêng chuyến D';
      const d = (await schedules.createSchedule(tour.tour_id, { ...payload, use_tour_amenities: false, tour_schedule_amenities: editedCopy }))!;
      check(!d.use_tour_amenities && d.tour_schedule_amenities[1].content === 'Bữa ăn riêng chuyến D');
      const empty = (await schedules.createSchedule(tour.tour_id, { ...payload, use_tour_amenities: false, tour_schedule_amenities: [] }))!;
      check(empty.tour_schedule_amenities.length === 0);
      let pub = await publicTours.publicDetail(tour.tour_id);
      const emptyPublic = pub.tour_schedules.find(item => item.tour_schedule_id === empty.tour_schedule_id)!;
      check(getTourAmenities(pub.tour_amenities as TourAmenity[], emptyPublic as unknown as TourSchedule).length === 0);
      const dPublic = pub.tour_schedules.find(item => item.tour_schedule_id === d.tour_schedule_id)!;
      check(dPublic.tour_schedule_amenities?.find(item => item.kind === 'cuisine')?.content === 'Bữa ăn riêng chuyến D');
      await assert.rejects(schedules.updateSchedule(d.tour_schedule_id, { use_tour_amenities: false, copy_tour_amenities: true })); checks++;
      await assert.rejects(schedules.updateSchedule(d.tour_schedule_id, { use_tour_amenities: true, tour_schedule_amenities: editedCopy })); checks++;
      await assert.rejects(schedules.updateSchedule(d.tour_schedule_id, { use_tour_amenities: false, tour_schedule_amenities: [editedCopy[0], editedCopy[0]] })); checks++;
      await assert.rejects(schedules.updateSchedule(d.tour_schedule_id, { use_tour_amenities: 'false' as never })); checks++;
      await assert.rejects(schedules.updateSchedule(d.tour_schedule_id, { use_tour_amenities: false, tour_schedule_amenities: [{ ...editedCopy[0], is_visible: 'false' as never }] })); checks++;
      check((await read(d.tour_schedule_id)).tour_schedule_amenities[1].content === 'Bữa ăn riêng chuyến D');

      const hotel = await tx.hotels.create({ data: { name: key, address: 'Địa chỉ mẫu', location_id: province.location_id, star_rating: 3 } });
      const room = await tx.hotel_room_types.create({ data: { hotel_id: hotel.hotel_id, name: 'Standard' } });
      await tx.tour_schedule_hotels.create({ data: { tour_schedule_id: d.tour_schedule_id, hotel_id: hotel.hotel_id, room_type_id: room.room_type_id, nights: 1 } });
      await tx.tour_schedule_transports.create({ data: { tour_schedule_id: d.tour_schedule_id, transport_id: transport.transport_id } });
      const hidden: ScheduleAmenity[] = [{ kind: 'hotel', title: 'Khách sạn 5 sao', content: '', is_visible: false }, { kind: 'transport', title: 'Xe', content: '', is_visible: false }];
      await schedules.updateSchedule(d.tour_schedule_id, { tour_schedule_amenities: [...editedCopy, ...hidden] });
      pub = await publicTours.publicDetail(tour.tour_id);
      const withHotel = pub.tour_schedules.find(item => item.tour_schedule_id === d.tour_schedule_id)!;
      check(!getTourAmenities([], withHotel as unknown as TourSchedule).some(item => item.kind === 'hotel' || item.kind === 'transport'));
      const visible = getTourAmenities([], { ...withHotel, tour_schedule_amenities: [{ ...hidden[0], is_visible: true }] } as unknown as TourSchedule);
      check(visible.find(item => item.kind === 'hotel')?.title === 'Khách sạn 3 sao');
      check(visible.find(item => item.kind === 'hotel')?.content.includes(hotel.name));

      const deal = await tx.flash_deals.create({ data: { tour_schedule_id: d.tour_schedule_id, discount_type: 'percentage', discount_value: 10, start_date: new Date(Date.now() - 60000), end_date: new Date(payload.start_date) } });
      check((await deals.getFlashDeals(10000)).items.find(item => item.deal_id === deal.deal_id)?.promotion_info === 'Ưu đãi riêng chuyến D');
      await tx.tour_schedule_amenities.update({ where: { tour_schedule_id_kind: { tour_schedule_id: d.tour_schedule_id, kind: 'promotion' } }, data: { is_visible: false } });
      check((await deals.getFlashDeals(10000)).items.find(item => item.deal_id === deal.deal_id)?.promotion_info === null);
      // Make D the first available trip so chat context must use its saved content.
      await tx.tour_schedules.updateMany({ where: { tour_id: tour.tour_id, tour_schedule_id: { not: d.tour_schedule_id } }, data: { status: 0 } });
      const context = await (chat as any).context({ tour_id: tour.tour_id }, 0);
      check(context.meals === 'Bữa ăn riêng chuyến D' && !context.hotel && !context.transport);

      const user = await tx.users.findFirstOrThrow();
      const booking = await tx.bookings.create({ data: { user_id: user.user_id, tour_schedule_id: d.tour_schedule_id, contact_name: 'Fixture', contact_phone: '0000000000', contact_email: 'fixture@example.test', status: 'cancelled' } });
      detail = await read(d.tour_schedule_id);
      check(detail.hasBookings);
      const saved = detail.tour_schedule_amenities as ScheduleAmenity[];
      await schedules.updateSchedule(d.tour_schedule_id, { use_tour_amenities: false, tour_schedule_amenities: saved, cover_image_url: '/fixture.jpg' });
      check((await read(d.tour_schedule_id)).cover_image_url === '/fixture.jpg');
      await assert.rejects(schedules.updateSchedule(d.tour_schedule_id, { use_tour_amenities: true, copy_tour_amenities: true, quota: 99 })); checks++;
      check((await read(d.tour_schedule_id)).quota === 10);
      await assert.rejects(schedules.updateSchedule(d.tour_schedule_id, { use_tour_amenities: false, tour_schedule_amenities: saved.map(item => ({ ...item, content: 'Thay đổi không được phép' })) })); checks++;
      await tx.bookings.delete({ where: { booking_id: booking.booking_id } });
      await schedules.deleteSchedule(d.tour_schedule_id);
      check(await tx.tour_schedule_amenities.count({ where: { tour_schedule_id: d.tour_schedule_id } }) === 0);
      await schedules.updateSchedule(empty.tour_schedule_id, { use_tour_amenities: true });
      check((await read(empty.tour_schedule_id)).tour_schedule_amenities.length === 3);
      throw rollback;
    }, { timeout: 60000 });
  } catch (error) { if (error !== rollback) throw error; }
  check(await prisma.tour_schedule_amenities.count() === before);
  console.log(`Passed ${checks} schedule amenity checks. All fixtures rolled back.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
