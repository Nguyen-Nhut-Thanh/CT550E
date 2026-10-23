export type BestSellerStat = {
    tour_id: number;
    booking_count: number;
    passenger_count: number;
};
export type PublicFlashDealRecord = {
    discount_type: string;
    discount_value: unknown;
};
export type PublicItineraryRecord = {
    day_number: number;
    title: string | null;
    content: string | null;
    meals: string | null;
};
export type PublicScheduleRecord = {
    tour_schedule_id: number;
    code?: string | null;
    start_date: Date;
    end_date: Date;
    price: unknown;
    quota: number;
    booked_count: number;
    cover_image_url?: string | null;
    flash_deals?: PublicFlashDealRecord | null;
    tour_schedule_hotels?: Array<{
        schedule_hotel_id: number;
        hotel_id: number;
        room_type_id: number;
        nights: number;
        day_from: number | null;
        day_to: number | null;
        note: string | null;
        hotels?: {
            hotel_id: number;
            name: string;
            star_rating: number | null;
        } | null;
        hotel_room_types?: {
            room_type_id: number;
            name: string;
            base_price: unknown;
            extra_price?: unknown;
        } | null;
    }>;
    tour_itineraries?: PublicItineraryRecord[];
};
export type PublicDestinationRecord = {
    visit_order: number;
    locations?: {
        location_id: number | null;
        name: string | null;
        slug: string | null;
    } | null;
};
export type PublicTourCardRecord = {
    tour_id: number;
    code: string;
    name: string;
    summary: string | null;
    duration_days: number;
    duration_nights: number;
    base_price: unknown;
    tour_type: string;
    updated_at: Date;
    cut_off_hours: number | null;
    departure_locations?: {
        location_id: number;
        name: string;
        slug: string | null;
    } | null;
    tour_images?: Array<{
        image_url: string | null;
    }>;
    tour_destinations?: PublicDestinationRecord[];
    tour_schedules?: PublicScheduleRecord[];
    transports?: {
        name: string;
        transport_type: string;
    } | null;
    rating_avg?: number | string | null;
    rating_count?: number | string | null;
};
