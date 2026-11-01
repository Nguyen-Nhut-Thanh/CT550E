CREATE TABLE "employee_profiles" (
  "user_id" INTEGER PRIMARY KEY REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE CASCADE,
  "employee_code" VARCHAR(30) NOT NULL UNIQUE,
  "position" VARCHAR(100) NOT NULL,
  "primary_region" VARCHAR(10) CHECK ("primary_region" IN ('north','central','south')),
  "regions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[] CHECK ("regions" <@ ARRAY['north','central','south']::TEXT[]),
  "employment_type" VARCHAR(20) NOT NULL DEFAULT 'full_time' CHECK ("employment_type" IN ('full_time','contractor')),
  "status" VARCHAR(20) NOT NULL DEFAULT 'active' CHECK ("status" IN ('active','inactive')),
  "languages" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "note" VARCHAR(2000), "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "employee_profiles" ("user_id", "employee_code", "position")
SELECT u."user_id", COALESCE(p."employee_code", 'EMP-' || u."user_id"), COALESCE(p."position", 'Quản trị viên')
FROM "users" u LEFT JOIN LATERAL (
  SELECT "employee_code", "position" FROM "staff_profiles" WHERE "user_id" = u."user_id" ORDER BY "staff_id" LIMIT 1
) p ON TRUE WHERE u."is_staff" = TRUE;

INSERT INTO "roles" ("name", "description") VALUES
('admin', 'Quản trị toàn hệ thống'), ('region_manager', 'Quản lý nhân sự và điều hành theo miền'),
('page_staff', 'Trực page và tư vấn khách hàng'), ('guide', 'Hướng dẫn viên'), ('tour_leader', 'Trưởng đoàn')
ON CONFLICT ("name") DO NOTHING;
-- Existing staff had unrestricted administration before this migration. Preserve that access.
INSERT INTO "role_users" ("user_id", "role_id")
SELECT u."user_id", r."role_id" FROM "users" u CROSS JOIN "roles" r
WHERE u."is_staff" = TRUE AND r."name" = 'admin' ON CONFLICT DO NOTHING;

CREATE TABLE "staff_shifts" (
  "shift_id" SERIAL PRIMARY KEY, "user_id" INTEGER NOT NULL REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE CASCADE,
  "duty_type" VARCHAR(10) NOT NULL DEFAULT 'page' CHECK ("duty_type" IN ('page','leave')),
  "region_code" VARCHAR(10) CHECK ("region_code" IN ('north','central','south')),
  "starts_at" TIMESTAMP(6) NOT NULL, "ends_at" TIMESTAMP(6) NOT NULL,
  "status" VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK ("status" IN ('scheduled','cancelled')),
  "note" VARCHAR(1000), "created_by" INTEGER NOT NULL, "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ("ends_at" > "starts_at"), CHECK ("duty_type" <> 'page' OR "region_code" IS NOT NULL)
);
CREATE INDEX "staff_shifts_user_id_starts_at_ends_at_idx" ON "staff_shifts"("user_id", "starts_at", "ends_at");
CREATE INDEX "staff_shifts_region_code_starts_at_ends_at_idx" ON "staff_shifts"("region_code", "starts_at", "ends_at");
ALTER TABLE "tour_schedules" ADD COLUMN "operating_region" VARCHAR(10) CHECK ("operating_region" IN ('north','central','south'));
CREATE TABLE "schedule_crew" (
  "assignment_id" SERIAL PRIMARY KEY,
  "tour_schedule_id" INTEGER NOT NULL REFERENCES "tour_schedules"("tour_schedule_id") ON DELETE CASCADE ON UPDATE CASCADE,
  "user_id" INTEGER NOT NULL REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE CASCADE,
  "role" VARCHAR(20) NOT NULL CHECK ("role" IN ('guide','tour_leader')),
  "status" VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending','confirmed','declined','completed')),
  "report_at" TIMESTAMP(6) NOT NULL, "release_at" TIMESTAMP(6) NOT NULL,
  "note" VARCHAR(1000), "response_note" VARCHAR(1000), "confirmed_at" TIMESTAMP(6),
  "assigned_by" INTEGER NOT NULL, "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ("release_at" > "report_at")
);
CREATE UNIQUE INDEX "schedule_crew_tour_schedule_id_role_key" ON "schedule_crew"("tour_schedule_id", "role");
CREATE INDEX "schedule_crew_user_id_status_report_at_release_at_idx" ON "schedule_crew"("user_id", "status", "report_at", "release_at");
CREATE TABLE "workforce_events" (
  "event_id" SERIAL PRIMARY KEY, "actor_user_id" INTEGER NOT NULL, "target_user_id" INTEGER,
  "tour_schedule_id" INTEGER, "region_code" VARCHAR(10), "action" VARCHAR(50) NOT NULL,
  "details" JSONB NOT NULL, "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "workforce_events_region_code_created_at_idx" ON "workforce_events"("region_code", "created_at");
CREATE INDEX "workforce_events_tour_schedule_id_created_at_idx" ON "workforce_events"("tour_schedule_id", "created_at");
ALTER TABLE "conversations" ADD COLUMN "region_code" VARCHAR(10) CHECK ("region_code" IN ('north','central','south')),
ADD COLUMN "handover_note" VARCHAR(1000);
