from asyncpg import Pool
from app.database import fetch_rows
from app.core.normalizer import normalized, plain


async def get_destination_knowledge(db: Pool, name: str | None) -> dict:
    if not name:
        return {}
    slug = normalized(name).replace(' ', '-')
    try:
        rows = await fetch_rows(db, """
          SELECT l.name, d.best_time, d.cuisine, d.highlights FROM destinations_detail d
          JOIN locations l USING (location_id) WHERE l.slug = :slug OR lower(l.name) = lower(:name)
          ORDER BY l.location_id LIMIT 1
        """, slug=slug, name=name)
        if rows and any(rows[0][k] for k in ('best_time', 'cuisine', 'highlights')):
            return {key: plain(value) for key, value in rows[0].items() if value}
    except Exception:
        pass
    return {'name': name}

