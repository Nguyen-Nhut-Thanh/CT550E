ALTER TABLE "vouchers" ADD COLUMN IF NOT EXISTS "eligible_tiers" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
-- statement
ALTER TABLE "membership_notifications" ADD COLUMN IF NOT EXISTS "voucher_id" INTEGER;
-- statement
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'membership_notifications_voucher_id_fkey' AND conrelid = 'membership_notifications'::regclass) THEN
    ALTER TABLE "membership_notifications" ADD CONSTRAINT "membership_notifications_voucher_id_fkey" FOREIGN KEY ("voucher_id") REFERENCES "vouchers"("voucher_id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
-- statement
CREATE INDEX IF NOT EXISTS "membership_notifications_voucher_id_idx" ON "membership_notifications"("voucher_id");
