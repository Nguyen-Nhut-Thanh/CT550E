ALTER TABLE tour_schedules ADD COLUMN use_tour_amenities BOOLEAN NOT NULL DEFAULT TRUE;

CREATE TABLE tour_schedule_amenities (
    schedule_amenity_id SERIAL PRIMARY KEY,
    tour_schedule_id INTEGER NOT NULL REFERENCES tour_schedules(tour_schedule_id) ON DELETE CASCADE,
    source_amenity_id INTEGER REFERENCES tour_amenities(amenity_id) ON DELETE SET NULL,
    kind VARCHAR(30) NOT NULL,
    title VARCHAR(150) NOT NULL CHECK (length(btrim(title)) > 0),
    content TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT tour_schedule_amenities_kind_check CHECK (kind IN ('transport', 'hotel', 'cuisine', 'guide', 'insurance', 'water', 'best_time', 'best_for', 'promotion')),
    CONSTRAINT tour_schedule_amenities_tour_schedule_id_kind_key UNIQUE (tour_schedule_id, kind)
);
CREATE INDEX tour_schedule_amenities_tour_schedule_id_sort_order_idx ON tour_schedule_amenities(tour_schedule_id, sort_order);
CREATE INDEX tour_schedule_amenities_source_amenity_id_idx ON tour_schedule_amenities(source_amenity_id);

INSERT INTO tour_schedule_amenities (tour_schedule_id, source_amenity_id, kind, title, content, sort_order)
SELECT s.tour_schedule_id, a.amenity_id, a.kind, a.title, a.content, a.sort_order
FROM tour_schedules s JOIN tour_amenities a ON a.tour_id = s.tour_id;
