from decimal import Decimal
from app.modules.recommendation.schemas import RecommendationRequest, RecommendationScoreBreakdown


def score_tour_candidate(
    tour: dict,
    request: RecommendationRequest,
    destination_knowledge: dict[str, dict] | None = None
) -> tuple[float, RecommendationScoreBreakdown, list[str]]:
    reasons = []

    # 1. Content Score (Max 1.0)
    content_points = 0.0
    if request.destination:
        dest_str = " · ".join(tour.get("destinations") or []).lower()
        if request.destination.lower() in dest_str or request.destination.lower() in tour["name"].lower():
            content_points += 0.4
            reasons.append(f"Điểm đến đúng theo yêu cầu ({request.destination})")

    if request.budget_max and request.budget_max > 0:
        price = float(tour.get("base_price", 0))
        if price <= request.budget_max:
            content_points += 0.3
            reasons.append("Mức giá nằm trong ngân sách mong muốn")
        elif price <= request.budget_max * 1.15:
            content_points += 0.15

    if request.duration_days and request.duration_days > 0:
        diff = abs(tour.get("duration_days", 0) - request.duration_days)
        if diff == 0:
            content_points += 0.3
            reasons.append(f"Thời lượng chính xác {tour.get('duration_days')} ngày")
        elif diff == 1:
            content_points += 0.15
    else:
        content_points += 0.2

    content_score = min(1.0, max(0.1, content_points))

    # 2. Knowledge Score (Max 1.0)
    knowledge_points = 0.3  # Base score
    if destination_knowledge and tour.get("destinations"):
        for d in tour["destinations"]:
            info = destination_knowledge.get(d.lower())
            if info:
                # Check month
                if request.preferred_month and str(request.preferred_month) in str(info.get("best_time", "")):
                    knowledge_points += 0.4
                    reasons.append(f"Tháng {request.preferred_month} là thời điểm lý tưởng nhất tại {d}")
                if request.travel_style and request.travel_style.lower() in str(info.get("highlights", "")).lower():
                    knowledge_points += 0.3
                    reasons.append(f"Phù hợp sở thích '{request.travel_style}' tại {d}")
    knowledge_score = min(1.0, max(0.1, knowledge_points))

    # 3. Business / Popularity Score (Max 1.0)
    business_points = 0.3
    if tour.get("discount_value") and tour["discount_value"] > 0:
        business_points += 0.4
        reasons.append("Đang có chương trình ưu đãi giảm giá đặc biệt")
    booked = tour.get("booked_count", 0)
    if booked and booked > 5:
        business_points += 0.3
        reasons.append("Tour được nhiều du khách lựa chọn")
    business_score = min(1.0, max(0.1, business_points))

    # 4. Final Weighted Score
    final_score = round(0.45 * content_score + 0.35 * knowledge_score + 0.20 * business_score, 3)

    breakdown = RecommendationScoreBreakdown(
        final_score=final_score,
        content_score=round(content_score, 2),
        knowledge_score=round(knowledge_score, 2),
        business_score=round(business_score, 2)
    )

    if not reasons:
        reasons.append("Tour nổi bật đang mở bán có lịch trình chất lượng")

    return final_score, breakdown, reasons

