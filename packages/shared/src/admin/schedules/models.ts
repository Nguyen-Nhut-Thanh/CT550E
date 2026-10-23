import type { ItineraryFormItem, SchedulePriceItem } from "./forms";
export type ScheduleOverviewTour = {
    tour_id: number;
    code: string;
    name: string;
    duration_days: number;
    base_price: string | number;
    status: number;
};
export type ScheduleTablePanelTour = {
    tour_id: number;
    status: number;
};
export type ScheduleManagementItem = Omit<AdminSchedule, 'price' | '_count'> & {
    price: number;
    _count?: {
        bookings?: number;
    };
};
export type TourInfo = {
    name?: string | null;
    duration_days?: number | null;
    base_price?: number | string | null;
    cut_off_hours?: number | null;
};
export type HotelItem = {
    hotel_id: number;
    name: string;
    star_rating?: number | null;
};
export type TransportItem = {
    transport_id: number;
    name: string;
    type?: string | null;
};
export type RoomTypeItem = {
    room_type_id: number;
    name: string;
};
export type ScheduleHotelItem = {
    schedule_hotel_id?: number;
    tour_schedule_id?: number;
    hotel_id?: number | null;
    room_type_id?: number | null;
    nights?: number | null;
    day_from?: number | null;
    day_to?: number | null;
    note?: string | null;
    hotels?: HotelItem | null;
    hotel_room_types?: RoomTypeItem & {
        base_price?: number | string | null;
    } | null;
};
export type ScheduleDetailResponse = {
    tour_id?: string | number | null;
    start_date?: string | null;
    end_date?: string | null;
    price?: number | null;
    quota?: number | null;
    booked_count?: number | null;
    status?: number | null;
    cover_image_url?: string | null;
    note?: string | null;
    notificationSent?: boolean;
    hasBookings?: boolean;
    tour_schedule_prices?: SchedulePriceItem[] | null;
    tour_itineraries?: Array<Partial<ItineraryFormItem> & {
        hotel_id?: number | null;
    }> | null;
    tour_schedule_hotels?: ScheduleHotelItem[] | null;
};
export type ScheduleEditorScheduleDetailResponse = Omit<ScheduleDetailResponse, 'tour_id' | 'booked_count' | 'notificationSent' | 'hasBookings' | 'tour_schedule_hotels'> & {
    tour_schedule_hotels?: Array<{
        day_from?: number | null;
        day_to?: number | null;
        hotel_id?: number | null;
        room_type_id?: number | null;
        nights?: number | null;
    }> | null;
};
export type ScheduleLike = Pick<AdminSchedule, 'start_date' | 'quota' | 'status'> & {
    _count?: {
        bookings?: number;
    };
};
export type AdminSchedule = {
    tour_schedule_id: number;
    start_date: string;
    end_date: string;
    price: string | number;
    quota: number;
    status: number;
    _count?: {
        bookings: number;
    };
};
