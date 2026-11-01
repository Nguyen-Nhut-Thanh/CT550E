const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
require('dotenv').config({ path: resolve(__dirname, '../.env'), quiet: true });
require('dotenv').config({ path: resolve(__dirname, '../apps/api/.env'), quiet: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(73129, 2)`;
    const [state] = await tx.$queryRaw`SELECT
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tour_schedules' AND column_name = 'departure_location_id') AS departure,
      to_regclass('public.schedule_pickup_points') IS NOT NULL AS pickups,
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'pickup_snapshot') AS snapshot`;
    const values = Object.values(state);
    if (values.every(Boolean)) {
      console.log('Schedule departures and pickup points are already installed.');
      return;
    }
    if (values.some(Boolean)) throw new Error('Partially installed departure schema. Review the database before retrying.');
    const sql = readFileSync(resolve(__dirname, '../packages/database/prisma/migrations/202610290002_schedule_departures/migration.sql'), 'utf8');
    for (const statement of sql.split(';').map(value => value.trim()).filter(Boolean)) {
      await tx.$executeRawUnsafe(statement);
    }
    console.log('Installed schedule departures and pickup points; existing schedules and bookings were preserved.');
  }, { timeout: 30000 });
}
main().catch(error => {
  // Prisma errors can contain connection details; keep CLI output bounded.
  console.error('Could not apply departure migration.', error.code || error.constructor.name);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
