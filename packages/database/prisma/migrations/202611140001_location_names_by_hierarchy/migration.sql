-- Location names may legitimately repeat at different geographic levels
-- (for example, a region and a city with the same name).
ALTER TABLE locations DROP CONSTRAINT IF EXISTS locations_name_key;

-- Keep names unique among siblings at the same level. Application validation
-- also compares names case-insensitively and handles top-level locations.
CREATE UNIQUE INDEX IF NOT EXISTS uq_locations_level_parent_name
  ON locations (level_id, parent_id, name);
