export type UserProfile = {
    user_id?: number;
    full_name?: string | null;
    phone?: string | null;
    number_id?: string | null;
    gender?: string | null;
    avatar_url?: string | null;
    address?: string | null;
    birthday?: string | null;
    nationality?: string | null;
    bio?: string | null;
    is_staff?: boolean;
    accounts?: {
        email?: string | null;
        hasPassword?: boolean;
    } | null;
};
export type AccountStats = {
    totalBookings?: number;
    totalFavorites?: number;
    totalReviews?: number;
    totalPhotos?: number;
};
export type AccountBooking = {
    booking_id: number;
    status: string;
    total_amount: number | string;
    adult_count: number;
    child_count: number;
    infant_count: number;
    tour_schedules: {
        start_date: string;
        end_date?: string;
        tours: {
            name: string;
            tour_images?: {
                image_url?: string | null;
            }[];
        };
    };
    rating?: number;
    review_count?: number;
};
export type BookingItemUI = {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    passengers: string;
    status: "completed" | "upcoming" | "cancelled";
    statusText: string;
    price: number;
    image: string;
};
export type BookingStatusFilter = "all" | "upcoming" | "completed" | "cancelled";
export type UserProfileLite = {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
};
export interface AccountReviewItem {
    review_id: number;
    tour_id: number;
    tour_name: string;
    tour_image: string | null;
    rating: number;
    title: string | null;
    comment: string | null;
    images: string[];
    status: number;
    created_at: string;
}
