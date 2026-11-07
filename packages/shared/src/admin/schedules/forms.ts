export type SchedulePriceItem = {
    passenger_type: "adult" | "child" | "infant";
    price: number;
    currency: string;
    note: string;
};
export type ItineraryFormItem = {
    activities?: import("../../tours/models").ItineraryActivity[];
    day_number: number;
    title: string;
    content: string;
    meals: string;
    transport_id: string | number;
    hotel_id: string | number;
    room_type_id: string | number;
};
export type ScheduleFormState = {
    attraction_ids: number[];
    use_tour_amenities: boolean;
    copy_tour_amenities: boolean;
    tour_schedule_amenities: import('../../tours/amenities').ScheduleAmenity[];
    departure_location_id: number | "";
    pickup_points: Array<{ name: string; address: string; pickup_at: string; note: string; day_offset?: number; pickup_time?: string }>;
    start_date: string;
    start_time: string;
    end_date: string;
    end_time: string;
    price: number;
    quota: number;
    status: number;
    cover_image_url: string;
    note: string;
    prices: SchedulePriceItem[];
    itinerary: ItineraryFormItem[];
};
