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
        rating_avg?: number | string | null;
        rating_count?: number | null;
        departure_locations?: {
            name?: string | null;
        } | null;
        tour_images?: {
            image_url?: string | null;
        }[];
        tour_schedules?: {
            start_date: string;
            quota?: number;
        }[];
    };
};
export type FavItem = {
    tour_id: number;
    name: string;
    location: string;
    rating: number;
    reviewsCount: number;
    price: number;
    duration: string;
    type: "domestic" | "international";
    image: string;
    startDate?: string;
    savedDate?: string;
    guestCount?: string;
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
