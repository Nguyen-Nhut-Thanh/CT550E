export type VoucherForm = {
    customer_types: Array<"all" | import("../../membership/models").MembershipTierId>;
    code: string;
    discount_type: string;
    discount_value: number;
    min_order_value: number;
    max_discount_amount: number | null;
    usage_limit: number;
    start_date: string;
    duration_hours: number;
    status: number;
};
export type VoucherStatusFilter = "all" | "active" | "locked" | "upcoming" | "expired" | "exhausted";
