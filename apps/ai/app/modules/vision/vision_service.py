import base64
import json
import logging
import httpx
from asyncpg import Pool

from app.clients.gemini_client import call_gemini_vision
from app.clients.openai_client import call_chat_completion
from app.search.catalog import schedule_rows, tour_card, matches_destination
from app.search.vector_store import semantic_tour_ids
from app.schemas import Criteria
from app.modules.vision.schemas import (
    VisionRecognizeRequest, VisionRecognizeResponse, LandmarkDetails
)
from app.modules.vision.prompts import VISION_LANDMARK_PROMPT

logger = logging.getLogger(__name__)


async def recognize_landmark(db: Pool, request: VisionRecognizeRequest) -> VisionRecognizeResponse:
    # 1. Obtain image bytes
    image_bytes = None
    mime_type = "image/jpeg"

    if request.image_base64:
        header_data = request.image_base64
        if "base64," in header_data:
            header, header_data = header_data.split("base64,", 1)
            if "image/png" in header:
                mime_type = "image/png"
            elif "image/webp" in header:
                mime_type = "image/webp"
        image_bytes = base64.b64decode(header_data)
    elif request.image_url:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.get(request.image_url)
            res.raise_for_status()
            image_bytes = res.content
            content_type = res.headers.get("content-type", "")
            if content_type.startswith("image/"):
                mime_type = content_type
    else:
        raise ValueError("Vui lòng cung cấp image_url hoặc image_base64.")

    # 2. Invoke Vision model (Gemini or OpenAI)
    raw_json = None
    try:
        # First attempt with Gemini Vision
        raw_json = await call_gemini_vision(VISION_LANDMARK_PROMPT, image_bytes, mime_type=mime_type, timeout=25.0)
    except Exception as gemini_err:
        logger.info("Gemini Vision attempt failed, trying OpenAI vision: %s", gemini_err)
        try:
            b64_str = base64.b64encode(image_bytes).decode("utf-8")
            messages = [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": VISION_LANDMARK_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{mime_type};base64,{b64_str}"}
                        }
                    ]
                }
            ]
            raw_json = await call_chat_completion(messages, timeout=25.0)
        except Exception as openai_err:
            logger.warning("OpenAI Vision also failed: %s", openai_err)

    # 3. Parse landmark details
    landmark = LandmarkDetails(
        name="Địa danh du lịch",
        city_province="Việt Nam",
        description="Hình ảnh danh lam thắng cảnh du lịch tuyệt đẹp.",
        highlights=["Tham quan khám phá", "Chụp ảnh lưu niệm"]
    )

    if raw_json:
        try:
            clean = raw_json.strip().replace("```json", "").replace("```", "").strip()
            data = json.loads(clean)
            landmark = LandmarkDetails(
                name=data.get("name", "Địa danh du lịch"),
                city_province=data.get("city_province", "Việt Nam"),
                description=data.get("description", ""),
                highlights=data.get("highlights", [])
            )
        except Exception as e:
            logger.warning("Failed to parse vision response JSON: %s", e)

    # 4. Search tours matching this landmark / province in JourniTrip catalog
    all_schedules = await schedule_rows(db, Criteria())
    matched = []
    
    # Priority: match by city_province or landmark name
    search_terms = [landmark.city_province, landmark.name]
    for term in search_terms:
        if term and term != "Việt Nam":
            for row in all_schedules:
                if matches_destination(term, row) and row not in matched:
                    matched.append(row)

    # If still not enough tours, use semantic search with landmark name
    if len(matched) < 3 and landmark.name:
        semantic_ids = await semantic_tour_ids(f"{landmark.name} {landmark.city_province}", limit=4)
        for sid in semantic_ids:
            row = next((r for r in all_schedules if r['tour_id'] == sid), None)
            if row and row not in matched:
                matched.append(row)

    tour_cards = [tour_card(r) for r in matched[:4]]
    message = f"JourniTrip đã nhận diện địa danh: {landmark.name} ({landmark.city_province}). "
    if tour_cards:
        message += f"Tìm thấy {len(tour_cards)} tour phù hợp đang mở bán dưới đây!"
    else:
        message += "Hiện tại các tour đi qua địa danh này đang chuẩn bị mở đợt mới."

    return VisionRecognizeResponse(
        landmark=landmark,
        matched_tours=tour_cards,
        message=message
    )

