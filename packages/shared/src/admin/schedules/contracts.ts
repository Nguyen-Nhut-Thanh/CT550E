import type { TourSchedulePrice } from "../../tours/models";
export type SchedulePricePayload = Omit<TourSchedulePrice, "price" | "currency"> & {
    price: number | string;
    currency?: string;
};
export type ScheduleItineraryPayload = {
    activities?: import("../../tours/models").ItineraryActivity[];
    day_number?: number;
    title?: string;
    content?: string;
    description?: string;
    meals?: string | null;
    hotel_id?: number | string | null;
    room_type_id?: number | string | null;
    nights?: number | string | null;
};
export type ScheduleAdminPayload = {
    attraction_ids?: number[];
    use_tour_amenities?: boolean;
    copy_tour_amenities?: boolean;
    tour_schedule_amenities?: import('../../tours/amenities').ScheduleAmenity[];
    departure_location_id?: number;
    pickup_points?: SchedulePickupPointPayload[];
    start_date?: string;
    end_date?: string;
    price?: number | string;
    quota?: number | string;
    status?: number | string | null;
    cover_image_url?: string | null;
    prices?: SchedulePricePayload[];
    itinerary?: ScheduleItineraryPayload[];
};
export type SchedulePickupPointPayload = {
    name: string;
    address: string;
    pickup_at: string;
    note?: string | null;
};
