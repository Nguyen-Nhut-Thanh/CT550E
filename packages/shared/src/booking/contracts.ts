export type BookingPayload = BookingBasePayload & {
    single_room_count?: number;
    additional_service_ids?: string[];
};
export type BookingBasePayload = {
    tour_schedule_id: number;
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    adult_count: number;
    child_count: number;
    infant_count: number;
    travelers: Array<{
        fullName: string;
        gender: string;
        birthday: string;
        type: string;
    }>;
    note?: string;
    voucher_code?: string;
    payment_method: string;
    room_type?: "shared" | "single";
    single_room_surcharge?: number;
};
