const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
require('dotenv').config({ path: resolve(__dirname, '../.env'), quiet: true });
require('dotenv').config({ path: resolve(__dirname, '../apps/api/.env'), quiet: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(73129, 11)`;
    const sql = readFileSync(resolve(__dirname, '../packages/database/prisma/migrations/202611020003_itinerary_drafts/migration.sql'), 'utf8');
    await tx.$executeRawUnsafe(sql);
    console.log('Itinerary draft storage is ready. Existing day content is preserved.');
  });
}
main().catch(error => { console.error('Could not install itinerary draft storage.', error.code || error.constructor.name); process.exitCode = 1; }).finally(() => prisma.$disconnect());
