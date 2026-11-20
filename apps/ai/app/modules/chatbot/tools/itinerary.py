from asyncpg import Pool
from app.database import fetch_rows
from app.core.normalizer import plain


async def get_tour_details(db: Pool, row: dict) -> dict:
    itinerary = await fetch_rows(db, """
      SELECT i.day_number, i.title, i.content, i.meals,
        (SELECT string_agg(a.time || ' ' || a.title, '; ' ORDER BY a.sort_order)
         FROM itinerary_activities a WHERE a.tour_itinerary_id = i.tour_itinerary_id) AS activities
      FROM tour_itineraries i WHERE i.tour_schedule_id = :schedule ORDER BY i.day_number LIMIT 20
    """, schedule=row['tour_schedule_id'])
    policies = await fetch_rows(db, """
      SELECT policy_type, content FROM tour_policies WHERE tour_id = :tour ORDER BY policy_id LIMIT 12
    """, tour=row['tour_id'])
    hotels = await fetch_rows(db, """
      SELECT h.name FROM tour_schedule_hotels sh JOIN hotels h USING (hotel_id)
      WHERE sh.tour_schedule_id = :schedule ORDER BY h.hotel_id LIMIT 6
    """, schedule=row['tour_schedule_id'])
    days = [{"day": day['day_number'], "title": plain(day['title']), "content": plain(day['content'], 450),
             "meals": day['meals'], "activities": plain(day['activities'], 400)} for day in itinerary]
    return {"itinerary": days, "hotels": [hotel['name'] for hotel in hotels],
            "policies": [{p['policy_type']: plain(p['content'], 600)} for p in policies]}

