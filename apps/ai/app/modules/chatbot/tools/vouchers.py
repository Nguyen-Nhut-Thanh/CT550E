from datetime import UTC, datetime
from decimal import Decimal
from asyncpg import Pool

from app.database import fetch_rows
from app.search.catalog import discounted, original_adult_price, vnd


async def check_voucher(db: Pool, code: str, total: Decimal | None = None, row: dict | None = None) -> str:
    now = datetime.now(UTC).replace(tzinfo=None)
    clean_code = code.strip().upper()

    rows = await fetch_rows(db, """
      SELECT voucher_id, code, discount_type, discount_value, max_discount_amount, min_order_value,
             start_date, expiry_date, usage_limit, used_count, applicable_scope, applicable_tour_types, applicable_tour_ids
      FROM vouchers
      WHERE upper(code) = :code AND status = 1 AND owner_user_id IS NULL AND cardinality(eligible_tiers) = 0
      LIMIT 1
    """, code=clean_code)

    if not rows:
        return f"Mã '{clean_code}' không tồn tại hoặc đã hết hạn."
    v = rows[0]
    if v['expiry_date'] <= now:
        return f"Mã '{clean_code}' đã hết hạn sử dụng vào ngày {v['expiry_date'].strftime('%d/%m/%Y')}."
    if v['start_date'] > now:
        return f"Mã '{clean_code}' sẽ bắt đầu có hiệu lực từ ngày {v['start_date'].strftime('%d/%m/%Y')}."
    if v['used_count'] >= v['usage_limit']:
        return f"Mã '{clean_code}' đã đạt giới hạn số lượt sử dụng."

    if row is not None:
        scope = v.get('applicable_scope')
        if scope == 'tour_type' and row.get('tour_type') not in (v.get('applicable_tour_types') or []):
            return f"Mã '{clean_code}' không áp dụng cho dòng tour này ({row.get('name')})."
        if scope == 'specific_tours' and row.get('tour_id') not in (v.get('applicable_tour_ids') or []):
            return f"Mã '{clean_code}' không áp dụng cho tour {row.get('name')}."

    val_str = f"{v['discount_value']}%" if v['discount_type'] == 'percentage' else vnd(v['discount_value'])
    max_str = f" (giảm tối đa {vnd(v['max_discount_amount'])})" if v['max_discount_amount'] else ""
    min_order_str = f"Đơn hàng tối thiểu {vnd(v['min_order_value'])}."

    if total is None or total <= 0:
        return f"Mã '{clean_code}' hợp lệ! Bạn được giảm {val_str}{max_str}. Điều kiện: {min_order_str}"

    if total < v['min_order_value']:
        return f"Mã '{clean_code}' hợp lệ (giảm {val_str}{max_str}), nhưng đơn hàng tạm tính ({vnd(total)}) chưa đạt giá trị tối thiểu {vnd(v['min_order_value'])}."

    discount = (total * v['discount_value'] / Decimal(100)) if v['discount_type'] == 'percentage' else v['discount_value']
    if v['max_discount_amount'] is not None:
        discount = min(discount, v['max_discount_amount'])
    discount = max(Decimal(0), min(discount, total))
    final_amount = total - discount
    return f"Mã '{clean_code}' có thể giảm {vnd(discount)}, còn {vnd(final_amount)}. Điều kiện được kiểm tra lại khi đặt tour."


async def get_tour_promotions_and_vouchers(db: Pool, row: dict | None = None, code: str | None = None) -> str:
    parts = []

    # 1. Direct tour promotion if tour has discount
    if row is not None:
        disc_val = row.get('discount_value')
        disc_type = row.get('discount_type')
        orig_price = original_adult_price(row)
        curr_price = discounted(orig_price, row)
        if disc_val and disc_val > 0:
            if disc_type == 'percentage':
                parts.append(f"- Ưu đãi giảm trực tiếp: Tour đang giảm {disc_val}% giá vé người lớn (từ {vnd(orig_price)} còn {vnd(curr_price)}).")
            else:
                parts.append(f"- Ưu đãi giảm trực tiếp: Tour đang giảm {vnd(disc_val)} giá vé người lớn (từ {vnd(orig_price)} còn {vnd(curr_price)}).")

    # 2. Specific code check
    if code:
        v_res = await check_voucher(db, code, row=row)
        parts.append(f"- Kiểm tra mã '{code.upper()}': {v_res}")
        return "\n".join(parts)

    # 3. Available vouchers in system applicable to this tour
    scope_clauses = ["applicable_scope = 'all'"]
    params = {}
    if row is not None:
        if row.get('tour_type'):
            scope_clauses.append("(applicable_scope = 'tour_type' AND :tour_type = ANY(applicable_tour_types))")
            params['tour_type'] = row['tour_type']
        if row.get('tour_id'):
            scope_clauses.append("(applicable_scope = 'specific_tours' AND :tour_id = ANY(applicable_tour_ids))")
            params['tour_id'] = row['tour_id']

    scope_sql = f"({' OR '.join(scope_clauses)})"
    sql = f"""
        SELECT code, discount_type, discount_value, min_order_value, max_discount_amount
        FROM vouchers
        WHERE status = 1 AND owner_user_id IS NULL AND cardinality(eligible_tiers) = 0
          AND expiry_date >= NOW() AND start_date <= NOW()
          AND used_count < usage_limit
          AND {scope_sql}
        ORDER BY discount_value DESC
        LIMIT 4
    """
    rows = await fetch_rows(db, sql, **params)
    if rows:
        voucher_lines = []
        for v in rows:
            val = f"{v['discount_value']}%" if v['discount_type'] == 'percentage' else vnd(v['discount_value'])
            max_str = f" (tối đa {vnd(v['max_discount_amount'])})" if v['max_discount_amount'] else ""
            min_str = f" cho đơn từ {vnd(v['min_order_value'])}" if v['min_order_value'] and v['min_order_value'] > 0 else ""
            voucher_lines.append(f"  + Mã `{v['code']}`: Giảm {val}{max_str}{min_str}")
        parts.append("- Các mã voucher khả dụng bạn có thể áp dụng:\n" + "\n".join(voucher_lines))
    elif not parts:
        parts.append("Hiện tại tour chưa có thêm mã giảm giá đặc biệt nào khác.")

    return "\n".join(parts)

