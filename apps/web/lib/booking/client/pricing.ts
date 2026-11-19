import { applyDiscount } from "shared";
import type { TourSchedule, TravelerType } from "shared";
import { formatVND } from "@/lib/utils/currency";

export interface ActiveSchedulePromotionInfo {
  title: string;
  discountType: "percentage" | "fixed" | string;
  discountValue: number;
  discountLabel: string;
  giftDescription?: string | null;
  originalPrice: number;
  effectivePrice: number;
}

/**
 * Trích xuất ưu đãi đang hoạt động của đợt khởi hành (Flash Deal hoặc Schedule Promotion)
 */
export function getActiveSchedulePromotion(
  schedule: TourSchedule | null,
): ActiveSchedulePromotionInfo | null {
  if (!schedule) return null;

  // 1. Ưu tiên Flash Deal nếu có
  if (schedule.flash_deals) {
    const deal = schedule.flash_deals;
    const discountValue = Number(deal.discount_value);
    const originalPrice = Number(schedule.original_price ?? schedule.price);
    const effectivePrice = Number(schedule.price);
    return {
      title: "Flash Deal",
      discountType: deal.discount_type,
      discountValue,
      discountLabel:
        deal.discount_type === "percentage"
          ? `-${discountValue}%`
          : `-${formatVND(discountValue)}`,
      originalPrice,
      effectivePrice,
    };
  }

  // 2. Ưu đãi riêng theo đợt khởi hành (Schedule Promotion)
  const promo = schedule.schedule_promotions;
  if (promo) {
    const isActive = (promo as any).has_promotion || (promo as any).is_active;
    if (isActive) {
      const discountType = promo.discount_type || "percentage";
      const discountValue = Number(promo.discount_value ?? 0);
      const title = (promo as any).promotion_title || (promo as any).title || "Ưu đãi đợt khởi hành";
      const originalPrice = Number((promo as any).original_price ?? schedule.original_price ?? schedule.price);
      const effectivePrice = Number((promo as any).effective_price ?? schedule.price);
      return {
        title,
        discountType,
        discountValue,
        discountLabel:
          discountType === "percentage"
            ? `-${discountValue}%`
            : `-${formatVND(discountValue)}`,
        giftDescription: promo.gift_description,
        originalPrice,
        effectivePrice,
      };
    }
  }

  return null;
}

export function getUnitPrice(
  schedule: TourSchedule | null,
  type: TravelerType,
): number {
  if (!schedule) return 0;

  const passengerTypeMap = {
    adult: ["ADULT", "adult"],
    child: ["CHILD", "child"],
    infant: ["INFANT", "infant"],
  } as const;

  const matchedPrice = schedule.tour_schedule_prices?.find(
    (item) => passengerTypeMap[type].includes(item.passenger_type as never),
  );

  const rawPrice = matchedPrice
    ? Number(matchedPrice.price)
    : type === "adult"
      ? Number(schedule.original_price ?? schedule.price ?? 0)
      : 0;

  const promoInfo = getActiveSchedulePromotion(schedule);

  if (promoInfo && (type === "adult" || type === "child") && rawPrice > 0) {
    // Nếu là người lớn và schedule.price đã là giá sau giảm thì ưu tiên dùng schedule.price
    if (type === "adult" && schedule.price && Number(schedule.price) < rawPrice) {
      return Number(schedule.price);
    }
    // Nếu matchedPrice đã có original_price (đã được backend chiết khấu) thì rawPrice đã là giá ưu đãi
    if (matchedPrice && (matchedPrice as any).original_price) {
      return rawPrice;
    }
    // Áp dụng giảm giá ưu đãi
    return applyDiscount(rawPrice, promoInfo.discountType, promoInfo.discountValue);
  }

  return type === "adult" ? Number(schedule.price ?? rawPrice) : rawPrice;
}

export function getSingleRoomSurchargeTotal(schedule: TourSchedule | null): number {
  if (!schedule) return 0;
  if (schedule.single_room_surcharge !== undefined && schedule.single_room_surcharge !== null) {
    return Number(schedule.single_room_surcharge);
  }
  const legacySingleRoom = schedule?.tour_schedule_prices?.find((item) =>
    ["SINGLE_ROOM", "single_room"].includes(item.passenger_type),
  );
  return legacySingleRoom ? Number(legacySingleRoom.price) : 0;
}
