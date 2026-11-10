export type VoucherPayload = {
    eligible_tiers?: import("../membership/models").MembershipTierId[];
    code?: string;
    name?: string;
    short_description?: string;
    image_url?: string;
    discount_type?: string;
    discount_value?: number | string;
    min_order_value?: number | string | null;
    max_discount_amount?: number | string | null;
    usage_limit?: number | string | null;
    usage_limit_per_user?: number | string | null;
    applicable_scope?: 'all' | 'tour_type' | 'specific_tours';
    applicable_tour_types?: string[];
    applicable_tour_ids?: number[];
    start_date?: string | Date;
    expiry_date?: string | Date;
    status?: number | string;
};
export type VoucherValidationApiResponse = {
    voucher_id: number;
    code: string;
    discount_amount: number;
    final_amount?: number;
};
