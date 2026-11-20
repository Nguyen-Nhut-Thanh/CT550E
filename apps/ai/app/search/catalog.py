from datetime import UTC, datetime, time, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
import re
from asyncpg import Connection, Pool

from app.database import fetch_rows
from app.schemas import Criteria, RecommendedTour
from app.core.normalizer import normalized, contains_phrase
from app.core.constants import DESTINATION_SYNONYMS

VN_TIME = timezone(timedelta(hours=7))


def vnd(amount: Decimal | int | float | None) -> str:
    if amount is None:
        return "Liên hệ"
    val = int(amount)
    return f"{val:,}".replace(",", ".") + " đ"


def label(name: str | None) -> str:
    return name.strip() if name else "Không rõ"


def utc(value: datetime) -> datetime:
    return value.replace(tzinfo=UTC) if value.tzinfo is None else value.astimezone(UTC)


SCHEDULES = """
SELECT t.tour_id, t.name, t.code, t.tour_type, t.summary, t.duration_days, t.duration_nights,
       s.tour_schedule_id, s.start_date, s.price AS base_price, l.name AS departure,
       COALESCE(media.image_url, '') AS image_url, dest.names AS destinations,
       dest.country_names, dest.region_names,
       tr.name AS transport,
       lower(COALESCE(tr.transport_type, '')) AS transport_type,
       prices.adult, prices.child, prices.infant,
       COALESCE(f.discount_type, promo.discount_type) AS discount_type,
       COALESCE(f.discount_value, promo.discount_value) AS discount_value
FROM tour_schedules s
JOIN tours t USING (tour_id)
JOIN locations l ON l.location_id = s.departure_location_id
LEFT JOIN transports tr ON tr.transport_id = t.transport_id
LEFT JOIN LATERAL (
  SELECT COALESCE(s.cover_image_url, (SELECT i.image_url FROM tour_images i
    WHERE i.tour_id = t.tour_id AND i.is_cover = 1 ORDER BY i.sort_order, i.image_id LIMIT 1)) AS image_url
) media ON TRUE
LEFT JOIN LATERAL (
  SELECT 
    array_agg(loc.name ORDER BY d.visit_order, d.location_id) AS names,
    array_agg(DISTINCT country.name) FILTER (WHERE country.name IS NOT NULL) AS country_names,
    array_agg(DISTINCT region.name) FILTER (WHERE region.name IS NOT NULL) AS region_names
  FROM tour_destinations d
  JOIN locations loc USING (location_id)
  LEFT JOIN locations region ON region.location_id = loc.parent_id
  LEFT JOIN locations country ON (
    country.country_code = loc.country_code AND country.location_type = 'country'
  )
  WHERE d.tour_id = t.tour_id
) dest ON TRUE
LEFT JOIN LATERAL (
  SELECT max(p.price) FILTER (WHERE upper(trim(p.passenger_type)) = 'ADULT') AS adult,
         max(p.price) FILTER (WHERE upper(trim(p.passenger_type)) = 'CHILD') AS child,
         max(p.price) FILTER (WHERE upper(trim(p.passenger_type)) = 'INFANT') AS infant
  FROM tour_schedule_prices p WHERE p.tour_schedule_id = s.tour_schedule_id AND p.currency = 'VND'
) prices ON TRUE
LEFT JOIN flash_deals f ON f.tour_schedule_id = s.tour_schedule_id AND f.status = 1
  AND :now BETWEEN f.start_date AND f.end_date
LEFT JOIN schedule_promotions promo ON promo.tour_schedule_id = s.tour_schedule_id AND promo.is_active
  AND :now BETWEEN promo.start_date AND promo.end_date
  AND (promo.max_slots IS NULL OR promo.used_slots + :promo_guests <= promo.max_slots)
WHERE t.status = 1 AND s.status = 1 AND s.quota - s.booked_count >= :party_size
  AND s.start_date >= :now + make_interval(hours => t.cut_off_hours)
"""


async def schedule_rows(db: Connection | Pool, criteria: Criteria, schedule_id: int | None = None) -> list[dict]:
    now = datetime.now(UTC).replace(tzinfo=None)
    params = {"now": now, "party_size": criteria.party_size, "promo_guests": max(1, criteria.party_size - (criteria.infants or 0))}
    clauses = []
    if schedule_id is not None:
        clauses.append("s.tour_schedule_id = :schedule_id")
        params["schedule_id"] = schedule_id
    if criteria.date_from:
        clauses.append("s.start_date >= :date_from")
        params["date_from"] = datetime.combine(criteria.date_from, time.min, VN_TIME).astimezone(UTC).replace(tzinfo=None)
    if criteria.date_to:
        clauses.append("s.start_date < :date_to")
        params["date_to"] = datetime.combine(criteria.date_to + timedelta(days=1), time.min, VN_TIME).astimezone(UTC).replace(tzinfo=None)
    if criteria.duration_days:
        clauses.append("t.duration_days <= :duration")
        params["duration"] = criteria.duration_days
    sql = SCHEDULES + "".join(f" AND {clause}" for clause in clauses) + " ORDER BY s.start_date, s.tour_schedule_id"
    rows = await fetch_rows(db, sql, **params)
    return [dict(row) for row in rows]


def matches_destination(target_dest: str, row: dict) -> bool:
    norm_target = normalized(target_dest)
    candidates = DESTINATION_SYNONYMS.get(norm_target, [norm_target])
    row_names = [
        row['name'],
        *(row.get('destinations') or []),
        *(row.get('country_names') or []),
        *(row.get('region_names') or [])
    ]
    for cand in candidates:
        if any(contains_phrase(name, cand) for name in row_names):
            return True
    return False


def discounted(value: Decimal, row: dict) -> Decimal:
    discount = row.get("discount_value")
    if discount is None or discount <= 0 or value <= 0:
        return value
    if row.get("discount_type") == "percentage":
        off = value * min(discount, Decimal(100)) / Decimal(100)
        return max(Decimal(0), value - off.quantize(Decimal("1E3"), rounding=ROUND_HALF_UP))
    return max(Decimal(0), (value - discount).quantize(Decimal("1E3"), rounding=ROUND_HALF_UP))


def original_adult_price(row: dict) -> Decimal:
    return row["adult"] if row.get("adult") is not None else row["base_price"]


def tour_card(row: dict) -> RecommendedTour:
    original = original_adult_price(row)
    return RecommendedTour(
        id=row["tour_id"], title=row["name"], url=f'/tours/{row["tour_id"]}', image_url=row.get("image_url") or None,
        price=float(discounted(original, row)), original_price=float(original),
        duration=f'{row["duration_days"]} ngày {row["duration_nights"]} đêm', schedule_id=row["tour_schedule_id"],
        departure_date=utc(row["start_date"]), destination=" · ".join(row.get("destinations") or []), transport=row.get("transport"),
    )

