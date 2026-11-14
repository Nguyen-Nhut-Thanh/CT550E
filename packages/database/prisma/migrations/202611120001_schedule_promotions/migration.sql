CREATE TABLE IF NOT EXISTS "schedule_promotions" (
    "promotion_id" SERIAL NOT NULL,
    "tour_schedule_id" INTEGER NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "discount_type" VARCHAR(20) NOT NULL DEFAULT 'percentage',
    "discount_value" DECIMAL(12,2) NOT NULL,
    "max_slots" INTEGER,
    "used_slots" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(6) NOT NULL,
    "end_date" TIMESTAMP(6) NOT NULL,
    "gift_description" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_promotions_pkey" PRIMARY KEY ("promotion_id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "schedule_promotions_tour_schedule_id_key" ON "schedule_promotions"("tour_schedule_id");
CREATE INDEX IF NOT EXISTS "idx_schedule_promotions_active" ON "schedule_promotions"("is_active", "start_date", "end_date");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'schedule_promotions_tour_schedule_id_fkey'
    ) THEN
        ALTER TABLE "schedule_promotions" ADD CONSTRAINT "schedule_promotions_tour_schedule_id_fkey" FOREIGN KEY ("tour_schedule_id") REFERENCES "tour_schedules"("tour_schedule_id") ON DELETE CASCADE ON UPDATE NO ACTION;
    END IF;
END $$;

