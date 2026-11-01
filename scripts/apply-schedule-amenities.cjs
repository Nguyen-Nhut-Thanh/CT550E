const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
require('dotenv').config({ path: resolve(__dirname, '../.env'), quiet: true });
require('dotenv').config({ path: resolve(__dirname, '../apps/api/.env'), quiet: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(73129, 11)`;
    const [state] = await tx.$queryRaw`SELECT to_regclass('public.tour_schedule_amenities') IS NOT NULL AS installed`;
    if (state.installed) {
      console.log('Schedule amenities already installed; saved copies left unchanged.');
      return;
    }
    const sql = readFileSync(resolve(__dirname, '../packages/database/prisma/migrations/202611010004_schedule_amenities/migration.sql'), 'utf8');
    for (const statement of sql.split(';').map(value => value.trim()).filter(Boolean)) await tx.$executeRawUnsafe(statement);
    console.log('Installed schedule amenities and copied tour templates to existing departures.');
  }, { timeout: 30000 });
}
main().catch(error => {
  console.error('Could not apply schedule amenities migration.', error.code || error.constructor.name);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
