ALTER TABLE "bookings"
  ADD COLUMN "room_selection" JSONB,
  ADD COLUMN "contact_id_card" VARCHAR(32),
  ADD COLUMN "cancellation_meta" JSONB;

-- Preserve legacy technical-note content for the one-time application backfill.
-- The application parser remains available to read older rows during rollout.
