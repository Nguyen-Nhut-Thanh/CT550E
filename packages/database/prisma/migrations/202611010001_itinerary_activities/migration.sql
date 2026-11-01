CREATE TABLE "itinerary_activities" (
  "activity_id" SERIAL PRIMARY KEY,
  "tour_itinerary_id" INTEGER NOT NULL REFERENCES "tour_itineraries"("tour_itinerary_id") ON DELETE CASCADE ON UPDATE CASCADE,
  "location_id" INTEGER REFERENCES "locations"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "time" VARCHAR(5) NOT NULL,
  "title" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "sort_order" INTEGER NOT NULL,
  CONSTRAINT "itinerary_activities_time_check" CHECK ("time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  CONSTRAINT "itinerary_activities_tour_itinerary_id_sort_order_key" UNIQUE ("tour_itinerary_id", "sort_order")
);
CREATE INDEX "itinerary_activities_location_id_idx" ON "itinerary_activities"("location_id");
