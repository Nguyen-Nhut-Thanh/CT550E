/**
 * Tính giá sau khi áp dụng khuyến mãi (Flash deal hoặc Schedule promotion)
 */
export function applyDiscount(
  basePrice: number,
  type: string,
  value: number
): number {
  const price = Math.max(0, Number(basePrice) || 0);
  const discountVal = Math.max(0, Number(value) || 0);
  if (price === 0 || discountVal === 0) return Math.round(price);

  if (type === 'percentage') {
    const percent = Math.min(100, discountVal);
    return Math.max(0, Math.round(price * (1 - percent / 100)));
  }

  return Math.max(0, Math.round(price - discountVal));
}

