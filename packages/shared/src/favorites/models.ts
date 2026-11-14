export type FavoriteTourItem = {
    tour_id: number;
    created_at?: string | Date;
    tours: {
        tour_id: number;
        name: string;
        status: number;
        base_price: number | string;
        duration_days: number;
        duration_nights: number;
        tour_type: string;
        summary?: string | null;
        rating_avg?: number | string | null;
        rating_count?: number | null;
        transports?: { name: string; transport_type?: string | null } | null;
        departure_locations?: {
            name?: string | null;
        } | null;
        tour_images?: {
            image_url?: string | null;
        }[];
        tour_schedules?: {
            start_date: string;
            quota?: number;
            booked_count?: number;
            price?: number | string;
            original_price?: number | string | null;
            cover_image_url?: string | null;
        }[];
    };
};
export type FavItem = {
    tour_id: number;
    name: string;
    location: string;
    summary?: string | null;
    rating: number;
    reviewsCount: number;
    price: number;
    duration: string;
    type: "domestic" | "international";
    image: string;
    startDate?: string;
    savedDate?: string;
    airline?: string;
    seatsLeft?: number;
    originalPrice?: number;
};
export type FavFilterType = "all" | "domestic" | "international";
export type FavSortType = "newest" | "price-asc" | "price-desc" | "rating";
export type ToggleFavoriteResult = {
    ok: true;
    action: "added" | "removed";
} | {
    ok: false;
    reason: "unauthenticated" | "error";
    message: string;
};
