export type SchedulePriceItem = {
    passenger_type: "adult" | "child" | "infant";
    price: number;
    currency: string;
    note: string;
};
export type ItineraryFormItem = {
    day_number: number;
    title: string;
    content: string;
    meals: string;
    transport_id: string | number;
    hotel_id: string | number;
    room_type_id: string | number;
};
export type ScheduleFormState = {
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
