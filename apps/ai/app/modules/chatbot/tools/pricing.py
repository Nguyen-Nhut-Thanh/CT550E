from decimal import Decimal
from app.schemas import Criteria
from app.search.catalog import discounted, original_adult_price, vnd


def calculate_tour_price(row: dict, criteria: Criteria) -> tuple[str, Decimal | None]:
    """Calculate detailed price quote for adults, children, and infants."""
    adults = criteria.adults if criteria.adults is not None else 1
    children = criteria.children or 0
    infants = criteria.infants or 0

    base_adult = discounted(original_adult_price(row), row)
    child_price = row.get('child')
    infant_price = row.get('infant')

    lines = []
    total = Decimal(0)

    if adults > 0:
        a_sub = adults * base_adult
        total += a_sub
        lines.append(f"{adults} người lớn × {vnd(base_adult)}")

    missing = []
    if children > 0:
        if child_price is not None:
            c_sub = children * child_price
            total += c_sub
            lines.append(f"{children} trẻ em × {vnd(child_price)}")
        else:
            missing.append("trẻ em")

    if infants > 0:
        if infant_price is not None:
            i_sub = infants * infant_price
            total += i_sub
            lines.append(f"{infants} em bé × {vnd(infant_price)}")
        else:
            missing.append("em bé")

    breakdown = "\n".join(lines) if lines else f"Giá vé người lớn: {vnd(base_adult)}"

    if missing:
        ref_note = ""
        if "trẻ em" in missing:
            est_child = (base_adult * Decimal("0.8")).quantize(Decimal("1E3"))
            ref_note += f"\n(Tham khảo trẻ em ~80% vé người lớn: {children} × ~{vnd(est_child)})"
        if "em bé" in missing:
            est_inf = (base_adult * Decimal("0.3")).quantize(Decimal("1E3"))
            ref_note += f"\n(Tham khảo em bé ~30% vé người lớn: {infants} × ~{vnd(est_inf)})"

        res_text = f"{breakdown}\nTạm tính phần đã có giá: {vnd(total)}. Đợt này chưa công bố giá cho {' và '.join(missing)}.{ref_note}"
        return res_text, total if total > 0 else None

    return f"{breakdown}\nTổng dự kiến: {vnd(total)} (trước phụ phí và voucher).", total

