export type MembershipTierId =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond";

export interface MembershipTier {
  id: MembershipTierId;
  name: string;
  threshold: number;
  discountType: "fixed" | "percentage";
  discountValue: number;
  maxDiscount: number;
  minOrder: number;
  benefits: string[];
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: "bronze",
    name: "Đồng",
    threshold: 0,
    discountType: "fixed",
    discountValue: 0,
    maxDiscount: 0,
    minOrder: 0,
    benefits: [
      "Tích lũy chi tiêu sau mỗi chuyến đi",
      "Nhận ưu đãi dành cho thành viên",
    ],
  },
  {
    id: "silver",
    name: "Bạc",
    threshold: 5_000_000,
    discountType: "fixed",
    discountValue: 100_000,
    maxDiscount: 100_000,
    minOrder: 2_000_000,
    benefits: ["Voucher 100.000đ khi đạt hạng", "Ưu đãi dành cho thành viên"],
  },
  {
    id: "gold",
    name: "Vàng",
    threshold: 15_000_000,
    discountType: "percentage",
    discountValue: 3,
    maxDiscount: 200_000,
    minOrder: 3_000_000,
    benefits: [
      "Voucher giảm 3%, tối đa 200.000đ",
      "Ưu đãi dành cho thành viên",
    ],
  },
  {
    id: "platinum",
    name: "Bạch kim",
    threshold: 30_000_000,
    discountType: "percentage",
    discountValue: 5,
    maxDiscount: 400_000,
    minOrder: 5_000_000,
    benefits: ["Voucher giảm 5%, tối đa 400.000đ", "Ưu tiên hỗ trợ khách hàng"],
  },
  {
    id: "diamond",
    name: "Kim cương",
    threshold: 60_000_000,
    discountType: "percentage",
    discountValue: 7,
    maxDiscount: 700_000,
    minOrder: 7_000_000,
    benefits: [
      "Voucher giảm 7%, tối đa 700.000đ",
      "Ưu tiên hỗ trợ và nhận thông tin tour riêng",
    ],
  },
];

export interface MembershipVoucher {
  voucher_id: number;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  max_discount_amount: number | null;
  start_date: string;
  expiry_date: string;
  state: "available" | "used" | "expired";
}

export interface MembershipNotification {
  notification_id: number;
  title: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

export interface MembershipSummary {
  tier: MembershipTier;
  tiers: MembershipTier[];
  cycleStart: string | null;
  cycleEnd: string | null;
  spending: number;
  points: number;
  nextTier: MembershipTier | null;
  toNextTier: number;
  toRetainTier: number;
  progress: number;
  vouchers: MembershipVoucher[];
  notifications: MembershipNotification[];
  history: {
    bookingId: number;
    tourName: string;
    completedAt: string;
    amount: number;
    points: number;
  }[];
  cycles: {
    start: string;
    end: string;
    spending: number;
    tier: MembershipTierId;
  }[];
}

export interface MembershipAdminList {
  items: {
    userId: number;
    name: string;
    email: string;
    tier: string;
    spending: number;
    cycleEnd: string | null;
    voucherCount: number;
  }[];
  total: number;
  page: number;
  tiers: MembershipTier[];
  issued: number;
  used: number;
  discountTotal: number;
}

export function membershipDiscount(
  voucher: {
    discount_type: string;
    discount_value: number;
    min_order_value: number;
    max_discount_amount: number | null;
  },
  amount: number,
): number {
  if (
    !Number.isFinite(amount) ||
    amount < voucher.min_order_value ||
    amount <= 0
  )
    return 0;
  let discount =
    voucher.discount_type === "percentage"
      ? (amount * voucher.discount_value) / 100
      : voucher.discount_value;
  if (
    voucher.discount_type === "percentage" &&
    voucher.max_discount_amount !== null
  )
    discount = Math.min(discount, voucher.max_discount_amount);
  return Math.min(amount, Math.round(Math.max(0, discount)));
}
