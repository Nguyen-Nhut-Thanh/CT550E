CREATE TABLE tour_amenities (
    amenity_id SERIAL PRIMARY KEY,
    tour_id INTEGER NOT NULL REFERENCES tours(tour_id) ON DELETE CASCADE,
    kind VARCHAR(30) NOT NULL,
    title VARCHAR(150) NOT NULL CHECK (length(btrim(title)) > 0),
    content TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT tour_amenities_kind_check CHECK (kind IN ('transport', 'hotel', 'cuisine', 'guide', 'insurance', 'water', 'best_time', 'best_for', 'promotion')),
    CONSTRAINT tour_amenities_tour_id_kind_key UNIQUE (tour_id, kind)
);
CREATE INDEX tour_amenities_tour_id_sort_order_idx ON tour_amenities(tour_id, sort_order);

INSERT INTO tour_amenities (tour_id, kind, title, content, sort_order)
SELECT t.tour_id, v.kind, v.title, v.content, v.sort_order
FROM tours t
CROSS JOIN LATERAL (VALUES
    ('transport', 'Phương tiện di chuyển', t.transport_info, 0),
    ('cuisine', 'Ẩm thực', t.cuisine_info, 2),
    ('best_time', 'Thời gian lý tưởng', t.best_time, 6),
    ('best_for', 'Phù hợp với', t.best_for, 7),
    ('promotion', 'Khuyến mãi', t.promotion_info, 8)
) AS v(kind, title, content, sort_order)
WHERE NULLIF(btrim(v.content), '') IS NOT NULL;

-- Keep legacy columns as a backup. New application code reads/writes tour_amenities.
