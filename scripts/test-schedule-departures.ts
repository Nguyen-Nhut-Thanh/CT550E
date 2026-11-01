import 'reflect-metadata';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { SchedulesAdminService } from '../apps/api/src/modules/schedules/schedules-admin.service';
import { ToursAdminService } from '../apps/api/src/modules/tours/tours-admin.service';
import { ToursPublicService } from '../apps/api/src/modules/tours/tours-public.service';
import { BookingsService } from '../apps/api/src/modules/bookings/bookings.service';
import { departureId, normalizePickupPoints } from '../apps/api/src/modules/schedules/schedule-departure';

config({ path: resolve(__dirname, '../.env'), quiet: true });
config({ path: resolve(__dirname, '../apps/api/.env'), quiet: true });
const prisma = new PrismaClient();
const rollback = new Error('ROLLBACK_TEST_FIXTURES');
let assertions = 0;
function check(value: unknown) { assert.ok(value); assertions++; }

async function main() {
  assert.throws(() => departureId(null));
  assert.throws(() => departureId(-1));
  assert.throws(() => normalizePickupPoints([{ name: 'A', address: '', pickup_at: 'invalid' }]));
  assertions += 3;
  const before = await prisma.tours.count();
  try {
    await prisma.$transaction(async tx => {
      // Services share this real transaction; every fixture is rolled back at the end.
      const db = new Proxy(tx, { get(target, key) {
        if (key === '$transaction') return (callback: (client: typeof tx) => Promise<unknown>) => callback(tx);
        const value = Reflect.get(target, key);
        return typeof value === 'function' ? value.bind(target) : value;
      } });
      const mail = { sendBookingCreatedEmail: async () => {}, sendScheduleUpdatedEmail: async () => {} };
      const schedules = new SchedulesAdminService(db as never, mail as never);
      // Expected validation failures should not clutter the test output.
      (schedules as any).logger = { error() {} };
      const tours = new ToursAdminService(db as never);
      const publicTours = new ToursPublicService(db as never);
      const bookings = new BookingsService(db as never, mail as never);
      const locations = await tx.locations.findMany({ take: 2, orderBy: { location_id: 'asc' } });
      const transport = await tx.transports.findFirstOrThrow();
      assert.equal(locations.length, 2, 'Tests need at least two existing locations.');
      const key = `TEST-DEPARTURES-${Date.now()}`;
      const tour = await tx.tours.create({ data: {
        code: key, name: key, description: 'Temporary departure test', duration_days: 3,
        duration_nights: 2, departure_location: locations[0].location_id, transport_id: transport.transport_id,
      } });
      const start = new Date(Date.now() + 14 * 86400000);
      start.setUTCHours(1, 0, 0, 0);
      const end = new Date(start.getTime() + 2 * 86400000);
      const payload = { start_date: start.toISOString(), end_date: end.toISOString(), price: 1000000, quota: 10 };
      const first = await schedules.createSchedule(tour.tour_id, payload);
      const firstId = first.tour_schedule_id;
      check((await schedules.findOneSchedule(firstId)).departure_location_id === locations[0].location_id);
      const points = [
        { name: 'Bến xe', address: 'Địa chỉ đón số 1', pickup_at: start.toISOString(), note: 'Có mặt trước 15 phút' },
        { name: 'Văn phòng', address: 'Địa chỉ đón số 2', pickup_at: new Date(start.getTime() + 3600000).toISOString() },
      ];
      const second = await schedules.createSchedule(tour.tour_id, { ...payload, price: 2000000,
        departure_location_id: locations[1].location_id, pickup_points: points });
      let detail = await schedules.findOneSchedule(second.tour_schedule_id);
      check(detail.pickup_points.length === 2 && detail.pickup_points[0].sort_order === 0);
      await tours.update(tour.tour_id, { departure_location: locations[1].location_id });
      check((await schedules.findOneSchedule(firstId)).departure_location_id === locations[0].location_id);
      const third = await schedules.createSchedule(tour.tour_id, { ...payload, status: 0 });
      check((await schedules.findOneSchedule(third.tour_schedule_id)).departure_location_id === locations[1].location_id);
      const result = await publicTours.publicList({ search: key, departure_location: String(locations[1].location_id) });
      check(result.total === 1 && result.items[0].next_schedule?.tour_schedule_id === second.tour_schedule_id);
      check(result.items[0].departure_location?.location_id === locations[1].location_id);
      const wrongPrice = await publicTours.publicList({ search: key, departure_location: String(locations[1].location_id), max_price: '1500000' });
      check(wrongPrice.total === 0); // Price and departure must match the same schedule.
      const publicDetail = await publicTours.publicDetail(tour.tour_id);
      check(publicDetail.tour_schedules.length === 2);
      check(publicDetail.tour_schedules.find(s => s.tour_schedule_id === second.tour_schedule_id)?.pickup_points?.length === 2);
      await schedules.updateSchedule(second.tour_schedule_id, { pickup_points: [...points].reverse() });
      detail = await schedules.findOneSchedule(second.tour_schedule_id);
      check(detail.pickup_points[0].name === 'Văn phòng');
      const account = await tx.accounts.create({ data: { email: `${key}@example.invalid`, users: { create: { full_name: 'Departure test customer' } } }, include: { users: true } });
      const bookingPayload = { user_id: account.users!.user_id, tour_schedule_id: second.tour_schedule_id,
        adult_count: 1, child_count: 0, infant_count: 0, contact_name: 'Test', contact_phone: '0900000000',
        contact_email: `${key}@example.invalid`, travelers: [], payment_method: 'vnpay' };
      await assert.rejects(() => bookings.createBooking(bookingPayload), /điểm đón/); assertions++;
      await assert.rejects(() => bookings.createBooking({ ...bookingPayload, tour_schedule_id: firstId, pickup_point_id: detail.pickup_points[0].pickup_point_id }), /điểm đón/); assertions++;
      const booked = await bookings.createBooking({ ...bookingPayload, pickup_point_id: detail.pickup_points[0].pickup_point_id });
      check(booked.departure_name === locations[1].name);
      check(booked.pickup_snapshot.name === 'Văn phòng' && booked.pickup_snapshot.address === 'Địa chỉ đón số 2');
      check((await schedules.findOneSchedule(second.tour_schedule_id)).booked_count === 1);
      await assert.rejects(() => schedules.updateSchedule(second.tour_schedule_id, { departure_location_id: locations[0].location_id }), /không thể thay đổi/); assertions++;
      await assert.rejects(() => schedules.updateSchedule(second.tour_schedule_id, { pickup_points: [] }), /không thể thay đổi/); assertions++;
      await assert.rejects(() => schedules.updateSchedule(second.tour_schedule_id, { start_date: new Date(start.getTime() + 86400000).toISOString() }), /không thể đổi ngày giờ/); assertions++;
      await schedules.updateSchedule(second.tour_schedule_id, { price: 2100000, pickup_points: [...points].reverse() });
      const finalDetail = await schedules.findOneSchedule(second.tour_schedule_id);
      check(finalDetail.pickup_points[0].pickup_point_id === detail.pickup_points[0].pickup_point_id);
      await tours.update(tour.tour_id, { departure_location: locations[0].location_id });
      check((await schedules.findOneSchedule(second.tour_schedule_id)).departure_location_id === locations[1].location_id);
      const historical = await bookings.getBookingDetail(booked.booking_id, account.users!.user_id);
      check(historical?.departure_name === locations[1].name);
      check((historical?.pickup_snapshot as { name: string }).name === 'Văn phòng');
      throw rollback;
    }, { timeout: 30000 });
  } catch (error) { if (error !== rollback) throw error; }
  check(await prisma.tours.count() === before);
  console.log(`Passed ${assertions} departure/pickup checks. All database fixtures were rolled back.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
