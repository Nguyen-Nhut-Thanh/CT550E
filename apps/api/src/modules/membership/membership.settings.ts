import { BadRequestException } from "@nestjs/common";
import { MEMBERSHIP_TIERS, type MembershipTier } from "shared";

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
    const discount =
      item.discountType === "percentage"
        ? `Voucher giảm ${item.discountValue}%, tối đa ${item.maxDiscount.toLocaleString("vi-VN")}đ`
        : `Voucher ${item.discountValue.toLocaleString("vi-VN")}đ khi đạt hạng`;
    return {
      ...defaults,
      threshold: item.threshold,
      discountType: item.discountType,
      discountValue: item.discountValue,
      maxDiscount:
        item.discountType === "fixed" ? item.discountValue : item.maxDiscount,
      minOrder: item.minOrder,
      benefits:
        index === 0
          ? defaults.benefits
          : [discount, ...defaults.benefits.slice(1)],
    };
  });
}
