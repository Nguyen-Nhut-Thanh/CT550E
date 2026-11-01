export type LocationOption = {
    level_id?: number;
    parent_id?: number | null;
    location_id: number;
    name: string;
    country_code?: string | null;
};
export type TransportOption = {
    transport_id: number;
    name: string;
    transport_type: string;
};
export type ToursPageTour = {
    tour_id: number;
    code: string;
    name: string;
    duration_days: number;
    duration_nights: number;
    base_price: string | number;
    status: number;
    tour_type: string | null;
    summary?: string | null;
    booked_count?: number;
    countries?: { location_id: number; name: string }[];
    tour_images?: {
        image_url: string;
        is_cover?: number;
    }[];
};
export type TourScheduleSummary = {
    _count?: {
        bookings?: number;
    };
};
export type TourLike = {
    summary?: string | null;
    code?: string | null;
    name?: string | null;
    status: number;
    tour_type?: string | null;
};
