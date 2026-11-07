DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tour_schedules' AND column_name='operating_region_source') THEN
    ALTER TABLE "tour_schedules" ADD COLUMN "operating_region_source" VARCHAR(20) NOT NULL DEFAULT 'departure';
    UPDATE "tour_schedules" SET "operating_region_source"='admin' WHERE "operating_region" IS NOT NULL;
  END IF;
END $$;
-- statement
ALTER TABLE "tour_schedules"
  ADD COLUMN IF NOT EXISTS "crew_locked_at" TIMESTAMP(6),
  ADD COLUMN IF NOT EXISTS "crew_locked_by" INTEGER,
  ADD COLUMN IF NOT EXISTS "crew_revision" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "crew_snapshot" JSONB;
-- statement
WITH RECURSIVE tree AS (
  SELECT s.tour_schedule_id, l.location_id, l.parent_id, l.slug, ARRAY[l.location_id] AS path
  FROM tour_schedules s JOIN locations l ON l.location_id=s.departure_location_id WHERE s.operating_region IS NULL
  UNION ALL
  SELECT t.tour_schedule_id, l.location_id, l.parent_id, l.slug, t.path || l.location_id
  FROM tree t JOIN locations l ON l.location_id=t.parent_id WHERE NOT l.location_id=ANY(t.path) AND cardinality(t.path)<20
), regions AS (
  SELECT DISTINCT ON (tour_schedule_id) tour_schedule_id,
    CASE slug WHEN 'mien-bac' THEN 'north' WHEN 'mien-trung' THEN 'central' WHEN 'mien-nam' THEN 'south' END AS region
  FROM tree WHERE slug IN ('mien-bac','mien-trung','mien-nam') ORDER BY tour_schedule_id, cardinality(path)
)
UPDATE tour_schedules s SET operating_region=r.region FROM regions r WHERE s.tour_schedule_id=r.tour_schedule_id AND s.operating_region IS NULL;
-- statement
ALTER TABLE "membership_notifications" ADD COLUMN IF NOT EXISTS "booking_id" INTEGER;
-- statement
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='membership_notifications_booking_id_fkey' AND conrelid='membership_notifications'::regclass) THEN
    ALTER TABLE "membership_notifications" ADD CONSTRAINT "membership_notifications_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
-- statement
CREATE INDEX IF NOT EXISTS "membership_notifications_booking_id_idx" ON "membership_notifications"("booking_id");
