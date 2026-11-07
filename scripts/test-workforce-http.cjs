const assert = require('node:assert/strict');
const { resolve } = require('node:path');
require('dotenv').config({ path: resolve(__dirname, '../.env'), quiet: true });
const { PrismaClient } = require('@prisma/client');
const { JwtService } = require('@nestjs/jwt');
const bcrypt = require('bcryptjs');
const { getJwtSecret } = require('../apps/api/dist/config/jwt');
const prisma = new PrismaClient();
const jwt = new JwtService({ secret: getJwtSecret() });
const base = `http://localhost:${process.env.API_PORT || 4000}`;
const key = `WFHTTP${Date.now()}`;
const userIds = [], tourIds = [];
const password = 'Local-workforce-test-2026!';
let passed = 0;
async function request(path, token, method = 'GET', body) {
  const response = await fetch(`${base}${path}`, { method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return { status: response.status, data: await response.json() };
}
function status(result, expected) { assert.equal(result.status, expected, `Expected HTTP ${expected}, got ${result.status}: ${JSON.stringify(result.data)}`); passed++; }
async function fixture(name, roles, regions) {
  const roleRows = await prisma.roles.findMany({ where: { name: { in: roles } } });
  const user = await prisma.users.create({ data: { full_name: `Kiểm thử ${name}`, is_staff: true,
    accounts: { create: { email: `${key}-${name}@example.invalid`, password_hash: await bcrypt.hash(password, 10), email_verified: true } },
    employee_profile: { create: { employee_code: `${key}-${userIds.length}`, position: 'Hồ sơ thử nghiệm', regions, primary_region: regions[0] || null } },
    role_users: { create: roleRows.map(role => ({ role_id: role.role_id })) },
  }, include: { accounts: { select: { email: true } } } });
  userIds.push(user.user_id);
  return { ...user, token: jwt.sign({ sub: user.user_id, accountId: user.account_id, isStaff: true }, { expiresIn: '30m' }) };
}
async function cleanup() {
  if (!userIds.length) return;
  const ids = [...userIds];
  await prisma.$transaction(async tx => {
    const schedules = await tx.tour_schedules.findMany({ where: { tour_id: { in: tourIds } }, select: { tour_schedule_id: true } });
    const scheduleIds = schedules.map(row => row.tour_schedule_id);
    await tx.workforce_events.deleteMany({ where: { OR: [{ actor_user_id: { in: ids } }, { target_user_id: { in: ids } }, { tour_schedule_id: { in: scheduleIds } }] } });
    await tx.staff_shifts.deleteMany({ where: { user_id: { in: ids } } });
    await tx.schedule_crew.deleteMany({ where: { user_id: { in: ids } } });
    await tx.messages.deleteMany({ where: { conversations: { user_id: { in: ids } } } });
    await tx.conversations.deleteMany({ where: { user_id: { in: ids } } });
    await tx.tour_schedules.deleteMany({ where: { tour_id: { in: tourIds } } });
    await tx.tours.deleteMany({ where: { tour_id: { in: tourIds } } });
    const people = await tx.users.findMany({ where: { user_id: { in: ids } }, select: { account_id: true } });
    await tx.role_users.deleteMany({ where: { user_id: { in: ids } } });
    await tx.employee_profiles.deleteMany({ where: { user_id: { in: ids } } });
    await tx.users.deleteMany({ where: { user_id: { in: ids } } });
    await tx.accounts.deleteMany({ where: { account_id: { in: people.map(row => row.account_id) } } });
  });
}
async function main() {
  const cleanupKey = process.argv.find(value => value.startsWith('--cleanup='))?.slice('--cleanup='.length);
  if (cleanupKey) {
    if (!/^WFHTTP\d{13}$/.test(cleanupKey)) throw new Error('Invalid fixture cleanup key.');
    const fixtures = await prisma.users.findMany({ where: { accounts: { email: { startsWith: `${cleanupKey}-`, endsWith: '@example.invalid' } } }, select: { user_id: true } });
    userIds.push(...fixtures.map(row => row.user_id));
    const tours = await prisma.tours.findMany({ where: { code: cleanupKey }, select: { tour_id: true } });
    tourIds.push(...tours.map(row => row.tour_id));
    await cleanup(); await prisma.$disconnect(); console.log('Named HTTP/UI fixtures removed.'); return;
  }
  try {
    status(await request('/admin/workforce/me'), 401);
    const admin = await fixture('admin', ['admin'], []);
    const manager = await fixture('manager', ['region_manager'], ['north']);
    const guide = await fixture('guide', ['guide'], ['south']);
    const leader = await fixture('leader', ['tour_leader'], ['south']);
    const page = await fixture('page', ['page_staff', 'guide'], ['south']);
    const dual = await fixture('dual', ['tour_leader', 'guide'], ['south']);
    const extraGuide = await fixture('guide-extra', ['guide', 'deputy_leader'], ['south']);
    status(await request('/admin/auth/login', null, 'POST', { email: admin.accounts.email, password }), 201);
    status(await request('/admin/workforce/me', admin.token), 200);
    status(await request('/admin/users', admin.token), 200);
    status(await request('/admin/workforce/employees', manager.token), 200);
    status(await request('/admin/workforce/employees?region=south', manager.token), 200);
    status(await request('/admin/users', manager.token), 200);
    status(await request('/bookings/admin/list', manager.token), 200);
    const deniedEdit = await request(`/admin/users/${manager.user_id}/status`, manager.token, 'PATCH', { status: 0 });
    status(deniedEdit, 403);
    assert.equal(deniedEdit.data.message, 'Bạn không có quyền quản lý nội dung này.'); passed++;
    status(await request('/admin/membership', page.token), 403);
    status(await request('/admin/workforce/schedules', guide.token), 200);
    status(await request('/admin/workforce/employees', guide.token), 403);
    status(await request('/chat/me', leader.token), 403);
    status(await request('/chat/me', page.token), 200);
    status(await request('/admin/auth/me', guide.token), 200);
    await prisma.accounts.update({ where: { account_id: guide.account_id }, data: { status: 0 } });
    status(await request('/admin/workforce/me', guide.token), 401);
    await prisma.accounts.update({ where: { account_id: guide.account_id }, data: { status: 1 } });
    await prisma.employee_profiles.update({ where: { user_id: guide.user_id }, data: { status: 'inactive' } });
    status(await request('/admin/workforce/me', guide.token), 403);
    await prisma.employee_profiles.update({ where: { user_id: guide.user_id }, data: { status: 'active' } });
    const raceDuty = { user_id: page.user_id, duty_type: 'page', region_code: 'south', starts_at: new Date(Date.now() + 3 * 86400000).toISOString(), ends_at: new Date(Date.now() + 4 * 86400000).toISOString() };
    const shiftRace = await Promise.all([request('/admin/workforce/shifts', admin.token, 'POST', raceDuty), request('/admin/workforce/shifts', admin.token, 'POST', raceDuty)]);
    assert.deepEqual(shiftRace.map(row => row.status).sort(), [201, 409]); passed++;
    const location = await prisma.locations.findFirst({ where: { name: { contains: 'Cần Thơ' } } }) || await prisma.locations.findFirstOrThrow();
    const transport = await prisma.transports.findFirstOrThrow();
    const tour = await prisma.tours.create({ data: { code: key, name: 'Tour kiểm thử nhân sự — Cần Thơ đi Đà Lạt', description: 'Dữ liệu tạm để kiểm tra giao diện, sẽ được xóa sau kiểm thử.', duration_days: 2, duration_nights: 1, departure_location: location.location_id, transport_id: transport.transport_id } });
    tourIds.push(tour.tour_id);
    const start = new Date(Date.now() + 14 * 86400000); start.setUTCHours(1, 0, 0, 0);
    const end = new Date(start.getTime() + 86400000);
    const scheduleData = { tour_id: tour.tour_id, start_date: start, end_date: end, price: 2000000, quota: 25, departure_location_id: location.location_id, operating_region: 'south' };
    const first = await prisma.tour_schedules.create({ data: { ...scheduleData, code: `${key}-A` } });
    const second = await prisma.tour_schedules.create({ data: { ...scheduleData, code: `${key}-B` } });
    const raceCrew = { assignments: [{ roles: ['guide'], user_id: guide.user_id, report_at: start.toISOString(), release_at: end.toISOString() }, { roles: ['tour_leader'], user_id: leader.user_id, report_at: start.toISOString(), release_at: end.toISOString() }] };
    const crewRace = await Promise.all([request(`/admin/workforce/schedules/${first.tour_schedule_id}/crew`, admin.token, 'PUT', raceCrew), request(`/admin/workforce/schedules/${second.tour_schedule_id}/crew`, admin.token, 'PUT', raceCrew)]);
    assert.deepEqual(crewRace.map(row => row.status).sort(), [200, 409]); passed++;
    const schedule = crewRace[0].status === 200 ? first : second;
    const crew = await prisma.schedule_crew.findMany({ where: { tour_schedule_id: schedule.tour_schedule_id } });
    for (const member of crew) status(await request(`/admin/workforce/assignments/${member.assignment_id}/respond`, member.roles.includes('guide') ? guide.token : leader.token, 'POST', { action: 'confirm' }), 201);
    const ready = await request('/admin/workforce/schedules', admin.token);
    assert.equal(ready.data.find(row => row.tour_schedule_id === schedule.tour_schedule_id).crew_ready, true); passed++;
    await prisma.accounts.update({ where: { account_id: guide.account_id }, data: { status: 0 } });
    const revoked = await request('/admin/workforce/schedules', admin.token);
    assert.equal(revoked.data.find(row => row.tour_schedule_id === schedule.tour_schedule_id).crew_ready, false); passed++;
    await prisma.accounts.update({ where: { account_id: guide.account_id }, data: { status: 1 } });
    const other = schedule.tour_schedule_id === first.tour_schedule_id ? second : first;
    const solo = { crew_required_count: 1, assignments: [{ roles: ['tour_leader', 'guide'], user_id: dual.user_id, report_at: start.toISOString(), release_at: end.toISOString() }] };
    status(await request(`/admin/workforce/schedules/${other.tour_schedule_id}/crew`, admin.token, 'PUT', solo), 200);
    let flexible = (await request('/admin/workforce/schedules', admin.token)).data.find(row => row.tour_schedule_id === other.tour_schedule_id);
    assert.equal(flexible.crew.length, 1); assert.equal(flexible.crew_ready, false); passed++;
    status(await request(`/admin/workforce/assignments/${flexible.crew[0].assignment_id}/respond`, dual.token, 'POST', { action: 'confirm' }), 201);
    flexible = (await request('/admin/workforce/schedules', admin.token)).data.find(row => row.tour_schedule_id === other.tour_schedule_id);
    assert.equal(flexible.crew_ready, true); assert.equal(flexible.crew_confirmed_count, 1); passed++;
    status(await request(`/admin/workforce/schedules/${other.tour_schedule_id}/crew`, admin.token, 'PUT', { ...solo, crew_required_count: 3, override_reason: 'Kiểm thử điều chỉnh số lượng' }), 200);
    flexible = (await request('/admin/workforce/schedules', admin.token)).data.find(row => row.tour_schedule_id === other.tour_schedule_id);
    assert.equal(flexible.crew_ready, false); assert.equal(flexible.crew_confirmed_count, 1); passed++;
    const triple = { override_reason: 'Kiểm thử bổ sung nhân sự', crew_required_count: 3, assignments: [...solo.assignments, ...[extraGuide, page].map(user => ({ roles: user.user_id === extraGuide.user_id ? ['deputy_leader', 'guide'] : ['guide'], user_id: user.user_id, report_at: start.toISOString(), release_at: end.toISOString() }))] };
    status(await request(`/admin/workforce/schedules/${other.tour_schedule_id}/crew`, admin.token, 'PUT', triple), 200);
    flexible = (await request('/admin/workforce/schedules', admin.token)).data.find(row => row.tour_schedule_id === other.tour_schedule_id);
    for (const user of [extraGuide, page]) status(await request(`/admin/workforce/assignments/${flexible.crew.find(item => item.user_id === user.user_id).assignment_id}/respond`, user.token, 'POST', { action: 'confirm' }), 201);
    flexible = (await request('/admin/workforce/schedules', admin.token)).data.find(row => row.tour_schedule_id === other.tour_schedule_id);
    assert.equal(flexible.crew_ready, true); assert.equal(flexible.crew.length, 3); assert.equal(flexible.crew_confirmed_count, 3); passed++;
    assert.deepEqual(flexible.crew.find(item => item.user_id === extraGuide.user_id).roles, ['deputy_leader', 'guide']); passed++;
    const customer = await prisma.users.create({ data: { full_name: `Khách kiểm thử chat ${key}`, accounts: { create: { email: `${key}-customer@example.invalid`, email_verified: true } } } });
    userIds.push(customer.user_id);
    const conversation = await prisma.conversations.create({ data: { user_id: customer.user_id, status: 'IN_PROGRESS', region_code: 'north', assigned_staff_id: admin.user_id, handover_note: 'Legacy routing metadata' } });
    const sharedChats = await request('/chat/conversations', page.token);
    status(sharedChats, 200);
    assert.ok(sharedChats.data.some(row => row.conversation_id === conversation.conversation_id)); passed++;
    status(await request(`/chat/conversations/${conversation.conversation_id}/messages`, page.token), 200);
    status(await request(`/chat/conversations/${conversation.conversation_id}/manage`, page.token, 'POST', { action: 'claim' }), 400);
    const customerToken = jwt.sign({ sub: customer.user_id, accountId: customer.account_id, isStaff: false }, { expiresIn: '30m' });
    status(await request(`/chat/conversations/${conversation.conversation_id}/messages`, customerToken), 200);
    const ownChats = await request('/chat/conversations', customerToken);
    assert.ok(ownChats.data.length === 1 && ownChats.data[0].user_id === customer.user_id); passed++;
    status(await request(`/chat/conversations/${conversation.conversation_id}/manage`, customerToken, 'POST', { action: 'close' }), 403);
    console.log(`Passed ${passed} HTTP login, shared-chat, access-control and revocation checks.`);
    if (process.argv.includes('--preview')) {
      const payload = { assignments: [{ roles: ['guide'], user_id: guide.user_id, report_at: new Date(start.getTime() - 86400000).toISOString(), release_at: end.toISOString(), note: 'Có mặt tại Cần Thơ trước ngày khởi hành.' }, { roles: ['tour_leader'], user_id: leader.user_id, report_at: start.toISOString(), release_at: end.toISOString() }] };
      status(await request(`/admin/workforce/schedules/${schedule.tour_schedule_id}/crew`, admin.token, 'PUT', payload), 200);
      const assigned = await prisma.schedule_crew.findFirstOrThrow({ where: { tour_schedule_id: schedule.tour_schedule_id, user_id: guide.user_id } });
      status(await request(`/admin/workforce/assignments/${assigned.assignment_id}/respond`, guide.token, 'POST', { action: 'confirm' }), 201);
      console.log(`UI preview ready: ${admin.accounts.email} / ${password}`);
      console.log(`Shared chat preview: ${page.accounts.email}; customer ${customer.full_name}. No active page shift is required.`);
      console.log(`Preview tour ${tour.tour_id}; send Enter to clean up all fixtures.`);
      await new Promise(resolve => {
        const keepAlive = setInterval(() => {}, 1000);
        const finish = () => { clearInterval(keepAlive); resolve(); };
        process.stdin.once('data', finish); process.once('SIGINT', finish); process.once('SIGTERM', finish);
      });
      process.stdin.pause();
    }
  } finally { await cleanup(); await prisma.$disconnect(); }
  console.log('Temporary HTTP/UI test accounts and records removed.');
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
