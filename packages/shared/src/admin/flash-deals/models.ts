export type FlashDealRecord = {
    deal_id: number;
    discount_type: string;
    discount_value: number | string;
    start_date: string;
    end_date?: string;
    status: number;
};
export type FlashDealSchedule = {
    status?: number;
    booked_count?: number;
    cover_image_url?: string | null;
    tour_schedule_id: number;
    start_date: string;
    quota: number;
    price: number | string;
    tours?: {
        tour_id?: number;
        status?: number;
        tour_images?: { image_url: string }[];
        tour_destinations?: { locations: { location_id: number; name: string } }[];
        code?: string | null;
        name?: string | null;
    } | null;
    _count?: {
        bookings?: number;
    } | null;
    flash_deals?: FlashDealRecord | null;
};
