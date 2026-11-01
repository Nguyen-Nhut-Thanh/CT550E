INSERT INTO "roles" ("name", "description") VALUES ('deputy_leader', 'Phó đoàn hỗ trợ điều hành chuyến đi')
ON CONFLICT ("name") DO NOTHING;
ALTER TABLE "schedule_crew" DROP CONSTRAINT IF EXISTS "schedule_crew_roles_check";
ALTER TABLE "schedule_crew" ADD CONSTRAINT "schedule_crew_roles_check" CHECK (
  "roles" <@ ARRAY['tour_leader','deputy_leader','guide']::TEXT[] AND
  cardinality("roles") BETWEEN 1 AND 3 AND
  array_position("roles", NULL) IS NULL AND
  cardinality(array_positions("roles", 'tour_leader')) <= 1 AND
  cardinality(array_positions("roles", 'deputy_leader')) <= 1 AND
  cardinality(array_positions("roles", 'guide')) <= 1
);
