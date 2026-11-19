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
    tourDiscountPercent: 0,
    pointMultiplier: 1,
    birthdayVoucherAmount: 50_000,
    serviceDiscountPercent: 0,
    priorityReservation: false,
    threshold: 0,
    discountType: "fixed",
    discountValue: 0,
    maxDiscount: 0,
    minOrder: 0,
    benefits: [
      "Tích lũy chi tiêu & điểm thưởng sau mỗi chuyến đi",
      "Voucher sinh nhật 50.000đ hàng năm",
      "Hỗ trợ tư vấn tour tiêu chuẩn",
    ],
  },
  {
    id: "silver",
    name: "Bạc",
    tourDiscountPercent: 2,
    pointMultiplier: 1.2,
    birthdayVoucherAmount: 100_000,
    serviceDiscountPercent: 5,
    priorityReservation: false,
    threshold: 5_000_000,
    discountType: "fixed",
    discountValue: 100_000,
    maxDiscount: 100_000,
    minOrder: 2_000_000,
    benefits: [
      "Giảm 2% trực tiếp giá vé tour",
      "Tích lũy ×1.2 điểm thưởng",
      "Giảm 5% dịch vụ đi kèm (xe riêng, phòng VIP)",
      "Voucher sinh nhật 100.000đ",
      "Voucher thăng hạng 100.000đ (đơn từ 2.000.000đ)",
      "Thức uống chào mừng tại khách sạn đối tác",
    ],
  },
  {
    id: "gold",
    name: "Vàng",
    tourDiscountPercent: 3,
    pointMultiplier: 1.5,
    birthdayVoucherAmount: 200_000,
    serviceDiscountPercent: 10,
    priorityReservation: true,
    threshold: 15_000_000,
    discountType: "percentage",
    discountValue: 3,
    maxDiscount: 200_000,
    minOrder: 3_000_000,
    benefits: [
      "Giảm 3% trực tiếp giá vé tour",
      "Tích lũy ×1.5 điểm thưởng",
      "Giảm 10% dịch vụ đi kèm",
      "Voucher sinh nhật 200.000đ",
      "Voucher thăng hạng 3% (tối đa 200.000đ)",
      "Trip Shield: Đổi ngày khởi hành miễn phí 1 lần/năm (trước 7 ngày)",
      "Ưu tiên chọn chỗ ngồi đầu xe / máy bay",
      "Ưu tiên hỗ trợ và xử lý giữ chỗ",
    ],
  },
  {
    id: "platinum",
    name: "Bạch kim",
    tourDiscountPercent: 5,
    pointMultiplier: 2,
    birthdayVoucherAmount: 300_000,
    serviceDiscountPercent: 15,
    priorityReservation: true,
    threshold: 30_000_000,
    discountType: "percentage",
    discountValue: 5,
    maxDiscount: 400_000,
    minOrder: 5_000_000,
    benefits: [
      "Giảm 5% trực tiếp giá vé tour (chia sẻ tối đa 2 người đi cùng)",
      "Tích lũy ×2.0 điểm thưởng",
      "Giảm 15% dịch vụ đi kèm",
      "Voucher sinh nhật 300.000đ",
      "Voucher thăng hạng 5% (tối đa 400.000đ)",
      "1 lượt nâng hạng phòng resort/năm + 1 chuyến xe đón sân bay",
      "Trip Shield: Hoàn/hủy linh hoạt trước 72h về ví điểm",
      "Kênh hỗ trợ VIP riêng biệt",
    ],
  },
  {
    id: "diamond",
    name: "Kim cương",
    tourDiscountPercent: 7,
    pointMultiplier: 3,
    birthdayVoucherAmount: 500_000,
    serviceDiscountPercent: 20,
    priorityReservation: true,
    threshold: 60_000_000,
    discountType: "percentage",
    discountValue: 7,
    maxDiscount: 700_000,
    minOrder: 7_000_000,
    benefits: [
      "Giảm 7% trực tiếp giá vé tour (chia sẻ tối đa 3 người đi cùng)",
      "Tích lũy ×3.0 điểm thưởng",
      "Giảm 20% dịch vụ đi kèm",
      "Voucher sinh nhật 500.000đ + Quà chào mừng tại điểm đến",
      "Voucher thăng hạng 7% (tối đa 700.000đ)",
      "Tự động nâng hạng phòng cao cấp (Presidential/Villa) khi còn phòng",
      "Phòng chờ thương gia & Fast-track thủ tục sân bay",
      "Xe Mercedes đưa đón sân bay mọi chuyến đi",
      "Tặng 01 thẻ Bạc cho người thân",
      "Chuyên viên tư vấn & Quản gia Concierge 1-1 phục vụ 24/7",
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

export interface MembershipRewardItem {
  id: string;
  title: string;
  category: string;
  pointsCost: number;
  imageUrl: string;
  description: string;
  valueVnd?: number;
}

export const DEFAULT_MEMBERSHIP_REWARDS: MembershipRewardItem[] = [
  {
    id: "six-senses-villa",
    title: "01 Đêm Pool Villa tại Six Senses Ninh Vân Bay / Amanoi",
    category: "Nghỉ dưỡng 5 sao",
    pointsCost: 12_000,
    imageUrl: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    description: "Bao gồm bữa sáng tự chọn, trà chiều hoàng hôn và đưa đón bằng tàu cao tốc riêng cho 02 người.",
    valueVnd: 12_000_000,
  },
  {
    id: "business-class-upgrade",
    title: "Nâng Hạng Thương Gia (Business Class) Chặng Đông Nam Á",
    category: "Hàng không",
    pointsCost: 8_500,
    imageUrl: "https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&fit=crop&w=800&q=80",
    description: "Áp dụng cho Vietnam Airlines, Singapore Airlines hoặc Qatar Airways kèm dịch vụ phòng chờ VIP.",
    valueVnd: 8_500_000,
  },
  {
    id: "michelin-dining-spa",
    title: "Bữa Tối Fine Dining Michelin & Liệu Trình Spa 120 Phút",
    category: "Wellness & Ẩm thực",
    pointsCost: 4_500,
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
    description: "Thực đơn Tasting Menu 7 món kết hợp rượu vang hảo hạng và gói trị liệu thảo mộc hoàng gia.",
    valueVnd: 4_500_000,
  },
  {
    id: "private-yacht-sunset",
    title: "Du Thuyền Hoàng Hôn Riêng Tư Vịnh Hạ Long / Phú Quốc",
    category: "Du thuyền riêng",
    pointsCost: 18_000,
    imageUrl: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=800&q=80",
    description: "Trải nghiệm 4 giờ trên du thuyền Catamaran riêng tư cùng tiệc Champagne và đầu bếp phục vụ riêng.",
    valueVnd: 18_000_000,
  },
  {
    id: "tour-discount-voucher-1m",
    title: "Voucher Giảm Giá Tour Trị Giá 1.000.000đ",
    category: "Voucher tiền mặt",
    pointsCost: 1_000,
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    description: "Trừ trực tiếp 1.000.000đ khi đặt bất kỳ tour du lịch trọn gói nào trên hệ thống JourniTrip.",
    valueVnd: 1_000_000,
  },
  {
    id: "airport-transfer-mercedes",
    title: "Đưa Đón Sân Bay Bằng Xe Sang Mercedes-Benz",
    category: "Đưa đón VIP",
    pointsCost: 3_000,
    imageUrl: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80",
    description: "Xe riêng Mercedes E-Class đón hoặc tiễn sân bay với nước suối, khăn lạnh và tài xế chuyên nghiệp.",
    valueVnd: 3_000_000,
  },
];

export interface MembershipSummary {
  tier: MembershipTier;
  tiers: MembershipTier[];
  cycleStart: string | null;
  cycleEnd: string | null;
  spending: number;
  points: number;
  pointsBalance?: number;
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
  rewards?: MembershipRewardItem[];
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
  originalAdultPrice?: number;
  originalChildPrice?: number;
  promoType?: 'flash_deal' | 'schedule_promotion' | null;
  promoTitle?: string | null;
  promoDiscount?: number;
  promoGift?: string | null;
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
  const tourDiscount = Math.round(Math.max(0, subtotal - voucherDiscount) * (tier?.tourDiscountPercent ?? 0) / 100 / 1000) * 1000;
  const serviceDiscount = Math.round(servicesTotal * (tier?.serviceDiscountPercent ?? 0) / 100 / 1000) * 1000;
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
  return Math.min(amount, Math.round(Math.max(0, discount) / 1000) * 1000);
}
