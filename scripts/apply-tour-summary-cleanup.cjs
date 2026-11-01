const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
require('dotenv').config({ path: resolve(__dirname, '../.env'), quiet: true });
require('dotenv').config({ path: resolve(__dirname, '../apps/api/.env'), quiet: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(73129, 10)`;
    const sql = readFileSync(resolve(__dirname, '../packages/database/prisma/migrations/202611010003_remove_sightseeing_summary/migration.sql'), 'utf8');
    await tx.$executeRawUnsafe(sql);
    const [state] = await tx.$queryRaw`SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'tours' AND column_name = 'sightseeing_summary'
    ) AS present`;
    if (state.present) throw new Error('Column still exists after migration.');
    console.log('Removed tours.sightseeing_summary; tours.summary is preserved.');
  }, { timeout: 30000 });
}
main().catch(error => {
  console.error('Could not remove sightseeing summary.', error.code || error.constructor.name);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
