const { resolve } = require('node:path');
const { readFileSync } = require('node:fs');
require('dotenv').config({ path: resolve(__dirname, '../.env'), quiet: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const sql = readFileSync(resolve(__dirname, '../packages/database/prisma/migrations/202611030002_voucher_audiences/migration.sql'), 'utf8');
prisma.$transaction(async tx => {
  for (const statement of sql.split('-- statement')) if (statement.trim()) await tx.$executeRawUnsafe(statement);
}).then(() => console.log('Voucher audiences and notification links are ready. Existing voucher data was preserved.'))
  .catch(error => { console.error(error.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
