import 'reflect-metadata';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import type { CrewPayload, EmployeePayload, WorkforceActor } from 'shared';
import { WorkforceAccessService } from '../apps/api/src/modules/workforce/workforce-access.service';
import { WorkforceService } from '../apps/api/src/modules/workforce/workforce.service';
import { ChatService } from '../apps/api/src/modules/chat/chat.service';
import { SchedulesAdminService } from '../apps/api/src/modules/schedules/schedules-admin.service';

config({ path: resolve(__dirname, '../.env'), quiet: true });
config({ path: resolve(__dirname, '../apps/api/.env'), quiet: true });
const prisma = new PrismaClient();
const rollback = new Error('ROLLBACK_WORKFORCE_TESTS');
let passed = 0;
function check(value: unknown) { assert.ok(value); passed++; }
async function rejects(callback: () => Promise<unknown>, match: RegExp) { await assert.rejects(callback, match); passed++; }

async function main() {
  const before = await prisma.employee_profiles.count();
  try {
    await prisma.$transaction(async tx => {
      const db = new Proxy(tx, { get(target, key) {
        if (key === '$transaction') return (callback: (client: typeof tx) => Promise<unknown>) => callback(tx);
        const value = Reflect.get(target, key); return typeof value === 'function' ? value.bind(target) : value;
      } });
      const access = new WorkforceAccessService(db as never);
      const service = new WorkforceService(db as never, access);
      const chat = new ChatService(db as never, access);
      const key = `WF${Date.now()}`;
      const roleRows = await tx.roles.findMany({ where: { name: { in: ['admin', 'region_manager', 'page_staff', 'guide', 'tour_leader', 'deputy_leader'] } } });
      assert.equal(roleRows.length, 6, 'Install workforce and deputy leader migrations before testing.');
      let sequence = 0;
      async function fixture(roles: string[], regions: string[]) {
        const number = ++sequence;
        return tx.users.create({ data: { full_name: `${key} ${number}`, is_staff: true,
          accounts: { create: { email: `${key}-${number}@example.invalid`, status: 1 } },
          employee_profile: { create: { employee_code: `${key}-${number}`, position: 'Nhân viên kiểm thử', regions, primary_region: regions[0] || null } },
          role_users: { create: roles.map(name => ({ role_id: roleRows.find(role => role.name === name)!.role_id })) },
        } });
      }
      const root = await fixture(['admin'], []);
      const managerUser = await fixture(['region_manager'], ['north']);
      const pageUser = await fixture(['page_staff'], ['north']);
      const page2User = await fixture(['page_staff'], ['north']);
      const offDutyUser = await fixture(['page_staff'], ['north']);
      const southUser = await fixture(['page_staff'], ['south']);
      const guideUser = await fixture(['guide', 'page_staff'], ['north']);
      const leaderUser = await fixture(['tour_leader'], ['north']);
      const dualUser = await fixture(['guide', 'tour_leader'], ['north']);
      const admin = await access.actor(root.user_id, root.account_id);
      const manager = await access.actor(managerUser.user_id);
      const page = await access.actor(pageUser.user_id);
      const guide = await access.actor(guideUser.user_id);
      const leader = await access.actor(leaderUser.user_id);
      check(admin.isAdmin && admin.isManager && admin.canChat);
      check(!guide.isAdmin && !guide.isManager);
      await rejects(() => access.actor(root.user_id, root.account_id + 1), /không còn hoạt động/);
      await rejects(() => service.employees(guide), /Chỉ quản lý/);
      const people = await service.employees(manager);
      check(people.some(item => item.user_id === pageUser.user_id));
      check(!people.some(item => item.user_id === southUser.user_id));
      const employeeBody: EmployeePayload = { full_name: `${key} New`, email: `${key}-new@example.invalid`, password: 'Temporary-test-password-47', phone: null,
        employee_code: `${key}-new`, position: 'Tư vấn', primary_region: 'north', regions: ['north'], roles: ['page_staff'], employment_type: 'contractor', status: 'active', languages: ['Tiếng Anh'], note: 'Fixture only' };
      await rejects(() => service.createEmployee(manager, { ...employeeBody, roles: ['admin'] }), /chỉ được cấp/);
      await rejects(() => service.createEmployee(manager, { ...employeeBody, regions: ['south'], primary_region: 'south' }), /phạm vi/);
      const created = await service.createEmployee(manager, employeeBody);
      const createdActor = await access.actor(created.user_id);
      check(!createdActor.isAdmin && createdActor.roles.includes('page_staff'));
      const saved = (await service.employees(manager)).find(item => item.user_id === created.user_id)!;
      check(saved.employment_type === 'contractor' && saved.languages[0] === 'Tiếng Anh');
      await rejects(() => service.updateEmployee(manager, root.user_id, { ...employeeBody, employee_code: 'OTHER' }), /không được chỉnh sửa/);
      await rejects(() => service.updateEmployee(admin, root.user_id, { ...employeeBody, employee_code: 'OTHER', status: 'inactive' }), /Không thể tự/);
      await tx.accounts.update({ where: { account_id: (await tx.users.findUniqueOrThrow({ where: { user_id: created.user_id } })).account_id }, data: { status: 0 } });
      await rejects(() => access.actor(created.user_id), /không còn hoạt động/);
      await tx.accounts.update({ where: { account_id: (await tx.users.findUniqueOrThrow({ where: { user_id: created.user_id } })).account_id }, data: { status: 1 } });

      const location = await tx.locations.findFirstOrThrow();
      const transport = await tx.transports.findFirstOrThrow();
      const tour = await tx.tours.create({ data: { code: key, name: `${key} Tour`, description: 'Fixture', duration_days: 2, departure_location: location.location_id, transport_id: transport.transport_id } });
      const start = new Date(Date.now() + 7 * 86400000); start.setUTCHours(1, 0, 0, 0);
      const end = new Date(start.getTime() + 86400000);
      const scheduleData = { tour_id: tour.tour_id, departure_location_id: location.location_id, start_date: start, end_date: end, price: 1000000, quota: 20, operating_region: 'north' };
      const schedule = await tx.tour_schedules.create({ data: scheduleData });
      const overlapping = await tx.tour_schedules.create({ data: scheduleData });
      const southern = await tx.tour_schedules.create({ data: { ...scheduleData, operating_region: 'south' } });
      const unknown = await tx.tour_schedules.create({ data: { ...scheduleData, operating_region: null } });
      const body: CrewPayload = { assignments: [
        { roles: ['guide'], user_id: guideUser.user_id, report_at: start.toISOString(), release_at: end.toISOString() },
        { roles: ['tour_leader'], user_id: leaderUser.user_id, report_at: start.toISOString(), release_at: end.toISOString() },
      ] };
      await rejects(() => service.setRegion(manager, unknown.tour_schedule_id, 'north'), /Chỉ quản trị/);
      await rejects(() => service.assignCrew(manager, unknown.tour_schedule_id, body), /chọn miền/);
      await service.setRegion(admin, unknown.tour_schedule_id, 'north');
      await rejects(() => service.assignCrew(manager, southern.tour_schedule_id, body), /Ngoài miền/);
      await rejects(() => service.assignCrew(manager, schedule.tour_schedule_id, { assignments: body.assignments.map(item => ({ ...item, user_id: dualUser.user_id })) }), /một lần/);
      await rejects(() => service.assignCrew(manager, schedule.tour_schedule_id, { assignments: [{ ...body.assignments[0], user_id: pageUser.user_id }] }), /đủ vai trò/);
      await rejects(() => service.assignCrew(manager, schedule.tour_schedule_id, { assignments: [{ ...body.assignments[0], report_at: end.toISOString() }] }), /bao gồm/);
      const blockingShift = await service.createShift(manager, { user_id: guideUser.user_id, duty_type: 'page', region_code: 'north', starts_at: start.toISOString(), ends_at: end.toISOString() });
      await rejects(() => service.assignCrew(manager, schedule.tour_schedule_id, body), /trùng ca trực/);
      await service.cancelShift(manager, blockingShift.shift_id);
      await service.assignCrew(manager, schedule.tour_schedule_id, body);
      check((await service.schedules(manager)).find(row => row.tour_schedule_id === schedule.tour_schedule_id)?.crew_ready === false);
      await rejects(() => service.assignCrew(manager, overlapping.tour_schedule_id, body), /trùng ca trực/);
      await rejects(() => service.createShift(manager, { user_id: guideUser.user_id, duty_type: 'leave', region_code: 'north', starts_at: start.toISOString(), ends_at: end.toISOString() }), /trùng ca trực/);
      await rejects(() => service.setRegion(admin, schedule.tour_schedule_id, 'south'), /gỡ phân công/);
      const crew = await tx.schedule_crew.findMany({ where: { tour_schedule_id: schedule.tour_schedule_id } });
      const guideAssignment = crew.find(item => item.roles.includes('guide'))!;
      const leaderAssignment = crew.find(item => item.roles.includes('tour_leader'))!;
      await rejects(() => service.respond(leader, guideAssignment.assignment_id, 'confirm'), /Chỉ người được/);
      await service.respond(guide, guideAssignment.assignment_id, 'confirm');
      await service.respond(leader, leaderAssignment.assignment_id, 'confirm');
      check((await service.schedules(manager)).find(row => row.tour_schedule_id === schedule.tour_schedule_id)?.crew_ready);
      await service.assignCrew(manager, schedule.tour_schedule_id, body);
      check((await tx.schedule_crew.findUniqueOrThrow({ where: { assignment_id: guideAssignment.assignment_id } })).status === 'confirmed');
      await service.assignCrew(manager, schedule.tour_schedule_id, { assignments: body.assignments.map(item => item.roles.includes('guide') ? { ...item, report_at: new Date(start.getTime() - 3600000).toISOString() } : item) });
      check((await tx.schedule_crew.findUniqueOrThrow({ where: { assignment_id: guideAssignment.assignment_id } })).status === 'pending');
      await rejects(() => service.respond(guide, guideAssignment.assignment_id, 'decline'), /Lý do/);
      await service.respond(guide, guideAssignment.assignment_id, 'decline', 'Bận lịch cá nhân');
      check((await tx.schedule_crew.findUniqueOrThrow({ where: { assignment_id: guideAssignment.assignment_id } })).response_note === 'Bận lịch cá nhân');
      await rejects(() => service.respond(leader, leaderAssignment.assignment_id, 'complete'), /không cho phép/);
      check(!(await service.schedules(manager)).some(row => row.tour_schedule_id === southern.tour_schedule_id));
      check((await service.schedules(leader)).every(row => row.crew.some(item => item.user_id === leader.userId)));
      // Flexible crews: a dual-role employee counts as one person and confirms once.
      const dual = await access.actor(dualUser.user_id);
      const solo: CrewPayload = { crew_required_count: 1, assignments: [{ roles: ['tour_leader', 'guide'], user_id: dual.userId, report_at: start.toISOString(), release_at: end.toISOString() }] };
      await rejects(() => service.assignCrew(manager, unknown.tour_schedule_id, { ...solo, crew_required_count: 0 }), /tối thiểu/);
      await rejects(() => service.assignCrew(manager, unknown.tour_schedule_id, { ...solo, crew_required_count: 2147483648 }), /tối thiểu/);
      await rejects(() => service.assignCrew(manager, unknown.tour_schedule_id, { ...solo, assignments: [{ ...solo.assignments[0], roles: [] }] }), /vai trò hợp lệ/);
      await rejects(() => service.assignCrew(manager, unknown.tour_schedule_id, { ...solo, assignments: [{ ...solo.assignments[0], roles: ['guide', 'guide'] }] }), /vai trò hợp lệ/);
      await rejects(() => service.assignCrew(manager, unknown.tour_schedule_id, { ...solo, assignments: [{ ...solo.assignments[0], roles: ['driver' as never] }] }), /vai trò hợp lệ/);
      await rejects(() => service.assignCrew(manager, unknown.tour_schedule_id, { ...solo, assignments: [{ ...solo.assignments[0], user_id: guide.userId }] }), /đủ vai trò/);
      await service.assignCrew(manager, unknown.tour_schedule_id, solo);
      let flexible = (await service.schedules(manager)).find(row => row.tour_schedule_id === unknown.tour_schedule_id)!;
      check(flexible.crew.length === 1 && !flexible.crew_ready && flexible.crew_required_count === 1);
      const dualAssignment = flexible.crew[0].assignment_id;
      await service.respond(dual, dualAssignment, 'confirm');
      flexible = (await service.schedules(manager)).find(row => row.tour_schedule_id === unknown.tour_schedule_id)!;
      check(flexible.crew_ready && flexible.crew_confirmed_count === 1 && flexible.crew_issues.length === 0);
      await service.assignCrew(manager, unknown.tour_schedule_id, { ...solo, assignments: [{ ...solo.assignments[0], roles: ['guide', 'tour_leader'] }] });
      check((await tx.schedule_crew.findUniqueOrThrow({ where: { assignment_id: dualAssignment } })).status === 'confirmed');
      const dualProfile = (await service.employees(manager)).find(item => item.user_id === dual.userId)!;
      await rejects(() => service.updateEmployee(manager, dual.userId, { ...dualProfile, roles: ['tour_leader'] } as EmployeePayload), /hủy hoặc chuyển/);
      await service.assignCrew(manager, unknown.tour_schedule_id, { ...solo, crew_required_count: 3 });
      flexible = (await service.schedules(manager)).find(row => row.tour_schedule_id === unknown.tour_schedule_id)!;
      check(!flexible.crew_ready && flexible.crew_confirmed_count === 1 && flexible.crew_issues.some(issue => issue.includes('2 nhân sự')));
      // Multiple employees may hold the same role, including more than two staff.
      const extraGuide1 = await fixture(['guide'], ['north']);
      const extraGuide2 = await fixture(['guide'], ['north']);
      const triple: CrewPayload = { crew_required_count: 3, assignments: [solo.assignments[0], ...[extraGuide1, extraGuide2].map(user => ({ roles: ['guide'] as ['guide'], user_id: user.user_id, report_at: start.toISOString(), release_at: end.toISOString() }))] };
      await service.assignCrew(manager, unknown.tour_schedule_id, triple);
      flexible = (await service.schedules(manager)).find(row => row.tour_schedule_id === unknown.tour_schedule_id)!;
      check(flexible.crew.length === 3 && !flexible.crew_ready && flexible.crew_confirmed_count === 1);
      check(flexible.crew_issues.some(issue => issue.includes('2 nhân sự đang chờ')));
      for (const user of [extraGuide1, extraGuide2]) {
        await service.respond(await access.actor(user.user_id), flexible.crew.find(item => item.user_id === user.user_id)!.assignment_id, 'confirm');
      }
      check((await service.schedules(manager)).find(row => row.tour_schedule_id === unknown.tour_schedule_id)!.crew_ready);
      await rejects(() => service.assignCrew(manager, overlapping.tour_schedule_id, solo), /trùng ca trực/);
      await tx.accounts.update({ where: { account_id: extraGuide1.account_id }, data: { status: 0 } });
      flexible = (await service.schedules(manager)).find(row => row.tour_schedule_id === unknown.tour_schedule_id)!;
      check(!flexible.crew_ready && flexible.crew_issues.some(issue => issue.includes('không còn hợp lệ')));
      await tx.accounts.update({ where: { account_id: extraGuide1.account_id }, data: { status: 1 } });
      // Changing roles resets acceptance; an unchanged save preserves it.
      await service.assignCrew(manager, unknown.tour_schedule_id, { ...triple, assignments: triple.assignments.map(item => item.user_id === dual.userId ? { ...item, roles: ['tour_leader'] } : item) });
      check((await tx.schedule_crew.findUniqueOrThrow({ where: { assignment_id: dualAssignment } })).status === 'pending');
      await service.respond(dual, dualAssignment, 'decline', 'Không thể nhận chuyến');
      flexible = (await service.schedules(manager)).find(row => row.tour_schedule_id === unknown.tour_schedule_id)!;
      check(!flexible.crew_ready && flexible.crew_issues.some(issue => issue.includes('đã từ chối')));
      await service.assignCrew(manager, unknown.tour_schedule_id, { crew_required_count: 1, assignments: [] });
      check(await tx.schedule_crew.count({ where: { tour_schedule_id: unknown.tour_schedule_id } }) === 0);
      await service.assignCrew(manager, unknown.tour_schedule_id, { ...solo, assignments: [{ ...solo.assignments[0], roles: ['guide'] }] });
      flexible = (await service.schedules(manager)).find(row => row.tour_schedule_id === unknown.tour_schedule_id)!;
      await service.respond(dual, flexible.crew[0].assignment_id, 'confirm');
      flexible = (await service.schedules(manager)).find(row => row.tour_schedule_id === unknown.tour_schedule_id)!;
      check(!flexible.crew_ready && flexible.crew_issues.some(issue => issue.includes('Trưởng đoàn')));
      await service.assignCrew(manager, unknown.tour_schedule_id, { assignments: [] });
      const deputyCreated = await service.createEmployee(manager, { ...employeeBody, email: `${key}-deputy@example.invalid`, employee_code: `${key}-deputy`, roles: ['deputy_leader', 'guide'], position: 'Phó đoàn' });
      const deputy = await access.actor(deputyCreated.user_id);
      check(deputy.roles.includes('deputy_leader') && !deputy.isManager && !deputy.canChat);
      const deputyItem: CrewPayload['assignments'][number] = { roles: ['deputy_leader'], user_id: deputy.userId, report_at: start.toISOString(), release_at: end.toISOString() };
      await rejects(() => service.assignCrew(manager, unknown.tour_schedule_id, { assignments: [{ ...deputyItem, user_id: guide.userId }] }), /đủ vai trò/);
      const withDeputy: CrewPayload = { crew_required_count: 2, assignments: [solo.assignments[0], deputyItem] };
      await service.assignCrew(manager, unknown.tour_schedule_id, withDeputy);
      flexible = (await service.schedules(manager)).find(row => row.tour_schedule_id === unknown.tour_schedule_id)!;
      for (const actor of [dual, deputy]) await service.respond(actor, flexible.crew.find(item => item.user_id === actor.userId)!.assignment_id, 'confirm');
      flexible = (await service.schedules(manager)).find(row => row.tour_schedule_id === unknown.tour_schedule_id)!;
      check(flexible.crew_ready && flexible.crew_confirmed_count === 2 && flexible.crew.some(item => item.roles.includes('deputy_leader')));
      // A deputy can also guide, but cannot replace the required tour leader.
      const deputyCombined: CrewPayload = { crew_required_count: 1, assignments: [{ ...deputyItem, roles: ['deputy_leader', 'guide'] }] };
      await service.assignCrew(manager, unknown.tour_schedule_id, deputyCombined);
      flexible = (await service.schedules(manager)).find(row => row.tour_schedule_id === unknown.tour_schedule_id)!;
      check(flexible.crew[0].status === 'pending');
      await service.respond(deputy, flexible.crew[0].assignment_id, 'confirm');
      flexible = (await service.schedules(manager)).find(row => row.tour_schedule_id === unknown.tour_schedule_id)!;
      check(!flexible.crew_ready && flexible.crew_issues.some(issue => issue.includes('Trưởng đoàn')));
      await rejects(() => service.assignCrew(manager, overlapping.tour_schedule_id, deputyCombined), /trùng ca trực/);
      const deputyProfile = (await service.employees(manager)).find(item => item.user_id === deputy.userId)!;
      await rejects(() => service.updateEmployee(manager, deputy.userId, { ...deputyProfile, roles: ['guide'] } as EmployeePayload), /hủy hoặc chuyển/);
      await service.assignCrew(manager, unknown.tour_schedule_id, { assignments: [] });
      const allRolesUser = await fixture(['tour_leader', 'deputy_leader', 'guide'], ['north']);
      const allRoles: CrewPayload = { crew_required_count: 1, assignments: [{ ...deputyItem, user_id: allRolesUser.user_id, roles: ['guide', 'deputy_leader', 'tour_leader'] }] };
      await service.assignCrew(manager, unknown.tour_schedule_id, allRoles);
      flexible = (await service.schedules(manager)).find(row => row.tour_schedule_id === unknown.tour_schedule_id)!;
      check(flexible.crew[0].roles.length === 3);
      await service.respond(await access.actor(allRolesUser.user_id), flexible.crew[0].assignment_id, 'confirm');
      check((await service.schedules(manager)).find(row => row.tour_schedule_id === unknown.tour_schedule_id)!.crew_ready);
      await service.assignCrew(manager, unknown.tour_schedule_id, { assignments: [] });
      const scheduleService = new SchedulesAdminService(db as never, {} as never);
      (scheduleService as any).logger = { error() {} };
      await rejects(() => scheduleService.updateSchedule(schedule.tour_schedule_id, { start_date: new Date(start.getTime() + 3600000).toISOString() }), /gỡ phân công/);
      await rejects(() => scheduleService.deleteSchedule(schedule.tour_schedule_id), /gỡ phân công/);

      const now = Date.now();
      const duty = { duty_type: 'page' as const, region_code: 'north' as const, starts_at: new Date(now - 3600000).toISOString(), ends_at: new Date(now + 3600000).toISOString() };
      const shift1 = await service.createShift(manager, { ...duty, user_id: page.userId });
      await service.createShift(manager, { ...duty, user_id: page2User.user_id });
      await service.createShift(admin, { ...duty, region_code: 'south', user_id: southUser.user_id });
      await rejects(() => service.createShift(manager, { ...duty, user_id: page.userId }), /trùng ca trực/);
      await rejects(() => service.createShift(manager, { ...duty, user_id: southUser.user_id }), /hỗ trợ miền/);
      const customer = await tx.users.create({ data: { full_name: 'Test customer', accounts: { create: { email: `${key}-customer@example.invalid` } } } });
      const conversation = await tx.conversations.create({ data: { user_id: customer.user_id, status: 'IN_PROGRESS', region_code: 'south', assigned_staff_id: page2User.user_id, handover_note: 'Legacy routing metadata' } });
      const pageChat = await chat.actor({ sub: page.userId, accountId: pageUser.account_id });
      const page2Chat = await chat.actor({ sub: page2User.user_id });
      const offDutyChat = await chat.actor({ sub: offDutyUser.user_id });
      const southChat = await chat.actor({ sub: southUser.user_id });
      const customerChat = await chat.actor({ sub: customer.user_id, accountId: customer.account_id });
      await rejects(() => chat.actor({ sub: leader.userId }), /không có quyền/);
      // No shift, region or legacy assignee is needed to read and reply.
      check((await chat.list(offDutyChat)).some(row => row.conversation_id === conversation.conversation_id));
      check((await chat.list(pageChat)).some(row => row.conversation_id === conversation.conversation_id));
      await chat.authorize(conversation.conversation_id, pageChat); passed++;
      await chat.authorize(conversation.conversation_id, southChat); passed++;
      const direct = { conversation_id: conversation.conversation_id, content: 'Hỗ trợ trực tiếp, không cần nhận hội thoại', client_message_id: 'shared-support-0001' };
      const message = await chat.send(offDutyChat, direct);
      check(message.sender_id === offDutyUser.user_id && message.sender_role === 'STAFF');
      check((await chat.send(offDutyChat, direct)).message_id === message.message_id);
      await rejects(() => chat.send(pageChat, direct), /Mã tin nhắn/);
      const shared = await tx.conversations.findUniqueOrThrow({ where: { conversation_id: conversation.conversation_id } });
      check(shared.assigned_staff_id === null && shared.region_code === null && shared.handover_note === null);
      await chat.send(pageChat, { conversation_id: conversation.conversation_id, content: 'Nhân viên khác cùng hỗ trợ khách' }); passed++;
      await chat.send(southChat, { conversation_id: conversation.conversation_id, content: 'Hỗ trợ không phụ thuộc miền' }); passed++;
      check((await chat.messages(conversation.conversation_id, page2Chat)).items.length === 3);
      await chat.read(conversation.conversation_id, customerChat, message.message_id); passed++;
      // Customers retain access only to their own conversation.
      const otherCustomer = await tx.users.create({ data: { full_name: 'Other test customer', accounts: { create: { email: `${key}-other-customer@example.invalid` } } } });
      const otherConversation = await tx.conversations.create({ data: { user_id: otherCustomer.user_id } });
      check(!(await chat.list(customerChat)).some(row => row.conversation_id === otherConversation.conversation_id));
      await rejects(() => chat.messages(otherConversation.conversation_id, customerChat), /Không có quyền/);
      await rejects(() => chat.send(customerChat, { conversation_id: otherConversation.conversation_id, content: 'Invalid cross-customer message' }), /Không có quyền/);
      await rejects(() => chat.manage(conversation.conversation_id, customerChat, 'close'), /Chỉ nhân viên/);
      for (const action of ['claim', 'transfer', 'route']) await rejects(() => chat.manage(conversation.conversation_id, pageChat, action), /không hợp lệ/);
      const closed = await chat.manage(conversation.conversation_id, offDutyChat, 'close');
      check(closed.status === 'CLOSED');
      const reopened = await chat.manage(conversation.conversation_id, page2Chat, 'reopen');
      check(reopened.status === 'IN_PROGRESS');
      await access.customer(page, customer.user_id); passed++;
      await access.customer(await access.actor(offDutyUser.user_id), customer.user_id); passed++;
      await rejects(() => access.customer(leader, customer.user_id), /Không có quyền/);
      // Ca trực remains scheduling data; ending it does not interrupt chat.
      await tx.conversations.update({ where: { conversation_id: conversation.conversation_id }, data: { assigned_staff_id: page.userId, region_code: 'south' } });
      check((await service.cancelShift(manager, shift1.shift_id)).status === 'cancelled');
      await chat.send(pageChat, { conversation_id: conversation.conversation_id, content: 'Tiếp tục hỗ trợ sau khi hủy ca' }); passed++;
      await tx.staff_shifts.updateMany({ where: { user_id: page2User.user_id }, data: { ends_at: new Date(now - 1000) } });
      await chat.send(page2Chat, { conversation_id: conversation.conversation_id, content: 'Tiếp tục hỗ trợ sau khi hết ca' }); passed++;
      // Legacy conversation ownership cannot prevent disabling an employee.
      await tx.conversations.update({ where: { conversation_id: conversation.conversation_id }, data: { assigned_staff_id: offDutyUser.user_id, region_code: 'south' } });
      const offDutyProfile = (await service.employees(manager)).find(item => item.user_id === offDutyUser.user_id)!;
      await service.updateEmployee(manager, offDutyUser.user_id, { ...offDutyProfile, status: 'inactive' } as EmployeePayload); passed++;
      await rejects(() => chat.actor({ sub: offDutyUser.user_id }), /không còn hoạt động/);
      await rejects(() => chat.send(offDutyChat, { conversation_id: conversation.conversation_id, content: 'Invalid inactive employee message' }), /không còn hoạt động/);
      await tx.employee_profiles.update({ where: { user_id: offDutyUser.user_id }, data: { status: 'active' } });
      await tx.accounts.update({ where: { account_id: offDutyUser.account_id }, data: { status: 0 } });
      await rejects(() => chat.send(offDutyChat, { conversation_id: conversation.conversation_id, content: 'Invalid locked account message' }), /không còn hoạt động/);
      await tx.accounts.update({ where: { account_id: offDutyUser.account_id }, data: { status: 1 } });
      await tx.role_users.deleteMany({ where: { user_id: offDutyUser.user_id, role_id: roleRows.find(role => role.name === 'page_staff')!.role_id } });
      await rejects(() => chat.send(offDutyChat, { conversation_id: conversation.conversation_id, content: 'Invalid revoked permission message' }), /chưa được phân quyền/);
      const events = await service.events(manager, schedule.tour_schedule_id);
      check(events.length >= 4);
      check(!JSON.stringify(await service.events(admin)).includes('Temporary-test-password-47'));
      const stats = await service.overview(manager);
      check(stats.employees >= 1 && stats.on_duty === 0 && stats.missing_crew >= 1);
      throw rollback;
    }, { timeout: 60000 });
  } catch (error) { if (error !== rollback) throw error; }
  check(await prisma.employee_profiles.count() === before);
  console.log(`Passed ${passed} workforce, permissions, scheduling and chat checks. All fixtures rolled back; no messages sent externally.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
