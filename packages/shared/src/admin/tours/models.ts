export type LocationOption = {
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
    tour_images?: {
        image_url: string;
        is_cover: number;
    }[];
};
export type TourScheduleSummary = {
    _count?: {
        bookings?: number;
    };
};
export type TourLike = {
    code?: string | null;
    name?: string | null;
    status: number;
    tour_type?: string | null;
};
