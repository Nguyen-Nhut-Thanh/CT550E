import re
from app.core.constants import (
    DESTINATION_MAP, DEST_PATTERNS, INVALID_DESTS, ORDINAL
)
from app.core.normalizer import normalized, contains_phrase


def is_invalid_destination(val: str) -> bool:
    norm = normalized(val)
    if not norm or len(norm) < 2:
        return True
    if norm in INVALID_DESTS:
        return True
    # If contains passenger counts, question words, or pricing units
    if re.search(r'\b(?:nguoi|khach|tre|be|em be|lon|nho|ve|gia|tien|trieu|tr|k|dong|vnd|neu|thi|bao nhieu|nhieu)\b', norm):
        return True
    if re.search(r'\d', norm):
        return True
    return False


def clean_dest_candidate(text: str) -> str:
    cleaned = text.strip()
    cleaned = re.sub(r'^(?:nào|nao|chuyến|chuyen|du\s+lịch|du\s+lich|đi|di|đến|den|tới|toi)\s+', '', cleaned, flags=re.I).strip()
    cleaned = re.sub(r'\s+(?:bên\s+mình|ben\s+minh|bên\s+bạn|ben\s+ban|mình|minh|bạn|ban|em|ạ|a|nhé|nhe|nha|hông|hong|hơm|hom|không|khong|ko|k|kh|được|duoc|đc|dc|với|voi|ơi|oi|vậy|vay)$', '', cleaned, flags=re.I).strip()
    return cleaned


def parse_destination(query: str) -> str | None:
    norm_q = normalized(query)
    for key, val in DESTINATION_MAP.items():
        if f" {key} " in f" {norm_q} ":
            return val
    for p in DEST_PATTERNS:
        m = re.search(p, query, re.IGNORECASE)
        if m:
            val = clean_dest_candidate(m.group(1))
            if not is_invalid_destination(val):
                mapped = DESTINATION_MAP.get(normalized(val))
                return mapped or val
    return None


def parse_counts(query: str) -> tuple[int | None, int | None, int | None]:
    counts = re.findall(
        r'(\d{1,2})\s*(người lớn|nguoi lon|trẻ em|tre em|trẻ nhỏ|tre nho|bé|be|em bé|em be|khách|khach|người|nguoi)',
        query.lower()
    )
    adults, children, infants = None, None, None
    for num, kind in counts:
        n = int(num)
        if any(k in kind for k in ('người lớn', 'nguoi lon')):
            adults = n
        elif any(k in kind for k in ('em bé', 'em be')):
            infants = n
        elif any(k in kind for k in ('trẻ', 'tre', 'bé', 'be')):
            children = n
        elif any(k in kind for k in ('người', 'nguoi', 'khách', 'khach')):
            if adults is None:
                adults = n
    return adults, children, infants


def parse_budget(query: str) -> int | None:
    # Negative lookahead to prevent capturing "1 tr" from "1 trẻ em"
    budget_m = re.search(
        r'(?:dưới|duoi|tầm|tam|khoảng|khoang|ngân\s+sách|ngan\s+sach|giá|gia)?\s*(\d+(?:[.,]\d+)?)\s*(triệu|trieu|tr|k|nghìn|nghin|đ|vnd)(?![a-zA-Zà-ỹÀ-Ỹ])',
        query.lower()
    )
    if not budget_m:
        return None
    val = float(budget_m.group(1).replace(',', '.'))
    unit = budget_m.group(2)
    return int(val * 1_000_000) if unit in ('triệu', 'trieu', 'tr') else int(val * 1_000)


def detect_query_intent(query: str, dest: str | None, is_outbound: bool, is_domestic: bool) -> dict:
    q = query.lower()
    norm_q = normalized(query)
    is_pricing = any(k in q for k in ["giá", "gia", "nhiêu", "nhieu", "tiền", "tien", "chi phí", "báo giá", "bao gia", "người", "nguoi", "trẻ em", "tre em", "bé", "khách", "khach", "vé", "ve"])
    is_voucher = any(k in q for k in ["voucher", "mã", "ma", "khuyến mãi", "khuyen mai", "ưu đãi", "uu dai", "giảm giá", "giam gia", "deal", "sale"])
    is_detail = any(k in q for k in ["lịch trình", "lich trinh", "ngày 1", "ngay 1", "ngày 2", "ngay 2", "khách sạn", "khach san", "ở đâu", "o dau", "hoạt động", "chính sách", "chinh sach", "hủy", "huy", "ăn gì", "món gì", "đặc sản", "mùa nào", "thời tiết", "chơi gì", "phương tiện", "máy bay", "xe"])
    
    is_followup = (
        (is_pricing or is_voucher or is_detail or any(k in norm_q for k in ('the con', 'vay thi', 'neu di', 'neu', 'bao nhieu')))
        and not dest and not is_outbound and not is_domestic
    )

    return {
        "is_pricing": is_pricing,
        "is_voucher": is_voucher,
        "is_detail": is_detail,
        "is_followup": is_followup,
    }

