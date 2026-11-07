ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "provider_reference" VARCHAR(100);
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "response_code" VARCHAR(2);
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "provider_status" VARCHAR(2);
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMP(6);
CREATE UNIQUE INDEX IF NOT EXISTS "payments_provider_reference_key" ON "payments"("provider_reference");
