import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { MEMBERSHIP_TIERS, voucherAudienceAllows, voucherAudienceLabel } from 'shared';
import { VouchersService } from '../apps/api/src/modules/vouchers/vouchers.service';
import { MembershipService } from '../apps/api/src/modules/membership/membership.service';
import { BookingsService } from '../apps/api/src/modules/bookings/bookings.service';

async function main() {
    assert.equal(voucherAudienceAllows([], null), true);
    assert.equal(voucherAudienceAllows(['gold'], null), false);
    assert.equal(voucherAudienceAllows(['gold'], 'silver'), false);
    assert.equal(voucherAudienceAllows(['gold'], 'platinum'), false);
    assert.equal(voucherAudienceAllows(['gold', 'platinum'], 'platinum'), true);
    assert.equal(voucherAudienceLabel([]), 'Tất cả khách hàng');
    assert.match(voucherAudienceLabel(['gold', 'platinum']), /Vàng.*Bạch kim/);
    console.log('PASS: public, exact-tier and multi-tier voucher eligibility.');
    if (!process.argv.includes('--database')) return;
    config({ path: '.env', quiet: true });
    const prisma = new PrismaClient();
    const rollback = new Error('ROLLBACK_VOUCHER_AUDIENCE_TEST');
    try {
        await prisma.$transaction(async tx => {
            const createUser = (tier?: string, staff = false, active = true) => tx.users.create({ data: {
                full_name: 'Voucher audience fixture', is_staff: staff,
                accounts: { create: { email: `voucher-test-${randomUUID()}@example.invalid`, password_hash: 'test-only', status: active ? 1 : 0 } },
                ...(tier ? { membership: { create: { tier } } } : {}),
            } });
            const [member, silver, gold, platinum, staff, disabled] = await Promise.all([createUser(), createUser('silver'), createUser('gold'), createUser('platinum'), createUser('gold', true), createUser('gold', false, false)]);
            const scoped = new Proxy(tx, { get(target, key) { if (key === '$transaction') return (callback: (client: typeof tx) => unknown) => callback(tx); const value = Reflect.get(target, key); return typeof value === 'function' ? value.bind(target) : value; } });
            const vouchers = new VouchersService(scoped as never);
            const start = new Date(Date.now() - 60_000), end = new Date(Date.now() + 86400_000);
            const payload = () => ({ code: 'AUD-' + randomUUID().slice(0, 14).toUpperCase(), discount_type: 'fixed', discount_value: 100_000, min_order_value: 0, usage_limit: 100, start_date: start, expiry_date: end, status: 1 });
            const targeted = await vouchers.create({ ...payload(), eligible_tiers: ['gold', 'platinum'] });
            assert.ok(targeted.notification_count >= 2);
            const received = await tx.membership_notifications.findMany({ where: { voucher_id: targeted.voucher_id }, select: { user_id: true, message: true } });
            const ids = received.map(row => row.user_id);
            assert.ok(ids.includes(gold.user_id));
            assert.ok(ids.includes(platinum.user_id));
            for (const user of [member, silver, staff, disabled]) assert.ok(!ids.includes(user.user_id));
            assert.ok(received.every(row => row.message.includes(targeted.code)));
            assert.equal((await vouchers.validatePublicVoucher(targeted.code, '1000000', gold.user_id)).discount_amount, 100_000);
            await assert.rejects(vouchers.validatePublicVoucher(targeted.code, '1000000', silver.user_id), /chỉ áp dụng/);
            await assert.rejects(vouchers.validatePublicVoucher(targeted.code, '1000000'), /đăng nhập/);
            await assert.rejects(vouchers.create({ ...payload(), eligible_tiers: ['all', 'gold'] as never }), /Đối tượng/);
            await assert.rejects(vouchers.create({ ...payload(), eligible_tiers: ['gold', 'gold'] }), /Đối tượng/);
            await assert.rejects(vouchers.create({ ...payload(), discount_value: 101, discount_type: 'percentage' }), /Mức giảm/);

            const paused = await vouchers.create({ ...payload(), eligible_tiers: ['bronze'], status: 0 });
            assert.equal(paused.notification_count, 0);
            const enabled = await vouchers.update(paused.voucher_id, { status: 1 });
            assert.ok(enabled.notification_count >= 1);
            assert.equal(await tx.membership_notifications.count({ where: { voucher_id: paused.voucher_id, user_id: member.user_id } }), 1);
            await vouchers.update(paused.voucher_id, { status: 0 });
            assert.equal((await vouchers.update(paused.voucher_id, { status: 1 })).notification_count, 0);
            assert.equal(await tx.membership_notifications.count({ where: { voucher_id: paused.voucher_id, user_id: member.user_id } }), 1);

            const partial = await vouchers.create({ ...payload(), eligible_tiers: ['gold'] });
            await tx.vouchers.update({ where: { voucher_id: partial.voucher_id }, data: { used_count: 1 } });
            const noticesBeforeLock = await tx.membership_notifications.count({ where: { voucher_id: partial.voucher_id } });
            assert.equal((await vouchers.update(partial.voucher_id, { status: 0 })).status, 0);
            await assert.rejects(vouchers.validatePublicVoucher(partial.code, '1000000', gold.user_id), /không hợp lệ/);
            const reopened = await vouchers.update(partial.voucher_id, { status: 1 });
            assert.equal(reopened.status, 1);
            assert.equal(reopened.used_count, 1);
            assert.equal(reopened.usage_limit, partial.usage_limit);
            assert.equal(reopened.start_date.toISOString(), partial.start_date.toISOString());
            assert.equal(reopened.expiry_date.toISOString(), partial.expiry_date.toISOString());
            assert.equal(reopened.notification_count, 0);
            assert.equal(await tx.membership_notifications.count({ where: { voucher_id: partial.voucher_id } }), noticesBeforeLock);
            assert.equal((await vouchers.validatePublicVoucher(partial.code, '1000000', gold.user_id)).discount_amount, 100_000);
            const expired = await vouchers.create({ ...payload(), status: 0, start_date: new Date(Date.now() - 2 * 86400_000), expiry_date: new Date(Date.now() - 86400_000) });
            await assert.rejects(vouchers.update(expired.voucher_id, { status: 1 }), /hết hạn/);
            assert.equal((await tx.vouchers.findUniqueOrThrow({ where: { voucher_id: expired.voucher_id } })).status, 0);
            assert.equal((await vouchers.remove(expired.voucher_id)).voucher_id, expired.voucher_id);
            const exhausted = await vouchers.create({ ...payload(), status: 0, usage_limit: 1 });
            await tx.vouchers.update({ where: { voucher_id: exhausted.voucher_id }, data: { used_count: 1 } });
            await assert.rejects(vouchers.update(exhausted.voucher_id, { status: 1 }), /hết lượt/);
            await assert.rejects(vouchers.remove(exhausted.voucher_id), /đã được sử dụng/);

            const common = await vouchers.create(payload());
            assert.deepEqual(common.eligible_tiers, []);
            assert.equal((await vouchers.validatePublicVoucher(common.code, '1000000')).discount_amount, 100_000);
            const upcoming = await vouchers.create({ ...payload(), eligible_tiers: ['bronze'], start_date: new Date(Date.now() + 3600_000) });
            const summary = await new MembershipService(scoped as never).syncUser(member.user_id);
            assert.ok(summary.vouchers.some(voucher => voucher.voucher_id === common.voucher_id && voucher.state === 'available'));
            assert.ok(summary.vouchers.some(voucher => voucher.voucher_id === upcoming.voucher_id && voucher.state === 'upcoming'));
            assert.ok(!summary.vouchers.some(voucher => voucher.voucher_id === targeted.voucher_id));
            assert.ok(summary.notifications.some(notice => notice.voucher_id === upcoming.voucher_id));

            const schedules = await tx.tour_schedules.findMany({ where: { status: 1, tours: { status: 1 } }, include: { pickup_points: true }, take: 100 });
            const schedule = schedules.find(row => row.quota > row.booked_count);
            assert.ok(schedule, 'Cần lịch tour hoạt động còn chỗ để kiểm thử.');
            const bookings = new BookingsService(scoped as never, { sendBookingCreatedEmail: async () => undefined } as never, { syncUser: async () => ({ tier: MEMBERSHIP_TIERS[0] }) } as never);
            const bookingPayload = { user_id: member.user_id, tour_schedule_id: schedule.tour_schedule_id, pickup_point_id: schedule.pickup_points[0]?.pickup_point_id, adult_count: 1, child_count: 0, infant_count: 0, contact_name: 'Test', contact_phone: '0900000000', contact_email: 'test@example.invalid', payment_method: 'vnpay', travelers: [], voucher_code: targeted.code };
            await assert.rejects(bookings.createBooking(bookingPayload), /chỉ áp dụng/);
            assert.equal((await tx.tour_schedules.findUniqueOrThrow({ where: { tour_schedule_id: schedule.tour_schedule_id } })).booked_count, schedule.booked_count);
            assert.equal((await tx.vouchers.findUniqueOrThrow({ where: { voucher_id: targeted.voucher_id } })).used_count, 0);
            assert.equal(await tx.bookings.count({ where: { user_id: member.user_id } }), 0);
            throw rollback;
        }, { timeout: 60_000 });
    } catch (error) { if (error !== rollback) throw error; }
    finally { await prisma.$disconnect(); }
    console.log('PASS: audience notifications, no duplicate sends, lock/reopen without changing voucher terms, reject expired/exhausted reopening, validation, eligible/upcoming wallet, booking bypass prevention. All fixture changes and notifications rolled back.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
