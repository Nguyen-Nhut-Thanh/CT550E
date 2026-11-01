ALTER TABLE "tour_schedules" ADD COLUMN "crew_required_count" INTEGER NOT NULL DEFAULT 1
  CHECK ("crew_required_count" >= 1);
ALTER TABLE "schedule_crew" ADD COLUMN "roles" TEXT[];
UPDATE "schedule_crew" SET "roles" = ARRAY["role"];
ALTER TABLE "schedule_crew" ALTER COLUMN "roles" SET NOT NULL;
ALTER TABLE "schedule_crew" ADD CONSTRAINT "schedule_crew_roles_check" CHECK (
  "roles" <@ ARRAY['tour_leader','guide']::TEXT[] AND
  cardinality("roles") BETWEEN 1 AND 2 AND
  array_position("roles", NULL) IS NULL AND
  (cardinality("roles") = 1 OR "roles"[1] <> "roles"[2])
);
DROP INDEX "schedule_crew_tour_schedule_id_role_key";
ALTER TABLE "schedule_crew" DROP COLUMN "role";
CREATE UNIQUE INDEX "schedule_crew_tour_schedule_id_user_id_key" ON "schedule_crew"("tour_schedule_id", "user_id");
