-- Preserve every existing schedule's departure independently of its tour default.
ALTER TABLE "tour_schedules" ADD COLUMN IF NOT EXISTS "departure_location_id" INTEGER;
UPDATE "tour_schedules" s SET "departure_location_id" = t."departure_location"
FROM "tours" t WHERE s."tour_id" = t."tour_id" AND s."departure_location_id" IS NULL;
ALTER TABLE "tour_schedules" ALTER COLUMN "departure_location_id" SET NOT NULL;
ALTER TABLE "tour_schedules" ADD CONSTRAINT "tour_schedules_departure_location_id_fkey"
FOREIGN KEY ("departure_location_id") REFERENCES "locations"("location_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
CREATE INDEX "idx_schedules_departure" ON "tour_schedules"("departure_location_id", "status", "start_date");

CREATE TABLE "schedule_pickup_points" (
  "pickup_point_id" SERIAL PRIMARY KEY,
  "tour_schedule_id" INTEGER NOT NULL REFERENCES "tour_schedules"("tour_schedule_id") ON DELETE CASCADE ON UPDATE CASCADE,
  "name" VARCHAR(150) NOT NULL,
  "address" VARCHAR(500) NOT NULL,
  "pickup_at" TIMESTAMP(6) NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "note" VARCHAR(1000)
);
CREATE INDEX "schedule_pickup_points_tour_schedule_id_sort_order_idx" ON "schedule_pickup_points"("tour_schedule_id", "sort_order");
ALTER TABLE "bookings" ADD COLUMN "pickup_point_id" INTEGER,
ADD COLUMN "pickup_snapshot" JSONB, ADD COLUMN "departure_name" VARCHAR(255);
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_pickup_point_id_fkey"
FOREIGN KEY ("pickup_point_id") REFERENCES "schedule_pickup_points"("pickup_point_id") ON DELETE SET NULL ON UPDATE CASCADE;
UPDATE "bookings" b SET "departure_name" = l."name"
FROM "tour_schedules" s JOIN "locations" l ON l."location_id" = s."departure_location_id"
WHERE b."tour_schedule_id" = s."tour_schedule_id";
