export type TourDestinationItem = {
    visit_order: number;
    location_id: number | null;
    name: string | null;
    note?: string | null;
    locations?: TourLocation | null;
};
export type TourLocation = {
    location_id: number;
    name: string;
    slug?: string | null;
};
export type ItineraryActivity = {
    time: string;
    title: string;
    description: string;
    location_id?: number | null;
    location?: {
        location_id: number;
        parent_id: number | null;
        name: string;
        note: string | null;
        location_images?: { image_url: string }[];
    } | null;
};
export type TourItinerary = {
    day_number: number;
    title: string;
    content: string;
    meals?: string | null;
    activities?: ItineraryActivity[];
};
export type TourScheduleHotel = {
    schedule_hotel_id: number;
    hotel_id: number;
    room_type_id: number;
    nights: number;
    day_from?: number | null;
    day_to?: number | null;
    note?: string | null;
    hotels?: {
        hotel_id: number;
        name: string;
        star_rating?: number | null;
        address?: string;
        description?: string | null;
    } | null;
    hotel_room_types?: {
        room_type_id: number;
        name: string;
        base_price: number | string;
        extra_price?: number | string;
    } | null;
};
export type TourSchedulePrice = {
    passenger_type: string;
    price: number;
    currency: string;
    note?: string | null;
};
export type TourScheduleTransport = {
    schedule_transport_id: number;
    transport_role: string;
    day_from: number | null;
    day_to: number | null;
    note: string | null;
    transports: { name: string; transport_type: string; description: string | null };
};
export type TourSchedule = {
    tour_schedule_amenities?: import('./amenities').ScheduleAmenity[];
    departure_location_id?: number;
    departure_location?: TourLocation | null;
    pickup_points?: SchedulePickupPoint[];
    tour_schedule_id: number;
    start_date: string;
    end_date: string;
    price: number;
    original_price?: number;
    quota: number;
    booked_count: number;
    cover_image_url?: string | null;
    tour_itineraries?: TourItinerary[];
    tour_schedule_prices?: TourSchedulePrice[];
    tour_schedule_hotels?: TourScheduleHotel[];
    tour_schedule_transports?: TourScheduleTransport[];
};
export type SchedulePickupPoint = {
    pickup_point_id: number;
    name: string;
    address: string;
    pickup_at: string;
    sort_order: number;
    note?: string | null;
};
export type TourImage = {
    image_id: number;
    image_url: string;
    is_cover: number;
    sort_order: number;
};
export type TourReview = {
    review_id: number;
    rating: number;
    comment: string | null;
    created_at: string;
    user_id: number;
};
export type TourPolicy = {
    policy_id: number;
    policy_type: string;
    content: string;
};
export type PublicTourCard = {
    tour_id: number;
    code: string;
    name: string;
    summary: string | null;
    duration_days: number;
    duration_nights: number;
    base_price: number;
    tour_type: string;
    updated_at: string;
    cover_image: string | null;
    departure_location: TourLocation | null;
    destinations: TourDestinationItem[];
    next_schedule: TourSchedule | null;
    upcoming_schedules?: TourSchedule[];
    transport: {
        name: string;
        type: string;
    } | null;
    rating_avg: number | null;
    rating_count: number;
};
export type PublicTourDetail = {
    tour_id: number;
    code: string;
    name: string;
    summary: string | null;
    description: string | null;
    duration_days: number;
    duration_nights: number;
    base_price: number;
    tour_type: string;
    tour_amenities: import('./amenities').TourAmenity[];
    transports?: {
        name: string;
        transport_type: string;
    } | null;
    departure_locations?: TourLocation | null;
    tour_images: TourImage[];
    tour_destinations: TourDestinationItem[];
    tour_schedules: TourSchedule[];
    reviews: TourReview[];
    tour_policies?: TourPolicy[];
    rating_avg?: number | string | null;
    rating_count?: number | null;
};
export type VideoItem = {
    id: number;
    title: string;
    thumbnail: string;
    videoUrl: string;
};
