const { resolve } = require('node:path');
const { readFileSync } = require('node:fs');
require('dotenv').config({ path: resolve(__dirname, '../.env'), quiet: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const sql = readFileSync(resolve(__dirname, '../packages/database/prisma/migrations/202611030004_vnpay_attempts/migration.sql'), 'utf8');
prisma.$transaction(async tx => {
  for (const statement of sql.split(';')) if (statement.trim()) await tx.$executeRawUnsafe(statement);
}).then(() => console.log('VNPay payment references and callback fields are ready. Existing payments were preserved.'))
  .catch(() => { console.error('Unable to update payment fields. Check PostgreSQL and DATABASE_URL.'); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
