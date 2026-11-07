import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { BOOKING_EXTRAS, MEMBERSHIP_TIERS, membershipDiscount, membershipPrice } from 'shared';
import { BookingsService } from '../apps/api/src/modules/bookings/bookings.service';
import { birthdayWindow, bookingPoints, calculateMembership, creditForBooking } from '../apps/api/src/modules/membership/membership.rules';
import { normalizeMembershipTiers } from '../apps/api/src/modules/membership/membership.settings';
import { MembershipService } from '../apps/api/src/modules/membership/membership.service';

async function main() {
  const tiers = normalizeMembershipTiers(MEMBERSHIP_TIERS);
  assert.deepEqual(tiers.map(t => t.tourDiscountPercent), [0, 2, 3, 5, 7]);
  assert.deepEqual(tiers.map(t => t.pointMultiplier), [1, 1.2, 1.5, 2, 3]);
  assert.deepEqual(tiers.map(t => t.birthdayVoucherAmount), [50000, 100000, 200000, 300000, 500000]);
  const legacy = tiers.map(({ tourDiscountPercent, pointMultiplier, birthdayVoucherAmount, serviceDiscountPercent, priorityReservation, ...old }) => old);
  assert.equal(normalizeMembershipTiers(legacy)[2].pointMultiplier, 1.5);
  for (const patch of [{ pointMultiplier: 0 }, { pointMultiplier: 1.25 }, { tourDiscountPercent: 101 }, { birthdayVoucherAmount: -1 }, { serviceDiscountPercent: '10' }, { priorityReservation: 'true' }]) {
    assert.throws(() => normalizeMembershipTiers(tiers.map((t, i) => i === 2 ? { ...t, ...patch } : t)));
  }
  const sample = { ...tiers[2], tourDiscountPercent: 5 };
  const discounts = membershipPrice(sample, 10_000_000, 1_000_000, 500_000);
  assert.equal(discounts.tourDiscount, 475_000);
  assert.equal(discounts.serviceDiscount, 100_000);
  assert.equal(10_000_000 - 500_000 - discounts.tourDiscount, 9_025_000);
  assert.equal(membershipPrice(sample, 100_000, 0, 500_000).tourDiscount, 0);
  assert.equal(membershipDiscount({ discount_type: 'fixed', discount_value: 500_000, min_order_value: 0, max_discount_amount: null }, 100_000), 100_000);
  assert.equal(bookingPoints(1_000_000, { pointMultiplier: 1.2 }), 12);
  assert.equal(bookingPoints(900_000, { pointMultiplier: 1.2 }), 10);
  assert.equal(bookingPoints(1_000_000, null), 10);
  const birthday = new Date('2000-02-29T00:00:00Z');
  assert.equal(birthdayWindow(birthday, new Date('2027-01-31T16:59:59Z')), null);
  assert.equal(birthdayWindow(birthday, new Date('2027-01-31T17:00:00Z'))?.end.toISOString(), '2027-02-28T17:00:00.000Z');
  assert.equal(birthdayWindow(birthday, new Date('2027-02-28T17:00:00Z')), null);
  assert.equal(birthdayWindow(null, new Date()), null);
  const now = new Date('2026-11-15T00:00:00Z');
  const booking = { booking_id: 1, status: 'paid', total_amount: 1_000_000, tour_schedules: { end_date: new Date('2026-11-01T00:00:00Z'), tours: { name: 'Tour test' } }, payments: [{ status: 'completed', amount: 1_000_000, paid_at: new Date('2026-10-01'), created_at: new Date('2026-10-01') }], membership_snapshot: { pointMultiplier: 1.5 } };
  assert.equal(creditForBooking(booking, now)?.points, 15);
  assert.equal(creditForBooking({ ...booking, status: 'cancelled' }, now), null);
  assert.equal(creditForBooking({ ...booking, payments: [...booking.payments, { ...booking.payments[0], status: 'refunded', amount: 200_000 }] }, now)?.points, 12);
  const state = calculateMembership(null, [{ bookingId: 1, tourName: 'Test', completedAt: new Date('2026-11-01'), amount: 5_000_000, points: 150 }], now, tiers);
  assert.equal(state.tier.id, 'silver'); // Reward points do not change spending thresholds.
  console.log('PASS: defaults, legacy configuration, invalid settings, voucher-first pricing, points/refunds, birthday boundaries, spending-based rank.');

  if (!process.argv.includes('--database')) return;
  config({ path: '.env', quiet: true });
  const prisma = new PrismaClient();
  const rollback = new Error('ROLLBACK_MEMBERSHIP_TEST');
  const email = `membership-test-${randomUUID()}@example.invalid`;
  try {
    await prisma.$transaction(async tx => {
      const user = await tx.users.create({ data: { full_name: 'Membership integration test', birthday: new Date('2000-11-20'), accounts: { create: { email, password_hash: 'test-only-not-a-real-password' } } } });
      const scoped = new Proxy(tx, { get(target, key) { if (key === '$transaction') return (callback: (client: typeof tx) => unknown) => callback(tx); const value = Reflect.get(target, key); return typeof value === 'function' ? value.bind(target) : value; } });
      const service = new MembershipService(scoped as never);
      const first = await service.syncUser(user.user_id, now);
      assert.equal(first.tier.id, 'bronze');
      const birthdayVoucher = first.vouchers.find(voucher => voucher.code.startsWith('BD-'))!;
      assert.ok(birthdayVoucher);
      assert.equal(birthdayVoucher.discount_value, 50_000);
      assert.equal(birthdayVoucher.expiry_date, '2026-11-30T16:59:59.999Z');
      await service.syncUser(user.user_id, now);
      assert.equal(await tx.vouchers.count({ where: { owner_user_id: user.user_id } }), 1);
      assert.equal(await tx.membership_notifications.count({ where: { user_id: user.user_id } }), 1);
      const next = normalizeMembershipTiers(tiers.map((t, i) => i === 0 ? { ...t, birthdayVoucherAmount: 70_000 } : t));
      await service.updateSettings(next);
      const again = await service.syncUser(user.user_id, now);
      assert.equal(again.vouchers.find(voucher => voucher.voucher_id === birthdayVoucher.voucher_id)?.discount_value, 50_000); // Issued voucher terms are immutable.
      const list = await service.adminList(1, email, 'bronze');
      assert.equal(list.items.length, 1);
      assert.equal(list.items[0].bookingCount, 0);
      assert.equal((await service.adminList(1, String(user.user_id), 'bronze')).items.some(item => item.userId === user.user_id), true);
      assert.equal((await service.adminList(1, email, 'gold')).total, 0);
      const schedules = await tx.tour_schedules.findMany({ where: { status: 1, tours: { status: 1 } }, include: { tour_schedule_prices: true, pickup_points: true }, take: 100 });
      const schedule = schedules.find(s => s.quota > s.booked_count && Number(s.tour_schedule_prices.find(p => p.passenger_type === 'ADULT')?.price ?? s.price) > 0);
      assert.ok(schedule, 'Cần một lịch tour hoạt động còn chỗ để kiểm thử tạo booking.');
      const subtotal = Number(schedule.tour_schedule_prices.find(p => p.passenger_type === 'ADULT')?.price ?? schedule.price);
      const voucherCode = 'TEST-' + randomUUID().slice(0, 12).toUpperCase();
      const voucher = await tx.vouchers.create({ data: { code: voucherCode, owner_user_id: user.user_id, discount_type: 'fixed', discount_value: 500_000, usage_limit: 1, start_date: new Date(Date.now() - 86400_000), expiry_date: new Date(Date.now() + 86400_000) } });
      const bookingService = new BookingsService(scoped as never, { sendBookingCreatedEmail: async () => undefined } as never, { syncUser: async () => ({ tier: sample }) } as never);
      const before = schedule.booked_count;
      const bookingResult = await bookingService.createBooking({ user_id: user.user_id, tour_schedule_id: schedule.tour_schedule_id, pickup_point_id: schedule.pickup_points[0]?.pickup_point_id, adult_count: 1, child_count: 0, infant_count: 0, contact_name: 'Test', contact_phone: '0900000000', contact_email: email, payment_method: 'vnpay', travelers: [], voucher_code: voucherCode, additional_service_ids: [BOOKING_EXTRAS[0].id] });
      const services = BOOKING_EXTRAS[0].unit_price;
      const voucherAmount = Math.min(subtotal, 500_000);
      const expectedDiscounts = membershipPrice(sample, subtotal, services, voucherAmount);
      assert.equal(Number(bookingResult.total_amount), subtotal + services - voucherAmount - expectedDiscounts.tourDiscount - expectedDiscounts.serviceDiscount);
      assert.equal(bookingResult.membership_snapshot.pointMultiplier, 1.5);
      assert.equal(bookingResult.membership_snapshot.priorityReservation, true);
      assert.equal((await tx.vouchers.findUniqueOrThrow({ where: { voucher_id: voucher.voucher_id } })).used_count, 1);
      assert.equal((await tx.tour_schedules.findUniqueOrThrow({ where: { tour_schedule_id: schedule.tour_schedule_id } })).booked_count, before + 1);
      throw rollback;
    }, { timeout: 30_000 });
  } catch (error) { if (error !== rollback) throw error; }
  finally { await prisma.$disconnect(); }
  console.log('PASS: database voucher issuance, duplicate prevention, immutable voucher terms, search/filters, booking totals/snapshot, voucher consumption and seat reservation; all fixture changes rolled back.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
