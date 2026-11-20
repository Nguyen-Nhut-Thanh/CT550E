import logging
from asyncpg import Pool

from app.database import fetch_rows
from app.search.catalog import schedule_rows
from app.schemas import Criteria
from app.modules.recommendation.schemas import (
    RecommendationRequest, RecommendationResponse, RecommendationItem
)
from app.modules.recommendation.scorer import score_tour_candidate

logger = logging.getLogger(__name__)


async def recommend_tours(db: Pool, request: RecommendationRequest) -> RecommendationResponse:
    # 1. Fetch active schedules from DB
    all_schedules = await schedule_rows(db, Criteria())

    # 2. Fetch destination knowledge cache
    dest_rows = await fetch_rows(db, """
        SELECT l.name, d.best_time, d.cuisine, d.highlights
        FROM destinations_detail d
        JOIN locations l USING (location_id)
    """)
    dest_knowledge = {r["name"].lower(): dict(r) for r in dest_rows}

    # 3. Deduplicate by tour_id (keep earliest available schedule)
    candidates_by_tour = {}
    exclude_set = set(request.exclude_tour_ids)
    if request.tour_id:
        exclude_set.add(request.tour_id)

    for row in all_schedules:
        tid = row["tour_id"]
        if tid in exclude_set:
            continue
        if tid not in candidates_by_tour:
            candidates_by_tour[tid] = row

    # 4. Score each candidate
    scored_items = []
    for tid, tour in candidates_by_tour.items():
        score, breakdown, reasons = score_tour_candidate(tour, request, dest_knowledge)
        dest_display = " · ".join(tour.get("destinations") or [])
        item = RecommendationItem(
            tour_id=tid,
            name=tour["name"],
            code=tour.get("code"),
            price=float(tour.get("base_price") or 0),
            duration_days=tour.get("duration_days") or 1,
            duration_nights=tour.get("duration_nights") or 0,
            departure_location=tour.get("departure"),
            destination=dest_display,
            image_url=tour.get("image_url") or None,
            reasons=reasons[:3],
            score_breakdown=breakdown
        )
        scored_items.append((score, item))

    # 5. Sort by final score descending
    scored_items.sort(key=lambda x: x[0], reverse=True)
    top_recommendations = [item for _, item in scored_items[:request.limit]]

    return RecommendationResponse(
        strategy="hybrid_content_knowledge",
        total_candidates=len(candidates_by_tour),
        recommendations=top_recommendations
    )

