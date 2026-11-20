import { applyDiscount } from "shared";

type Price = number | string | { toString(): string };

type Discount = {
  title?: string | null;
  discount_type: string;
  discount_value: Price;
};

type SchedulePromotion = Discount & {
  is_active: boolean;
  start_date: Date;
  end_date: Date;
  max_slots: number | null;
  used_slots: number;
  gift_description: string | null;
};

type Schedule = {
  price: Price;
  tour_schedule_prices: { passenger_type: string; price: Price }[];
  flash_deals: Discount | null;
  schedule_promotions: SchedulePromotion | null;
};

export type Party = { adults: number; children: number; infants: number };

export function calculateBookingTourPrice(schedule: Schedule, party: Party, now = new Date()) {
  const findPrice = (type: string) =>
    schedule.tour_schedule_prices.find((item) => item.passenger_type === type)?.price;
  const configuredChildPrice = findPrice("CHILD");
  const configuredInfantPrice = findPrice("INFANT");
  const baseAdultPrice = Number(findPrice("ADULT") ?? schedule.price);
  const baseChildPrice = Number(configuredChildPrice ?? 0);
  const infantPrice = Number(configuredInfantPrice ?? 0);
  const promo = schedule.schedule_promotions;
  const activeSchedulePromo = !schedule.flash_deals && Boolean(
    promo?.is_active && promo.start_date <= now && promo.end_date >= now &&
    (promo.max_slots == null || promo.used_slots + party.adults + party.children <= promo.max_slots),
  );
  const discount = schedule.flash_deals ?? (activeSchedulePromo ? promo : null);
  const appliedPromoType = schedule.flash_deals
    ? "flash_deal"
    : activeSchedulePromo ? "schedule_promotion" : null;
  const adultPrice = discount ? applyDiscount(baseAdultPrice, discount.discount_type, Number(discount.discount_value)) : baseAdultPrice;
  const childPrice = discount && baseChildPrice > 0
    ? applyDiscount(baseChildPrice, discount.discount_type, Number(discount.discount_value))
    : baseChildPrice;

  let appliedPromoTitle = "";
  if (discount) {
    const amount = Number(discount.discount_value);
    const label = discount.discount_type === "percent" || discount.discount_type === "percentage"
      ? `-${amount}%`
      : `-${amount.toLocaleString("vi-VN")}đ`;
    const title = discount.title || (schedule.flash_deals ? "Flash Deal" : "Ưu đãi đợt khởi hành");
    appliedPromoTitle = `${title} (${label})`;
  }

  const subtotal = party.adults * adultPrice + party.children * childPrice + party.infants * infantPrice;
  const promoDiscount = Math.max(0,
    (baseAdultPrice - adultPrice) * party.adults + (baseChildPrice - childPrice) * party.children,
  );

  return {
    adultPrice, childPrice, infantPrice, baseAdultPrice, baseChildPrice, subtotal, promoDiscount,
    activeSchedulePromo, appliedPromoType, appliedPromoTitle,
    appliedGiftDescription: activeSchedulePromo ? promo?.gift_description ?? null : null,
    missingChildPrice: party.children > 0 && configuredChildPrice == null,
    missingInfantPrice: party.infants > 0 && configuredInfantPrice == null,
  };
}

