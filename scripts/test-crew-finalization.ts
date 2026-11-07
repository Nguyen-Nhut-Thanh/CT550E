import 'reflect-metadata';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import type { CrewPayload, ScheduleAdminPayload } from 'shared';
import { WorkforceAccessService } from '../apps/api/src/modules/workforce/workforce-access.service';
import { WorkforceService } from '../apps/api/src/modules/workforce/workforce.service';
import { inferOperatingRegion } from '../apps/api/src/modules/workforce/operating-region';
import { finalizeCrewIfReady, readCrewSnapshot } from '../apps/api/src/modules/workforce/crew-finalization';
import { SchedulesAdminService } from '../apps/api/src/modules/schedules/schedules-admin.service';
import { customerCrewBooking } from '../apps/api/src/modules/bookings/customer-crew';

config({ path: resolve(__dirname, '../.env'), quiet: true });
const prisma = new PrismaClient();
const rollback = new Error('ROLLBACK_CREW_FINALIZATION');
let checks = 0;
function check(value: unknown) { assert.ok(value); checks++; }
async function rejects(fn: () => Promise<unknown>, match: RegExp) { await assert.rejects(fn, match); checks++; }

async function main() {
  const before = await prisma.bookings.count();
  try {
    await prisma.$transaction(async tx => {
      const db = new Proxy(tx, { get(target, key) {
        if (key === '$transaction') return (fn: (client: typeof tx) => Promise<unknown>) => fn(tx);
        const value = Reflect.get(target, key); return typeof value === 'function' ? value.bind(target) : value;
      } });
      const access = new WorkforceAccessService(db as never);
      const service = new WorkforceService(db as never, access);
      const scheduleService = new SchedulesAdminService(db as never, {} as never);
      // Rejected changes below are expected; keep the test output focused.
      (scheduleService as unknown as { logger: { error(): void } }).logger = { error() {} };
      const key = `CF${Date.now()}`;
      const roleRows = await tx.roles.findMany();
      let sequence = 0;
      async function person(roles: string[] = [], regions = ['south']) {
        const code = `${key}-${++sequence}`;
        return tx.users.create({ data: { full_name: code, phone: `09${String(Date.now()).slice(-6)}${String(sequence).padStart(2, '0')}`, is_staff: roles.length > 0,
          accounts: { create: { email: `${code}@example.invalid`, status: 1 } },
          ...(roles.length ? {
            employee_profile: { create: { employee_code: code, position: 'Kiểm thử', regions, primary_region: regions[0] || null } },
            role_users: { create: roles.map(name => ({ role_id: roleRows.find(row => row.name === name)!.role_id })) },
          } : {}),
        } });
      }
      const admin = await access.actor((await person(['admin'], [])).user_id);
      const manager = await access.actor((await person(['region_manager'])).user_id);
      const leader = await access.actor((await person(['tour_leader'])).user_id);
      const guide = await access.actor((await person(['guide'])).user_id);
      const replacement = await access.actor((await person(['guide'])).user_id);
      const customer = await person();
      const anGiang = await tx.locations.findFirstOrThrow({ where: { slug: 'an-giang' } });
      const daNang = await tx.locations.findFirstOrThrow({ where: { slug: 'da-nang' } });
      const haNoi = await tx.locations.findFirstOrThrow({ where: { slug: 'ha-noi' } });
      for (const [location, region] of [[anGiang, 'south'], [daNang, 'central'], [haNoi, 'north']] as const) {
        check(await inferOperatingRegion(tx, location.location_id) === region);
      }
      const transport = await tx.transports.findFirstOrThrow();
      const tour = await tx.tours.create({ data: { code: key, name: `${key} Tour`, description: 'Fixture', duration_days: 2, departure_location: anGiang.location_id, transport_id: transport.transport_id } });
      const start = new Date(Date.now() + 5 * 86400000);
      const end = new Date(start.getTime() + 86400000);
      const payload: ScheduleAdminPayload = { start_date: start.toISOString(), end_date: end.toISOString(), price: 1000000, quota: 20 };
      const created = await scheduleService.createSchedule(tour.tour_id, payload);
      const scheduleId = created.tour_schedule_id;
      const saved = () => tx.tour_schedules.findUniqueOrThrow({ where: { tour_schedule_id: scheduleId } });
      check((await saved()).operating_region === 'south' && (await saved()).operating_region_source === 'departure');
      await scheduleService.updateSchedule(scheduleId, { departure_location_id: daNang.location_id });
      check((await saved()).operating_region === 'central');
      await service.setRegion(admin, scheduleId, 'south');
      await scheduleService.updateSchedule(scheduleId, { departure_location_id: haNoi.location_id });
      check((await saved()).operating_region === 'south' && (await saved()).operating_region_source === 'admin');
      const booking = async (status: string) => tx.bookings.create({ data: { user_id: customer.user_id, tour_schedule_id: scheduleId, status,
        contact_name: customer.full_name, contact_phone: '0901234567', contact_email: `${key}-contact@example.invalid`, total_amount: 1000000 } });
      const paid = await booking('paid');
      const pending = await booking('pending');
      const assignments: CrewPayload = { crew_required_count: 2, assignments: [
        { user_id: leader.userId, roles: ['tour_leader'], report_at: start.toISOString(), release_at: end.toISOString(), note: 'INTERNAL_NOTE_NEVER_PUBLISH' },
        { user_id: guide.userId, roles: ['guide'], report_at: start.toISOString(), release_at: end.toISOString() },
      ] };
      await service.assignCrew(manager, scheduleId, assignments);
      const crew = () => tx.schedule_crew.findMany({ where: { tour_schedule_id: scheduleId } });
      await service.respond(leader, (await crew()).find(item => item.user_id === leader.userId)!.assignment_id, 'confirm');
      check(!(await saved()).crew_locked_at);
      check(await tx.membership_notifications.count({ where: { booking_id: paid.booking_id } }) === 0);
      await service.respond(guide, (await crew()).find(item => item.user_id === guide.userId)!.assignment_id, 'confirm');
      let row = await saved();
      check(row.crew_locked_at && row.crew_revision === 1);
      const snapshot = readCrewSnapshot(row.crew_snapshot)!;
      check(snapshot.members.length === 2 && snapshot.members.every(member => member.phone?.startsWith('09')));
      check(!JSON.stringify(snapshot).includes('INTERNAL_NOTE'));
      check(await tx.membership_notifications.count({ where: { booking_id: paid.booking_id } }) === 1);
      check(await tx.membership_notifications.count({ where: { booking_id: pending.booking_id } }) === 0);
      await finalizeCrewIfReady(tx, scheduleId);
      check(await tx.membership_notifications.count({ where: { booking_id: paid.booking_id } }) === 1);
      await tx.bookings.update({ where: { booking_id: pending.booking_id }, data: { status: 'paid' } });
      await finalizeCrewIfReady(tx, scheduleId);
      check(await tx.membership_notifications.count({ where: { booking_id: pending.booking_id } }) === 1);
      await rejects(() => service.assignCrew(manager, scheduleId, assignments), /đã chốt|24 giờ/);
      await rejects(() => service.assignCrew(admin, scheduleId, assignments), /Lý do/);
      const revised: CrewPayload = { ...assignments, override_reason: 'Thay hướng dẫn viên bận đột xuất', assignments: assignments.assignments.map(item => item.user_id === guide.userId ? { ...item, user_id: replacement.userId } : item) };
      await service.assignCrew(admin, scheduleId, revised);
      row = await saved();
      check(!row.crew_locked_at && row.crew_revision === 1 && readCrewSnapshot(row.crew_snapshot)!.members.some(member => member.user_id === guide.userId));
      await service.respond(replacement, (await crew()).find(item => item.user_id === replacement.userId)!.assignment_id, 'confirm');
      row = await saved();
      check(row.crew_locked_at && row.crew_revision === 2 && readCrewSnapshot(row.crew_snapshot)!.members.some(member => member.user_id === replacement.userId));
      const notifications = await tx.membership_notifications.findMany({ where: { booking_id: paid.booking_id } });
      check(notifications.length === 2 && !JSON.stringify(notifications).includes('INTERNAL_NOTE'));
      await service.assignCrew(admin, scheduleId, revised);
      check((await saved()).crew_revision === 2 && await tx.membership_notifications.count({ where: { booking_id: paid.booking_id } }) === 2);
      await rejects(() => service.setRegion(admin, scheduleId, 'north'), /Lý do/);
      await service.setRegion(admin, scheduleId, 'north', 'Điều chỉnh miền xử lý');
      check(!(await saved()).crew_locked_at && !await finalizeCrewIfReady(tx, scheduleId));
      await service.setRegion(admin, scheduleId, 'south', 'Khôi phục miền phù hợp');
      check((await saved()).crew_locked_at && (await saved()).crew_revision === 2);
      await rejects(() => scheduleService.updateSchedule(scheduleId, { start_date: new Date(start.getTime() + 3600000).toISOString() }), /đã chốt/);
      check(customerCrewBooking({ status: 'pending', tour_schedules: { crew_snapshot: snapshot } }).tour_schedules.crew_snapshot === null);
      check(customerCrewBooking({ status: 'paid', tour_schedules: { crew_snapshot: snapshot } }).tour_schedules.crew_snapshot === snapshot);

      const lateStart = new Date(Date.now() + 23 * 3600000);
      const lateEnd = new Date(lateStart.getTime() + 86400000);
      const late = await tx.tour_schedules.create({ data: { tour_id: tour.tour_id, departure_location_id: anGiang.location_id, start_date: lateStart, end_date: lateEnd, price: 1000000, quota: 20, operating_region: 'south' } });
      const lateLeader = await access.actor((await person(['tour_leader', 'guide'])).user_id);
      const latePayload: CrewPayload = { assignments: [{ user_id: lateLeader.userId, roles: ['guide', 'tour_leader'], report_at: lateStart.toISOString(), release_at: lateEnd.toISOString() }] };
      await rejects(() => service.assignCrew(manager, late.tour_schedule_id, latePayload), /24 giờ/);
      await rejects(() => service.assignCrew(admin, late.tour_schedule_id, latePayload), /Lý do/);
      await service.assignCrew(admin, late.tour_schedule_id, { ...latePayload, override_reason: 'Bổ sung nhân sự khẩn' });
      check(!await finalizeCrewIfReady(tx, late.tour_schedule_id));
      await service.respond(lateLeader, (await tx.schedule_crew.findFirstOrThrow({ where: { tour_schedule_id: late.tour_schedule_id } })).assignment_id, 'confirm');
      const event = await tx.workforce_events.findFirstOrThrow({ where: { tour_schedule_id: late.tour_schedule_id, action: 'crew_finalized' } });
      check((event.details as { late: boolean }).late);
      check((await service.events(admin, scheduleId)).some(item => item.action === 'crew_override' && JSON.stringify(item.details).includes(revised.override_reason!)));
      throw rollback;
    }, { timeout: 60000 });
  } catch (error) { if (error !== rollback) throw error; }
  check(await prisma.bookings.count() === before);
  console.log(`Passed ${checks} crew finalization checks. Fixtures and notifications rolled back; nothing sent externally.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
