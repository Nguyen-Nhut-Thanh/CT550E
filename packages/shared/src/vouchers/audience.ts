import type { MembershipTierId } from "../membership/models";

export const VOUCHER_CUSTOMER_TYPES: { value: "all" | MembershipTierId; label: string }[] = [
  { value: "all", label: "Tất cả khách hàng" },
  { value: "bronze", label: "Member (cơ bản)" },
  { value: "silver", label: "Bạc (Silver)" },
  { value: "gold", label: "Vàng (Gold)" },
  { value: "platinum", label: "Bạch kim (Platinum)" },
  { value: "diamond", label: "Kim cương (Diamond)" },
];

export function voucherAudienceLabel(tiers: readonly string[] = []): string {
  return tiers.length ? VOUCHER_CUSTOMER_TYPES.filter(item => tiers.includes(item.value)).map(item => item.label).join(", ") : "Tất cả khách hàng";
}

export function voucherAudienceAllows(tiers: readonly string[] | undefined, currentTier?: string | null): boolean {
  return !tiers?.length || (typeof currentTier === "string" && tiers.includes(currentTier));
}
