export interface CancellationPolicyTier {
  id: string;
  minDaysBefore: number;
  maxDaysBefore: number | null;
  penaltyPercent: number;
  refundPercent: number;
  title: string;
  description: string;
}

export const DEFAULT_CANCELLATION_TIERS: CancellationPolicyTier[] = [
  {
    id: "free",
    minDaysBefore: 15,
    maxDaysBefore: null,
    penaltyPercent: 0,
    refundPercent: 100,
    title: "Trước từ 15 ngày trở lên",
    description: "Miễn phí hủy tour, hoàn trả 100% chi phí đã thanh toán",
  },
  {
    id: "low_penalty",
    minDaysBefore: 7,
    maxDaysBefore: 14,
    penaltyPercent: 20,
    refundPercent: 80,
    title: "Từ 7 đến 14 ngày trước ngày đi",
    description: "Khấu trừ 20% chi phí đặt cọc/dịch vụ, hoàn lại 80%",
  },
  {
    id: "medium_penalty",
    minDaysBefore: 4,
    maxDaysBefore: 6,
    penaltyPercent: 50,
    refundPercent: 50,
    title: "Từ 4 đến 6 ngày trước ngày đi",
    description: "Khấu trừ 50% chi phí chuyến đi, hoàn lại 50%",
  },
  {
    id: "high_penalty",
    minDaysBefore: 1,
    maxDaysBefore: 3,
    penaltyPercent: 80,
    refundPercent: 20,
    title: "Từ 1 đến 3 ngày trước ngày đi",
    description: "Khấu trừ 80% do dịch vụ đã chốt, hoàn lại 20%",
  },
  {
    id: "no_refund",
    minDaysBefore: 0,
    maxDaysBefore: 0,
    penaltyPercent: 100,
    refundPercent: 0,
    title: "Trong vòng 24 giờ hoặc đã khởi hành",
    description: "Không áp dụng hoàn tiền do đã sát giờ hoặc sau giờ khởi hành",
  },
];

export interface CancellationEstimate {
  daysRemaining: number;
  hoursRemaining: number;
  isDeparted: boolean;
  tier: CancellationPolicyTier;
  paidAmount: number;
  penaltyAmount: number;
  refundAmount: number;
  canCancelInstantly: boolean;
  canRequestRefund: boolean;
}

export function calculateCancellationEstimate(params: {
  startDate: string | Date;
  totalAmount: number | string | any;
  isPaid: boolean;
  now?: Date;
}): CancellationEstimate {
  const now = params.now || new Date();
  const start = new Date(params.startDate);
  const paidAmount = Math.max(0, Math.round(Number(params.totalAmount) || 0));

  const diffMs = start.getTime() - now.getTime();
  const hoursRemaining = Math.round(diffMs / (1000 * 60 * 60));
  const isDeparted = diffMs <= 0;
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  let matchedTier = DEFAULT_CANCELLATION_TIERS[DEFAULT_CANCELLATION_TIERS.length - 1];

  if (!isDeparted) {
    if (hoursRemaining < 24) {
      matchedTier = DEFAULT_CANCELLATION_TIERS[4]; // no_refund
    } else if (daysRemaining >= 15) {
      matchedTier = DEFAULT_CANCELLATION_TIERS[0]; // free
    } else if (daysRemaining >= 7) {
      matchedTier = DEFAULT_CANCELLATION_TIERS[1]; // 20%
    } else if (daysRemaining >= 4) {
      matchedTier = DEFAULT_CANCELLATION_TIERS[2]; // 50%
    } else if (daysRemaining >= 1) {
      matchedTier = DEFAULT_CANCELLATION_TIERS[3]; // 80%
    }
  }

  const penaltyAmount = Math.round((paidAmount * matchedTier.penaltyPercent) / 100);
  const refundAmount = Math.max(0, paidAmount - penaltyAmount);

  return {
    daysRemaining,
    hoursRemaining,
    isDeparted,
    tier: matchedTier,
    paidAmount,
    penaltyAmount,
    refundAmount,
    canCancelInstantly: !params.isPaid && !isDeparted,
    canRequestRefund: params.isPaid && !isDeparted,
  };
}

export interface CancelBookingPayload {
  reason: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  estimatedRefundAmount?: number;
}

export const CANCELLATION_REASONS = [
  "Bận việc gia đình đột xuất",
  "Lý do sức khỏe / y tế cá nhân",
  "Thay đổi kế hoạch nghỉ phép / công việc",
  "Đặt nhầm ngày hoặc thông tin chuyến đi",
  "Thời tiết không thuận lợi",
  "Lý do khác",
];

export const ADMIN_OPERATOR_CANCEL_REASONS = [
  "Thời tiết xấu / Bão lũ thiên tai bất khả kháng",
  "Không đủ số lượng khách tối thiểu để khởi hành đoàn",
  "Hãng hàng không hủy chuyến / Trục trặc phương tiện vận tải",
  "Điểm đến gặp sự cố an ninh / Dịch bệnh bất khả kháng",
  "Trục trặc kỹ thuật và an toàn vận hành tour",
  "Lý do vận hành khác từ công ty",
];

export const ADMIN_CUSTOMER_CANCEL_REASONS = [
  "Khách hàng yêu cầu hủy qua hotline / tin nhắn",
  "Khách có việc đột xuất / sức khỏe không tham gia được",
  "Khách thay đổi kế hoạch nghỉ phép / công việc",
  "Khách yêu cầu dời ngày / chuyển sang tour khác",
  "Lý do cá nhân khác của khách hàng",
];

export const ADMIN_CANCELLATION_REASONS = [
  "Khách hàng yêu cầu hủy qua hotline / tin nhắn",
  "Khách có việc đột xuất / sức khỏe không tham gia được",
  "Tour bị hủy do thời tiết xấu / bất khả kháng",
  "Không đủ số lượng khách tối thiểu để khởi hành",
  "Khách yêu cầu đổi ngày / chuyển sang tour khác",
  "Lý do kỹ thuật hoặc điều hành vận hành",
  "Lý do khác",
];

export const ADMIN_PENDING_CANCEL_REASONS = [
  "Quá thời hạn 12h giữ chỗ chưa thanh toán",
  "Khách hàng liên hệ báo hủy / không tham gia",
  "Không liên lạc được với khách hàng để xác nhận",
  "Khách đặt nhầm thông tin hoặc trùng đơn",
  "Khách yêu cầu đổi lịch trình / chuyển tour khác",
  "Lý do khác",
];

export const POPULAR_VIETNAMESE_BANKS = [
  "Vietcombank (VCB)",
  "MB Bank (MB)",
  "Techcombank (TCB)",
  "VietinBank (CTG)",
  "BIDV",
  "Agribank",
  "ACB",
  "VPBank",
  "TPBank",
  "Sacombank",
  "VIB",
  "HDBank",
  "SHB",
  "OCB",
  "MSB",
  "SeABank",
  "Khác",
];
