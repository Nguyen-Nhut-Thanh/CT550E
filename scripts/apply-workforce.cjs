const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
require('dotenv').config({ path: resolve(__dirname, '../.env'), quiet: true });
require('dotenv').config({ path: resolve(__dirname, '../apps/api/.env'), quiet: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(73129, 3)`;
    const [state] = await tx.$queryRaw`SELECT
      to_regclass('public.employee_profiles') IS NOT NULL AS employees,
      to_regclass('public.staff_shifts') IS NOT NULL AS shifts,
      to_regclass('public.schedule_crew') IS NOT NULL AS crew,
      to_regclass('public.workforce_events') IS NOT NULL AS events,
      EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tour_schedules' AND column_name = 'operating_region') AS region,
      EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'conversations' AND column_name = 'handover_note') AS handover`;
    const values = Object.values(state);
    if (values.every(Boolean)) { console.log('Workforce schema is already installed.'); return; }
    if (values.some(Boolean)) throw new Error('Partial workforce schema; inspect the database before retrying.');
    const sql = readFileSync(resolve(__dirname, '../packages/database/prisma/migrations/202610290003_workforce/migration.sql'), 'utf8');
    for (const statement of sql.split(';').map(value => value.trim()).filter(Boolean)) await tx.$executeRawUnsafe(statement);
    console.log('Installed regional workforce, page shifts, crew assignments and audit history. Existing staff access was preserved.');
  }, { timeout: 30000 });
}
main().catch(error => { console.error('Could not install workforce schema.', error.code || error.constructor.name); process.exitCode = 1; }).finally(() => prisma.$disconnect());
