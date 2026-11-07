const assert = require('node:assert/strict');
const { resolve } = require('node:path');
require('dotenv').config({ path: resolve(__dirname, '../.env'), quiet: true });
const { PrismaClient } = require('@prisma/client');
const { JwtService } = require('@nestjs/jwt');
const { getJwtSecret } = require('../apps/api/dist/config/jwt');
const prisma = new PrismaClient();
const jwt = new JwtService({ secret: getJwtSecret() });
const base = `http://127.0.0.1:${process.env.API_PORT || 4000}`;
const denied = 'Bạn không có quyền quản lý nội dung này.';
const key = `ACCESS${Date.now()}`;
const users = [], schedules = [];
let tourId;
let checks = 0;
async function request(path, token, method = 'GET', body) {
  const response = await fetch(`${base}${path}`, { method, signal: AbortSignal.timeout(15000), headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return { status: response.status, data: await response.json() };
}
function status(result, expected) { assert.equal(result.status, expected, `Expected ${expected}, got ${result.status}: ${JSON.stringify(result.data)}`); checks++; }
async function person(role) {
  const row = await prisma.roles.findFirstOrThrow({ where: { name: role } });
  const user = await prisma.users.create({ data: { full_name: `${key} ${role}`, is_staff: true,
    accounts: { create: { email: `${key}-${role}@example.invalid`, status: 1 } },
    employee_profile: { create: { employee_code: `${key}-${users.length}`, position: 'Kiểm thử quyền', primary_region: 'north', regions: ['north'] } },
    role_users: { create: { role_id: row.role_id } },
  } });
  users.push(user);
  return { ...user, token: jwt.sign({ sub: user.user_id, accountId: user.account_id, isStaff: true }, { expiresIn: '5m' }) };
}
async function cleanup() {
  await prisma.$transaction(async tx => {
    if (schedules.length) {
      await tx.workforce_events.deleteMany({ where: { tour_schedule_id: { in: schedules } } });
      await tx.schedule_crew.deleteMany({ where: { tour_schedule_id: { in: schedules } } });
      await tx.tour_schedules.deleteMany({ where: { tour_schedule_id: { in: schedules } } });
    }
    if (tourId) await tx.tours.delete({ where: { tour_id: tourId } });
    const ids = users.map(user => user.user_id);
    if (ids.length) {
      await tx.workforce_events.deleteMany({ where: { actor_user_id: { in: ids } } });
      await tx.role_users.deleteMany({ where: { user_id: { in: ids } } });
      await tx.employee_profiles.deleteMany({ where: { user_id: { in: ids } } });
      await tx.users.deleteMany({ where: { user_id: { in: ids } } });
      await tx.accounts.deleteMany({ where: { account_id: { in: users.map(user => user.account_id) } } });
    }
  });
}
async function main() {
  try {
    const manager = await person('region_manager');
    const guide = await person('guide');
    for (const path of ['/admin/tours', '/admin/users', '/bookings/admin/list', '/admin/locations', '/admin/marketing/vouchers', '/admin/posts', '/banners/admin', '/admin/catalogs/hotels']) {
      status(await request(path, manager.token), 200);
    }
    status(await request('/admin/tours', guide.token), 403);
    status(await request('/admin/workforce/schedules', guide.token), 200);
    const location = await prisma.locations.findFirstOrThrow();
    const transport = await prisma.transports.findFirstOrThrow();
    const tour = await prisma.tours.create({ data: { code: key, name: key, description: 'Temporary permission fixture', duration_days: 2, departure_location: location.location_id, transport_id: transport.transport_id } });
    tourId = tour.tour_id;
    const start = new Date(Date.now() + 15 * 86400000), end = new Date(start.getTime() + 86400000);
    for (const region of ['north', 'south']) {
      // Inactive fixtures cannot be published by the periodic finalization job.
      const schedule = await prisma.tour_schedules.create({ data: { tour_id: tourId, departure_location_id: location.location_id, start_date: start, end_date: end, price: 1000000, quota: 10, operating_region: region, status: 0 } });
      schedules.push(schedule.tour_schedule_id);
    }
    const southern = await request('/admin/workforce/schedules?region=south', manager.token);
    status(southern, 200);
    assert.ok(southern.data.some(row => row.tour_schedule_id === schedules[1])); checks++;
    const deniedCrew = await request(`/admin/workforce/schedules/${schedules[1]}/crew`, manager.token, 'PUT', { assignments: [] });
    status(deniedCrew, 403); assert.ok(deniedCrew.data.message.includes(denied)); checks++;
    status(await request(`/admin/workforce/schedules/${schedules[0]}/crew`, manager.token, 'PUT', { assignments: [] }), 200);
    const deniedTour = await request(`/admin/tours/${tourId}`, manager.token, 'PATCH', { name: 'Must not change' });
    status(deniedTour, 403); assert.equal(deniedTour.data.message, denied); checks++;
    assert.equal((await prisma.tours.findUniqueOrThrow({ where: { tour_id: tourId } })).name, key); checks++;
    status(await request('/admin/membership/settings', manager.token, 'PATCH', { tiers: [] }), 403);
    await prisma.accounts.update({ where: { account_id: manager.account_id }, data: { status: 0 } });
    status(await request('/admin/tours', manager.token), 401);
    console.log(`Passed ${checks} HTTP permission checks. All fixtures removed; no notifications or emails sent.`);
  } finally { await cleanup(); }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
