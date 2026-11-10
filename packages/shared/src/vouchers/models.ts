export type Voucher = {
    eligible_tiers?: import("../membership/models").MembershipTierId[];
    notification_count?: number;
    voucher_id: number;
    code: string;
    name?: string;
    short_description?: string;
    image_url?: string;
    discount_type: string;
    discount_value: number | string;
    min_order_value: number | string;
    max_discount_amount: number | string | null;
    usage_limit: number;
    used_count: number;
    usage_limit_per_user?: number;
    applicable_scope?: 'all' | 'tour_type' | 'specific_tours';
    applicable_tour_types?: string[];
    applicable_tour_ids?: number[];
    start_date: string;
    expiry_date: string;
    status: number;
};
export type VoucherLike = {
    expiry_date: string;
    used_count?: number;
    usage_limit?: number;
    start_date?: string;
    status?: number;
};
export type VoucherValidationResult = {
    voucher_id: number;
    code: string;
    discountAmount: number;
    finalAmount?: number;
};
