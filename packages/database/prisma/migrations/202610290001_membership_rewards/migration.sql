ALTER TABLE "vouchers" ADD COLUMN "owner_user_id" INTEGER, ADD COLUMN "reward_key" VARCHAR(150);
CREATE UNIQUE INDEX "vouchers_reward_key_key" ON "vouchers"("reward_key");
CREATE INDEX "vouchers_owner_user_id_idx" ON "vouchers"("owner_user_id");
ALTER TABLE "vouchers" ADD CONSTRAINT "vouchers_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "memberships" (
  "user_id" INTEGER PRIMARY KEY,
  "started_at" TIMESTAMP(6),
  "tier" VARCHAR(20) NOT NULL DEFAULT 'bronze',
  "cycle_start" TIMESTAMP(6),
  "cycle_end" TIMESTAMP(6),
  "spending" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMP(6) NOT NULL,
  CONSTRAINT "memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE "membership_notifications" (
  "notification_id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "event_key" VARCHAR(150) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "message" TEXT NOT NULL,
  "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "read_at" TIMESTAMP(6),
  CONSTRAINT "membership_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "membership_notifications_event_key_key" ON "membership_notifications"("event_key");
CREATE INDEX "membership_notifications_user_id_created_at_idx" ON "membership_notifications"("user_id", "created_at");
CREATE TABLE "membership_program" (
  "id" INTEGER PRIMARY KEY DEFAULT 1,
  "tiers" JSONB NOT NULL,
  "updated_at" TIMESTAMP(6) NOT NULL
);
