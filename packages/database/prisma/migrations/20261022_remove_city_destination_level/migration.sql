BEGIN;

LOCK TABLE locations, tour_destinations, hotels, tours,
  destinations_detail, location_images, geographic_levels
  IN SHARE ROW EXCLUSIVE MODE;

-- Capture the obsolete cities before level 6 becomes the attraction level.
-- An already-migrated database must not delete its new level-6 attractions.
CREATE TEMP TABLE removed_city_locations ON COMMIT DROP AS
SELECT location_id, parent_id AS province_id
FROM locations
WHERE level_id = 6
  AND EXISTS (
    SELECT 1 FROM geographic_levels
    WHERE level_id = 6 AND name <> 'Attraction'
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM removed_city_locations removed
    LEFT JOIN locations province ON province.location_id = removed.province_id
    WHERE province.location_id IS NULL OR province.level_id <> 5
  ) THEN
    RAISE EXCEPTION 'Cannot remove city level: a city has no valid province parent';
  END IF;
  IF EXISTS (
    SELECT 1 FROM locations child
    JOIN removed_city_locations removed ON child.parent_id = removed.location_id
    WHERE child.level_id <> 7
  ) THEN
    RAISE EXCEPTION 'Cannot remove city level: unexpected child location level';
  END IF;
END $$;

-- Preserve attraction records and their IDs, linking them directly to provinces.
UPDATE locations child
SET parent_id = removed.province_id, updated_at = CURRENT_TIMESTAMP
FROM removed_city_locations removed
WHERE child.parent_id = removed.location_id;

-- Keep tour associations, avoiding duplicate (tour, province) keys.
INSERT INTO tour_destinations (tour_id, location_id, visit_order, note)
SELECT DISTINCT ON (destination.tour_id, removed.province_id)
  destination.tour_id, removed.province_id,
  destination.visit_order, destination.note
FROM tour_destinations destination
JOIN removed_city_locations removed ON destination.location_id = removed.location_id
ORDER BY destination.tour_id, removed.province_id,
  destination.visit_order, destination.location_id
ON CONFLICT (tour_id, location_id) DO NOTHING;

DELETE FROM tour_destinations destination
USING removed_city_locations removed
WHERE destination.location_id = removed.location_id;

UPDATE hotels hotel
SET location_id = removed.province_id, updated_at = CURRENT_TIMESTAMP
FROM removed_city_locations removed
WHERE hotel.location_id = removed.location_id;

UPDATE tours tour
SET departure_location = removed.province_id, updated_at = CURRENT_TIMESTAMP
FROM removed_city_locations removed
WHERE tour.departure_location = removed.location_id;

-- The user requested deletion of the old city records and their own content.
DELETE FROM destinations_detail detail
USING removed_city_locations removed
WHERE detail.location_id = removed.location_id;

DELETE FROM location_images image
USING removed_city_locations removed
WHERE image.location_id = removed.location_id;

DELETE FROM locations location
USING removed_city_locations removed
WHERE location.location_id = removed.location_id;

UPDATE locations
SET level_id = 6, location_type = 'attraction', updated_at = CURRENT_TIMESTAMP
WHERE level_id = 7;

DELETE FROM geographic_levels WHERE level_id = 7;

UPDATE geographic_levels
SET name = 'Attraction', description = 'Địa điểm tham quan',
  updated_at = CURRENT_TIMESTAMP
WHERE level_id = 6;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM locations attraction
    LEFT JOIN locations province ON province.location_id = attraction.parent_id
    WHERE attraction.level_id = 6
      AND (province.location_id IS NULL OR province.level_id <> 5)
  ) THEN
    RAISE EXCEPTION 'Attractions must belong directly to a province';
  END IF;
END $$;

COMMIT;
