import { BadRequestException } from "@nestjs/common";
import { MEMBERSHIP_TIERS, membershipBenefits, type MembershipTier } from "shared";

export function normalizeMembershipTiers(value: unknown): MembershipTier[] {
  if (!Array.isArray(value) || value.length !== MEMBERSHIP_TIERS.length)
    throw new BadRequestException("Cần đủ 5 hạng thành viên.");
  let previous = -1;
  return MEMBERSHIP_TIERS.map((defaults, index) => {
    const item = value[index];
    if (
      !item ||
      typeof item !== "object" ||
      item.id !== defaults.id ||
      ![
        item.threshold,
        item.discountValue,
        item.minOrder,
        item.maxDiscount,
      ].every(
        (number) =>
          typeof number === "number" &&
          Number.isSafeInteger(number) &&
          number >= 0 &&
          number <= 1_000_000_000_000,
      ) ||
      item.threshold <= previous ||
      !["fixed", "percentage"].includes(item.discountType) ||
      (index === 0 &&
        (item.threshold !== 0 ||
          item.discountValue !== 0 ||
          item.maxDiscount !== 0 ||
          item.minOrder !== 0)) ||
      (index > 0 && (item.discountValue <= 0 || item.maxDiscount <= 0)) ||
      (item.discountType === "percentage" && item.discountValue > 100)
    ) {
      throw new BadRequestException(
        "Mốc hạng phải tăng dần, giá trị tiền là số nguyên không âm, phần trăm tối đa 100 và ưu đãi hạng Đồng bằng 0.",
      );
    }
    previous = item.threshold;
    const benefits = {
      tourDiscountPercent: item.tourDiscountPercent ?? defaults.tourDiscountPercent,
      pointMultiplier: item.pointMultiplier ?? defaults.pointMultiplier,
      birthdayVoucherAmount: item.birthdayVoucherAmount ?? defaults.birthdayVoucherAmount,
      serviceDiscountPercent: item.serviceDiscountPercent ?? defaults.serviceDiscountPercent,
      priorityReservation: item.priorityReservation ?? defaults.priorityReservation,
    };
    if (![benefits.tourDiscountPercent, benefits.serviceDiscountPercent].every(value => Number.isFinite(value) && value >= 0 && value <= 100) ||
      !Number.isFinite(benefits.pointMultiplier) || benefits.pointMultiplier < 1 || benefits.pointMultiplier > 10 ||
      Math.abs(benefits.pointMultiplier * 10 - Math.round(benefits.pointMultiplier * 10)) > 0.000001 ||
      !Number.isSafeInteger(benefits.birthdayVoucherAmount) || benefits.birthdayVoucherAmount < 0 || benefits.birthdayVoucherAmount > 1_000_000_000 ||
      typeof benefits.priorityReservation !== 'boolean') {
      throw new BadRequestException('Phần trăm phải từ 0–100, hệ số điểm từ 1–10 (tối đa 1 chữ số thập phân), voucher sinh nhật là số tiền nguyên không âm.');
    }
    const result: MembershipTier = {
      ...defaults,
      ...benefits,
      threshold: item.threshold,
      discountType: item.discountType,
      discountValue: item.discountValue,
      maxDiscount:
        item.discountType === "fixed" ? item.discountValue : item.maxDiscount,
      minOrder: item.minOrder,
      benefits: [],
    };
    result.benefits = membershipBenefits(result);
    return result;
  });
}
