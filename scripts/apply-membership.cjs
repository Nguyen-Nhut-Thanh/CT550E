const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");
require("dotenv").config({ path: resolve(__dirname, "../.env"), quiet: true });
require("dotenv").config({
  path: resolve(__dirname, "../apps/api/.env"),
  quiet: true,
});
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(73129, 0)`;
    const [state] = await tx.$queryRaw`SELECT
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vouchers' AND column_name = 'owner_user_id') AS owner,
      EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vouchers' AND column_name = 'reward_key') AS reward,
      to_regclass('public.memberships') IS NOT NULL AS members,
      to_regclass('public.membership_notifications') IS NOT NULL AS notices,
      to_regclass('public.membership_program') IS NOT NULL AS program`;
    const values = Object.values(state);
    if (values.every(Boolean)) {
      console.log("Membership schema is already installed.");
      return;
    }
    if (values.some(Boolean))
      throw new Error(
        "Membership schema is partially installed. Review the database before applying this migration.",
      );
    const sql = readFileSync(
      resolve(
        __dirname,
        "../packages/database/prisma/migrations/202610290001_membership_rewards/migration.sql",
      ),
      "utf8",
    );
    for (const statement of sql
      .split(";")
      .map((value) => value.trim())
      .filter(Boolean))
      await tx.$executeRawUnsafe(statement);
    console.log(
      "Membership tables and private vouchers are ready. Existing bookings and vouchers were preserved.",
    );
  });
}
main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
