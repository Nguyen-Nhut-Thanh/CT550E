export type VoucherPayload = {
  code?: string;
  discount_type?: string;
  discount_value?: number | string;
  min_order_value?: number | string | null;
  max_discount_amount?: number | string | null;
  usage_limit?: number | string | null;
  start_date?: string | Date;
  expiry_date?: string | Date;
  status?: number | string;
};

export type VoucherLike = {
  expiry_date: string;
  used_count?: number;
};

export type VoucherValidationResult = {
  voucher_id: number;
  code: string;
  discountAmount: number;
  finalAmount?: number;
};

export type VoucherValidationApiResponse = {
  voucher_id: number;
  code: string;
  discount_amount: number;
  final_amount?: number;
};
