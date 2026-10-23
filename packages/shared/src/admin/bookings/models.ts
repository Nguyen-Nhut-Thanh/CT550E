export type AdminBooking = {
    booking_id: number;
    status: string;
    total_amount?: number | string | null;
    note?: string | null;
    contact_name?: string | null;
    contact_phone?: string | null;
    contact_email?: string | null;
    created_at?: string | null;
    adult_count?: number;
    child_count?: number;
    infant_count?: number;
    adult_unit_price?: number | string;
    child_unit_price?: number | string;
    infant_unit_price?: number | string;
    discount_amount?: number | string;
    tour_schedules?: {
        start_date?: string | null;
        tours?: {
            name?: string | null;
            code?: string | null;
            departure_locations?: {
                name: string;
            } | null;
        } | null;
    } | null;
    payments?: Array<{
        payment_id: number;
        status?: string | null;
        method?: string | null;
        amount?: number | string;
        transaction_code?: string | null;
        paid_at?: string | null;
    }>;
    booking_travelers?: Array<{
        traveler_id: number;
        full_name: string;
        gender: string;
        dob: string | null;
        traveler_type: string;
    }>;
    vouchers?: {
        code: string;
        discount_value: number | string;
        discount_type: string;
    } | null;
};
