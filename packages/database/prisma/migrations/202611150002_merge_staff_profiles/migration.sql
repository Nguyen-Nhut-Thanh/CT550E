-- Consolidate the legacy multi-row staff profile table into the workforce
-- employee profile, which is already the canonical one-row-per-user record.
WITH legacy AS (
  SELECT DISTINCT ON (sp."user_id")
    sp."user_id", sp."employee_code", sp."position", sp."status"
  FROM "staff_profiles" sp
  ORDER BY sp."user_id", sp."staff_id"
), missing AS (
  SELECT l.*,
    CASE WHEN EXISTS (
      SELECT 1 FROM "employee_profiles" ep
      WHERE ep."employee_code" = l."employee_code" AND ep."user_id" <> l."user_id"
    ) THEN 'EMP-' || l."user_id"::text ELSE l."employee_code" END AS "safe_code"
  FROM legacy l
  LEFT JOIN "employee_profiles" ep ON ep."user_id" = l."user_id"
  WHERE ep."user_id" IS NULL
)
INSERT INTO "employee_profiles" ("user_id", "employee_code", "position", "status")
SELECT "user_id", "safe_code", "position", CASE WHEN "status" = 1 THEN 'active' ELSE 'inactive' END
FROM missing
ON CONFLICT ("user_id") DO NOTHING;

ALTER TABLE "staff_profiles" DROP CONSTRAINT IF EXISTS "staff_profiles_user_id_fkey";
DROP TABLE "staff_profiles";
