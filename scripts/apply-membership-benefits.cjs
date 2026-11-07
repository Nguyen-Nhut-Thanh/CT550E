const { resolve } = require('node:path');
require('dotenv').config({ path: resolve(__dirname, '../.env'), quiet: true });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$executeRawUnsafe('ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "membership_snapshot" JSONB')
  .then(() => console.log('Membership booking snapshot is ready. Existing bookings were preserved.'))
  .catch(error => { console.error(error.message); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
