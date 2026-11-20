import json
import logging
from decimal import Decimal
from asyncpg import Pool

from app.database import fetch_rows
from app.search.catalog import vnd, original_adult_price, discounted
from app.clients.openai_client import call_chat_completion
from app.modules.comparison.schemas import (
    CompareRequest, CompareResponse, ComparisonField, TourProsCons
)
from app.modules.comparison.prompts import COMPARISON_PROMPT

logger = logging.getLogger(__name__)


async def compare_tours(db: Pool, request: CompareRequest) -> CompareResponse:
    if not request.tour_ids or len(request.tour_ids) < 2:
        raise ValueError("Cần ít nhất 2 tour để thực hiện so sánh.")

    # 1. Fetch tour details from DB
    sql = """
        SELECT t.tour_id, t.name, t.code, t.tour_type, t.summary, t.duration_days, t.duration_nights,
               t.base_price, l.name AS departure, tr.name AS transport,
               dest.names AS destinations,
               hotels.hotel_names,
               media.image_url
        FROM tours t
        JOIN locations l ON l.location_id = t.departure_location
        LEFT JOIN transports tr ON tr.transport_id = t.transport_id
        LEFT JOIN LATERAL (
          SELECT array_agg(loc.name ORDER BY d.visit_order) AS names
          FROM tour_destinations d JOIN locations loc USING (location_id) WHERE d.tour_id = t.tour_id
        ) dest ON TRUE
        LEFT JOIN LATERAL (
          SELECT array_agg(DISTINCT h.name) AS hotel_names
          FROM tour_schedules s
          JOIN tour_schedule_hotels sh ON sh.tour_schedule_id = s.tour_schedule_id
          JOIN hotels h USING (hotel_id)
          WHERE s.tour_id = t.tour_id
        ) hotels ON TRUE
        LEFT JOIN LATERAL (
          SELECT image_url FROM tour_images WHERE tour_id = t.tour_id AND is_cover = 1 ORDER BY sort_order LIMIT 1
        ) media ON TRUE
        WHERE t.tour_id = ANY(:tour_ids) AND t.status = 1
    """
    rows = await fetch_rows(db, sql, tour_ids=request.tour_ids)
    if len(rows) < 2:
        raise ValueError("Không tìm đủ các tour hợp lệ để so sánh.")

    tours_data = []
    for r in rows:
        tours_data.append({
            "tour_id": r["tour_id"],
            "name": r["name"],
            "code": r["code"],
            "base_price": float(r["base_price"]),
            "price_formatted": vnd(r["base_price"]),
            "duration": f"{r['duration_days']} ngày {r['duration_nights']} đêm",
            "departure": r["departure"],
            "transport": r.get("transport") or "Ô tô du lịch",
            "destinations": r.get("destinations") or [],
            "hotels": r.get("hotel_names") or ["Tiêu chuẩn du lịch"],
            "image_url": r.get("image_url") or "",
            "summary": r.get("summary") or ""
        })

    # 2. Build comparison matrix
    matrix = [
        ComparisonField(
            key="price",
            label="Giá tham khảo",
            values={str(t["tour_id"]): t["price_formatted"] for t in tours_data}
        ),
        ComparisonField(
            key="duration",
            label="Thời gian",
            values={str(t["tour_id"]): t["duration"] for t in tours_data}
        ),
        ComparisonField(
            key="departure",
            label="Khởi hành từ",
            values={str(t["tour_id"]): t["departure"] for t in tours_data}
        ),
        ComparisonField(
            key="transport",
            label="Phương tiện",
            values={str(t["tour_id"]): t["transport"] for t in tours_data}
        ),
        ComparisonField(
            key="destinations",
            label="Điểm tham quan chính",
            values={str(t["tour_id"]): " · ".join(t["destinations"]) for t in tours_data}
        ),
        ComparisonField(
            key="hotels",
            label="Khách sạn / Lưu trú",
            values={str(t["tour_id"]): ", ".join(t["hotels"]) for t in tours_data}
        ),
    ]

    # 3. Call AI for Pros/Cons analysis & Verdict
    user_context = request.user_context or "Khách hàng muốn tìm tour phù hợp nhất giữa các lựa chọn này."
    prompt = COMPARISON_PROMPT.format(
        tours_data=json.dumps(tours_data, ensure_ascii=False, indent=2),
        user_context=user_context
    )

    analysis_result = {}
    verdict = "Dưới đây là bảng so sánh chi tiết giữa các tour để bạn dễ dàng lựa chọn."
    try:
        raw_ai = await call_chat_completion([{"role": "user", "content": prompt}], timeout=25.0)
        clean_json = raw_ai.strip().replace("```json", "").replace("```", "").strip()
        parsed = json.loads(clean_json)
        if "analysis" in parsed:
            for tid_str, item in parsed["analysis"].items():
                analysis_result[tid_str] = TourProsCons(
                    pros=item.get("pros", []),
                    cons=item.get("cons", []),
                    best_for=item.get("best_for", "")
                )
        if "ai_verdict" in parsed:
            verdict = parsed["ai_verdict"]
    except Exception as e:
        logger.warning("AI Comparison analysis failed: %s", e)
        # Fallback analysis
        for t in tours_data:
            analysis_result[str(t["tour_id"])] = TourProsCons(
                pros=[f"Thời lượng {t['duration']}", f"Khám phá: {', '.join(t['destinations'][:3])}"],
                cons=["Cần kiểm tra lịch khởi hành khả dụng"],
                best_for="Du khách yêu thích hành trình này"
            )

    return CompareResponse(
        tours=tours_data,
        matrix=matrix,
        analysis=analysis_result,
        ai_verdict=verdict
    )

