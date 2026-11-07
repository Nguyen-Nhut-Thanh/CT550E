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
  tourDiscountPercent: number;
  pointMultiplier: number;
  birthdayVoucherAmount: number;
  serviceDiscountPercent: number;
  priorityReservation: boolean;
}

export const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    id: "bronze",
    name: "Đồng",
    tourDiscountPercent: 0, pointMultiplier: 1, birthdayVoucherAmount: 50_000, serviceDiscountPercent: 0, priorityReservation: false,
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
    tourDiscountPercent: 2, pointMultiplier: 1.2, birthdayVoucherAmount: 100_000, serviceDiscountPercent: 5, priorityReservation: false,
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
    tourDiscountPercent: 3, pointMultiplier: 1.5, birthdayVoucherAmount: 200_000, serviceDiscountPercent: 10, priorityReservation: true,
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
    tourDiscountPercent: 5, pointMultiplier: 2, birthdayVoucherAmount: 300_000, serviceDiscountPercent: 15, priorityReservation: true,
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
    tourDiscountPercent: 7, pointMultiplier: 3, birthdayVoucherAmount: 500_000, serviceDiscountPercent: 20, priorityReservation: true,
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
  state: "available" | "used" | "expired" | "upcoming";
  eligible_tiers?: MembershipTierId[];
  is_birthday?: boolean;
}

export interface MembershipNotification {
  booking_id?: number | null;
  voucher_id?: number | null;
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
    phone: string | null;
    bookingCount: number;
  }[];
  total: number;
  page: number;
  tiers: MembershipTier[];
  issued: number;
  used: number;
  discountTotal: number;
  memberTotal: number;
}

export interface MembershipBookingSnapshot {
  tier: MembershipTierId;
  name: string;
  pointMultiplier: number;
  priorityReservation: boolean;
  tourDiscountPercent: number;
  serviceDiscountPercent: number;
  tourDiscount: number;
  serviceDiscount: number;
  voucherDiscount: number;
}

export function membershipBenefits(tier: MembershipTier): string[] {
  return [
    ...(tier.tourDiscountPercent ? [`Giảm ${tier.tourDiscountPercent}% giá tour`] : []),
    `Tích điểm ×${tier.pointMultiplier.toLocaleString("vi-VN")}`,
    ...(tier.birthdayVoucherAmount ? [`Voucher sinh nhật ${tier.birthdayVoucherAmount.toLocaleString("vi-VN")}đ`] : []),
    ...(tier.serviceDiscountPercent ? [`Giảm ${tier.serviceDiscountPercent}% dịch vụ đi kèm`] : []),
    ...(tier.priorityReservation ? ["Ưu tiên xử lý yêu cầu giữ chỗ"] : []),
  ];
}

export function membershipPrice(tier: MembershipTier | null, subtotal: number, servicesTotal: number, voucherDiscount = 0) {
  const tourDiscount = Math.floor(Math.max(0, subtotal - voucherDiscount) * (tier?.tourDiscountPercent ?? 0) / 100);
  const serviceDiscount = Math.floor(servicesTotal * (tier?.serviceDiscountPercent ?? 0) / 100);
  return { tourDiscount, serviceDiscount };
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
