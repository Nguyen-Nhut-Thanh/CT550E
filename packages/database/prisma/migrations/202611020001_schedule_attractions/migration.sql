CREATE TABLE "tour_schedule_attractions" (
    "tour_schedule_id" INTEGER NOT NULL,
    "location_id" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "tour_schedule_attractions_pkey" PRIMARY KEY ("tour_schedule_id", "location_id"),
    CONSTRAINT "tour_schedule_attractions_schedule_fkey" FOREIGN KEY ("tour_schedule_id") REFERENCES "tour_schedules"("tour_schedule_id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tour_schedule_attractions_location_fkey" FOREIGN KEY ("location_id") REFERENCES "locations"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "tour_schedule_attractions_location_id_idx" ON "tour_schedule_attractions"("location_id");
INSERT INTO "tour_schedule_attractions" ("tour_schedule_id", "location_id", "sort_order")
SELECT "tour_schedule_id", "location_id", (ROW_NUMBER() OVER (PARTITION BY "tour_schedule_id" ORDER BY "first_day", "first_order", "location_id") - 1)::INTEGER
FROM (
    SELECT i."tour_schedule_id", a."location_id", MIN(i."day_number") AS "first_day", MIN(a."sort_order") AS "first_order"
    FROM "itinerary_activities" a
    JOIN "tour_itineraries" i ON i."tour_itinerary_id" = a."tour_itinerary_id"
    WHERE a."location_id" IS NOT NULL
    GROUP BY i."tour_schedule_id", a."location_id"
) existing;
