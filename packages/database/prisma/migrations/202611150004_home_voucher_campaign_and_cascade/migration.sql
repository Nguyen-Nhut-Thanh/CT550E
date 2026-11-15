-- CreateTable: home_voucher_campaign
CREATE TABLE IF NOT EXISTS "home_voucher_campaign" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "config" JSONB NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "home_voucher_campaign_pkey" PRIMARY KEY ("id")
);

-- Update foreign keys on tour_schedules child tables to ON DELETE CASCADE
DO $$
BEGIN
    -- tour_itineraries
    ALTER TABLE "tour_itineraries" DROP CONSTRAINT IF EXISTS "tour_itineraries_tour_schedule_id_fkey";
    ALTER TABLE "tour_itineraries" ADD CONSTRAINT "tour_itineraries_tour_schedule_id_fkey"
        FOREIGN KEY ("tour_schedule_id") REFERENCES "tour_schedules"("tour_schedule_id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- tour_schedule_hotels
    ALTER TABLE "tour_schedule_hotels" DROP CONSTRAINT IF EXISTS "tour_schedule_hotels_tour_schedule_id_fkey";
    ALTER TABLE "tour_schedule_hotels" ADD CONSTRAINT "tour_schedule_hotels_tour_schedule_id_fkey"
        FOREIGN KEY ("tour_schedule_id") REFERENCES "tour_schedules"("tour_schedule_id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- tour_schedule_prices
    ALTER TABLE "tour_schedule_prices" DROP CONSTRAINT IF EXISTS "tour_schedule_prices_tour_schedule_id_fkey";
    ALTER TABLE "tour_schedule_prices" ADD CONSTRAINT "tour_schedule_prices_tour_schedule_id_fkey"
        FOREIGN KEY ("tour_schedule_id") REFERENCES "tour_schedules"("tour_schedule_id") ON DELETE CASCADE ON UPDATE CASCADE;

    -- tour_schedule_transports
    ALTER TABLE "tour_schedule_transports" DROP CONSTRAINT IF EXISTS "tour_schedule_transports_tour_schedule_id_fkey";
    ALTER TABLE "tour_schedule_transports" ADD CONSTRAINT "tour_schedule_transports_tour_schedule_id_fkey"
        FOREIGN KEY ("tour_schedule_id") REFERENCES "tour_schedules"("tour_schedule_id") ON DELETE CASCADE ON UPDATE CASCADE;
END $$;

