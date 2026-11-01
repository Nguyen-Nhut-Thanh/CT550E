const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
require('dotenv').config({ path: resolve(__dirname, '../.env'), quiet: true });
require('dotenv').config({ path: resolve(__dirname, '../apps/api/.env'), quiet: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(73129, 5)`;
    const sql = readFileSync(resolve(__dirname, '../packages/database/prisma/migrations/202610300002_deputy_leader/migration.sql'), 'utf8');
    for (const statement of sql.split(';').map(value => value.trim()).filter(Boolean)) await tx.$executeRawUnsafe(statement);
    console.log('Installed optional deputy leader role. Existing employees and assignments were preserved.');
  }, { timeout: 30000 });
}
main().catch(error => { console.error('Could not install deputy leader role.', error.code || error.message); process.exitCode = 1; }).finally(() => prisma.$disconnect());
