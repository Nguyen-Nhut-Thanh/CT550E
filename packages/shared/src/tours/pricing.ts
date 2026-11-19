/**
 * Làm tròn số tiền về hàng nghìn (1.000 đ) gần nhất
 */
export function roundToThousand(amount: number): number {
  return Math.round((Number(amount) || 0) / 1000) * 1000;
}

/**
 * Tính giá sau khi áp dụng khuyến mãi (Flash deal hoặc Schedule promotion)
 * Tự động làm tròn tiền giảm giá và giá bán về bội số 1.000 đ
 */
export function applyDiscount(
  basePrice: number,
  type: string,
  value: number
): number {
  const price = Math.max(0, Number(basePrice) || 0);
  const discountVal = Math.max(0, Number(value) || 0);
  if (price === 0 || discountVal === 0) return roundToThousand(price);

  if (type === 'percentage') {
    const percent = Math.min(100, discountVal);
    // Tính tiền giảm và làm tròn đến 1.000 đ
    const discountAmount = roundToThousand((price * percent) / 100);
    return Math.max(0, price - discountAmount);
  }

  return Math.max(0, roundToThousand(price - discountVal));
}

export interface SchedulePricingResult {
  originalPrice: number;
  effectivePrice: number;
  salePrice: number;
  flash_deals: any | null;
  schedule_promotions: {
    has_promotion: boolean;
    promotion_title: string;
    discount_type: string;
    discount_value: number;
    effective_price: number;
    original_price: number;
    is_active: boolean;
    gift_description?: string | null;
  } | null;
  flashDeal?: any | null;
  schedulePromotion?: any | null;
}

/**
 * Gom logic tính giá sau khuyến mãi (Flash Deal vs Schedule Promotion) thành pure function dùng chung
 */
export function calculateSchedulePricing(
  schedule: {
    price?: number | string | unknown;
    flash_deal?: any | null;
    flash_deals?: any | null;
    schedule_promotion?: any | null;
    schedule_promotions?: any | null;
  },
  now = new Date()
): SchedulePricingResult {
  const originalPrice = Number(schedule.price ?? 0);
  let salePrice = originalPrice;
  const flashDeal = schedule.flash_deal ?? schedule.flash_deals ?? null;
  let schedulePromotion = null;

  if (flashDeal) {
    const discountValue = Number(flashDeal.discount_value);
    salePrice = applyDiscount(originalPrice, flashDeal.discount_type, discountValue);
  } else {
    const p = schedule.schedule_promotion ?? schedule.schedule_promotions ?? null;
    if (p && p.is_active) {
      const pStart = new Date(p.start_date);
      const pEnd = new Date(p.end_date);
      const hasSlot = p.max_slots === null || p.max_slots === undefined || p.used_slots < p.max_slots;
      if (pStart <= now && pEnd >= now && hasSlot) {
        const discountValue = Number(p.discount_value);
        salePrice = applyDiscount(originalPrice, p.discount_type, discountValue);
        schedulePromotion = {
          has_promotion: true,
          promotion_title: p.title,
          discount_type: p.discount_type,
          discount_value: discountValue,
          effective_price: roundToThousand(salePrice),
          original_price: originalPrice,
          is_active: p.is_active,
          gift_description: p.gift_description,
        };
      }
    }
  }

  const effectivePrice = roundToThousand(salePrice);

  return {
    originalPrice,
    salePrice,
    effectivePrice,
    flash_deals: flashDeal,
    schedule_promotions: schedulePromotion,
    flashDeal,
    schedulePromotion,
  };
}


