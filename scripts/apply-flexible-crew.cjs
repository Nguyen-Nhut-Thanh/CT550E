const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
require('dotenv').config({ path: resolve(__dirname, '../.env'), quiet: true });
require('dotenv').config({ path: resolve(__dirname, '../apps/api/.env'), quiet: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(73129, 4)`;
    const [state] = await tx.$queryRaw`SELECT
      EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'tour_schedules' AND column_name = 'crew_required_count') AS requirement,
      EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedule_crew' AND column_name = 'roles') AS roles,
      EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'schedule_crew' AND column_name = 'role') AS legacy`;
    if (state.requirement && state.roles && !state.legacy) { console.log('Flexible crew schema is already installed.'); return; }
    if (state.requirement || state.roles || !state.legacy) throw new Error('Unexpected crew schema; inspect before applying.');
    const sql = readFileSync(resolve(__dirname, '../packages/database/prisma/migrations/202610300001_flexible_crew/migration.sql'), 'utf8');
    for (const statement of sql.split(';').map(value => value.trim()).filter(Boolean)) await tx.$executeRawUnsafe(statement);
    console.log('Installed flexible crew roles and per-trip staffing requirements. Existing assignments were preserved.');
  }, { timeout: 30000 });
}
main().catch(error => { console.error('Could not install flexible crew schema.', error.code || error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
