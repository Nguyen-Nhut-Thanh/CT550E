export type FlashDealRecord = {
    deal_id: number;
    discount_type: string;
    discount_value: number | string;
    start_date: string;
    status: number;
};
export type FlashDealSchedule = {
    tour_schedule_id: number;
    start_date: string;
    quota: number;
    price: number | string;
    tours?: {
        code?: string | null;
        name?: string | null;
    } | null;
    _count?: {
        bookings?: number;
    } | null;
    flash_deals?: FlashDealRecord | null;
};
