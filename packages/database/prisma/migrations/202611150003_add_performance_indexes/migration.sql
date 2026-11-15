-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_bookings_status_created" ON "bookings"("status", "created_at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_tours_status_type" ON "tours"("status", "tour_type");

