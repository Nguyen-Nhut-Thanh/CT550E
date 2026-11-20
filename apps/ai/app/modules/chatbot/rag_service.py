import json
import logging
import re
from datetime import datetime
from asyncpg import Pool

from app.schemas import ChatRequest, ChatResponse, Criteria
from app.core.normalizer import normalized, contains_phrase
from app.core.constants import ORDINAL
from app.core.extractor import (
    parse_destination, parse_counts, parse_budget, detect_query_intent
)
from app.search.catalog import (
    schedule_rows, matches_destination, discounted, original_adult_price, tour_card, vnd
)
from app.search.vector_store import semantic_tour_ids
from app.clients.openai_client import call_chat_completion
from app.modules.chatbot.prompts import SYSTEM_PROMPT
from app.modules.chatbot.tools import (
    calculate_tour_price, get_tour_promotions_and_vouchers,
    get_destination_knowledge, get_tour_details
)

logger = logging.getLogger(__name__)


async def run_advanced_rag(db: Pool, request: ChatRequest) -> ChatResponse:
    q = request.message.lower()
    norm_q = normalized(request.message)

    # 1. Parse categories and entities
    is_outbound = any(contains_phrase(norm_q, k) for k in ('nuoc ngoai', 'quoc te', 'ngoai quoc', 'outbound'))
    is_domestic = any(contains_phrase(norm_q, k) for k in ('trong nuoc', 'noi dia', 'domestic'))

    dest = parse_destination(request.message) if not (is_outbound or is_domestic) else None
    adults, children, infants = parse_counts(request.message)
    budget = parse_budget(request.message)

    # Intent detection
    intent = detect_query_intent(request.message, dest, is_outbound, is_domestic)
    is_pricing_query = intent["is_pricing"]
    is_voucher_query = intent["is_voucher"]
    is_detail_query = intent["is_detail"]
    is_followup = intent["is_followup"]

    # 2. Resolve target schedule from context or follow-up
    target_schedule_id = None
    ordinal_m = re.search(ORDINAL, norm_q)
    if ordinal_m:
        token = ordinal_m[1].split()[-1]
        idx = {'tien': 1, 'nhat': 1, 'hai': 2, 'ba': 3, 'tu': 4, 'nam': 5}.get(token, int(token) if token.isdigit() else 1)
        if 1 <= idx <= len(request.previousScheduleIds):
            target_schedule_id = request.previousScheduleIds[idx - 1]

    if not target_schedule_id and request.visibleTours:
        for vt in request.visibleTours:
            vt_words = [w for w in normalized(vt.title).split() if w not in ('du', 'lich', 'tour', 'chuyen', 'di')]
            if vt_words and all(w in norm_q for w in vt_words):
                target_schedule_id = vt.scheduleId
                break

    if not target_schedule_id and any(k in norm_q for k in ('tour nay', 'tour do', 'chuyen nay', 'chuyen do', 'tour tren', 'tour vua roi')):
        target_schedule_id = request.focus or (request.previousScheduleIds[0] if request.previousScheduleIds else None)

    # Follow-up query without new destination: maintain previous focused tour
    if not target_schedule_id and is_followup:
        target_schedule_id = request.focus or (request.previousScheduleIds[0] if request.previousScheduleIds else None)

    # 3. Retrieve tours (Hybrid Retrieval)
    all_schedules = await schedule_rows(db, Criteria())
    dest_not_found = False
    tours = []

    if target_schedule_id:
        target_row = next((r for r in all_schedules if r['tour_schedule_id'] == target_schedule_id), None)
        if target_row:
            tours = [target_row]
            for prev_id in request.previousScheduleIds:
                if prev_id != target_schedule_id:
                    p_row = next((r for r in all_schedules if r['tour_schedule_id'] == prev_id), None)
                    if p_row and p_row not in tours:
                        tours.append(p_row)

    if not tours:
        matched_rows = []
        if is_outbound:
            matched_rows = [
                r for r in all_schedules
                if r.get('tour_type') == 'outbound' or any(normalized(c) != 'viet nam' for c in (r.get('country_names') or []))
            ]
        elif is_domestic:
            matched_rows = [r for r in all_schedules if r.get('tour_type') == 'domestic']
        else:
            effective_dest = dest or (request.criteria.destination if not budget else None)
            if effective_dest:
                matched_rows = [r for r in all_schedules if matches_destination(effective_dest, r)]
                if not matched_rows:
                    dest_not_found = bool(dest)

        if budget:
            pool_to_filter = matched_rows if matched_rows else all_schedules
            matched_rows = [r for r in pool_to_filter if discounted(original_adult_price(r), r) <= budget]

        if matched_rows:
            search_query = dest or (request.message if not (is_outbound or is_domestic) else '')
            semantic_ids = await semantic_tour_ids(search_query) if search_query else []
            sorted_rows = []
            for sid in semantic_ids:
                row = next((r for r in matched_rows if r['tour_id'] == sid), None)
                if row and row not in sorted_rows:
                    sorted_rows.append(row)
            for r in matched_rows:
                if r not in sorted_rows:
                    sorted_rows.append(r)
            tours = sorted_rows[:4]
        else:
            tours = all_schedules[:3]

    primary_tour = tours[0] if tours else None

    # 4. Run Tools & Gather Dynamic Knowledge
    extra_knowledge_parts = []

    if dest_not_found and dest:
        extra_knowledge_parts.append(
            f"THÔNG BÁO TÌM KIẾM: Hiện tại JourniTrip chưa có đợt tour mở bán trực tiếp đi '{dest}'. "
            f"Hãy lịch sự báo khách rằng hiện chưa có tour đi {dest}, và giới thiệu các tour nổi bật đang mở bán bên dưới."
        )

    # Tool A: Pricing Calculator
    crit_adults = adults or request.criteria.adults or (1 if is_pricing_query else None)
    crit_children = children if children is not None else request.criteria.children
    crit_infants = infants if infants is not None else request.criteria.infants

    quote_msg = None
    if is_pricing_query and primary_tour:
        calc_crit = Criteria(adults=crit_adults, children=crit_children, infants=crit_infants)
        quote_msg, _ = calculate_tour_price(primary_tour, calc_crit)
        extra_knowledge_parts.append(f"CÔNG CỤ TÍNH GIÁ TOUR ({primary_tour['name']}):\n{quote_msg}")

    # Tool B: Promotions & Vouchers
    promo_info = None
    if is_voucher_query:
        tokens = re.findall(r'\b[A-Za-z0-9_-]{4,20}\b', request.message.upper())
        code_cand = None
        for token in tokens:
            if token not in ('TOUR', 'VOUCHER', 'KHUYEN', 'GIAM', 'MINH', 'BAN', 'NAY', 'CHUYEN', 'KHONG', 'DONG', 'TIEN', 'GIA'):
                code_cand = token
                break
        promo_info = await get_tour_promotions_and_vouchers(db, primary_tour, code=code_cand)
        extra_knowledge_parts.append(f"THÔNG TIN ƯU ĐÃI & KHUYẾN MÃI CHO TOUR ({primary_tour['name'] if primary_tour else 'tour'}):\n{promo_info}")

    # Tool C: Destination Knowledge
    if any(k in q for k in ["ăn gì", "món gì", "đặc sản", "mùa nào", "thời tiết", "chơi gì", "cảnh đẹp", "cẩm nang", "điểm đến"]):
        target_name = dest or (primary_tour['destinations'][0] if primary_tour and primary_tour.get('destinations') else None)
        if target_name:
            dest_info = await get_destination_knowledge(db, target_name)
            if dest_info:
                extra_knowledge_parts.append(f"CẨM NANG ĐIỂM ĐẾN ({target_name}):\n{json.dumps(dest_info, ensure_ascii=False)}")

    # Tool D: Itinerary / Hotels / Policies
    if is_detail_query and primary_tour:
        details = await get_tour_details(db, primary_tour)
        itinerary_summary = "\n".join(f"- Ngày {d['day']}: {d['title']} (Hoạt động: {d['activities']})" for d in details['itinerary'][:5])
        hotels_summary = ", ".join(details['hotels']) or "Tiêu chuẩn du lịch"
        extra_knowledge_parts.append(f"CHI TIẾT LỊCH TRÌNH ({primary_tour['name']}):\nLịch trình:\n{itinerary_summary}\nKhách sạn: {hotels_summary}")

    # 5. Format Context and Chat History
    context_data = [
        {
            "id": t["tour_id"],
            "schedule_id": t["tour_schedule_id"],
            "tên": t["name"],
            "loại tour": "Nước ngoài" if t.get("tour_type") == "outbound" else "Trong nước",
            "giá niêm yết": f"{vnd(discounted(original_adult_price(t), t))}/người lớn",
            "khởi hành": t["start_date"].strftime("%d/%m/%Y") if isinstance(t["start_date"], datetime) else str(t["start_date"]),
            "thời gian": f"{t['duration_days']} ngày {t['duration_nights']} đêm",
            "điểm đến": " · ".join(t.get("destinations") or []),
            "quốc gia": " · ".join(t.get("country_names") or []),
            "phương tiện": t.get("transport") or "",
        }
        for t in tours
    ]

    context_json = json.dumps(context_data, ensure_ascii=False)
    history_lines = [f"Khách: {turn.question}\nTrợ lý: {turn.reply}" for turn in request.history[-4:]]
    history_text = "\n---\n".join(history_lines) if history_lines else "(Chưa có lịch sử hội thoại trước đó)"

    final_system_prompt = SYSTEM_PROMPT.format(context=context_json, history=history_text)
    if extra_knowledge_parts:
        final_system_prompt += "\n\nKIẾN THỨC & CÔNG CỤ HỖ TRỢ:\n" + "\n\n".join(extra_knowledge_parts)
        final_system_prompt += "\n\nHãy sử dụng đầy đủ các thông tin và kết quả tính toán trên để trả lời tự nhiên, thân thiện và giải đáp rõ ràng nhất cho khách."

    messages = [{"role": "system", "content": final_system_prompt}]
    for turn in request.history[-4:]:
        messages.append({"role": "user", "content": turn.question})
        messages.append({"role": "assistant", "content": turn.reply})
    messages.append({"role": "user", "content": request.message})

    # Safe fallback if LLM times out or fails (NEVER leak developer instructions)
    if dest_not_found and dest:
        fallback_reply = (
            f"Dạ hiện tại JourniTrip chưa có đợt tour nào khởi hành đi {dest} nha bạn. "
            f"Bạn có thể tham khảo một số tour hấp dẫn đang mở bán bên dưới nhé!"
        )
    elif is_outbound:
        if tours and any(t.get('tour_type') == 'outbound' for t in tours):
            fallback_reply = "Dạ JourniTrip đang có các tour du lịch nước ngoài hấp dẫn dưới đây, mời bạn tham khảo nhé!"
        else:
            fallback_reply = "Dạ hiện tại các tour nước ngoài đang chuẩn bị mở đợt mới. Bạn có thể tham khảo các tour nổi bật đang mở bán dưới đây nhé!"
    elif promo_info:
        fallback_reply = f"{promo_info}\n\nBạn tham khảo các tour đang có ưu đãi bên dưới nhé!"
    elif is_pricing_query and quote_msg:
        fallback_reply = f"{quote_msg}\n\nBạn tham khảo chi tiết tour bên dưới nhé!"
    else:
        fallback_reply = "Dạ mình đã ghi nhận thông tin của bạn. Bạn tham khảo danh sách tour gợi ý bên dưới nhé!"

    reply = None
    for attempt in range(2):
        timeout_sec = 22.0 if attempt == 0 else 28.0
        try:
            candidate = await call_chat_completion(messages, timeout=timeout_sec)
            if candidate:
                reply = candidate
                break
        except Exception as error:
            logger.warning("OpenAI response generation attempt %d: %s", attempt + 1, type(error).__name__)

    if not reply:
        reply = fallback_reply

    # Clean any accidental placeholders or prompt leak prefixes
    reply = re.sub(r'\[(?:thẻ|the|thẻ tour|tour|danh sách|placeholder)[^\]]*\]', '', reply, flags=re.I)
    reply = re.sub(r'^(?:LƯU Ý|GHI CHÚ|SYSTEM NOTE|QUY TẮC):\s*', '', reply, flags=re.I)
    reply = reply.strip()

    cards = [tour_card(t) for t in tours]
    new_criteria = Criteria(
        destination=dest or request.criteria.destination,
        adults=crit_adults,
        children=crit_children,
        infants=crit_infants,
        budget=budget or request.criteria.budget
    )
    focused_id = primary_tour['tour_schedule_id'] if primary_tour else None
    topic = 'quote' if is_pricing_query else ('destination' if dest else 'search')

    return ChatResponse(
        reply=reply,
        tours=cards,
        criteria=new_criteria,
        previousScheduleIds=[c.schedule_id for c in cards],
        focusedScheduleId=focused_id,
        topic=topic
    )

