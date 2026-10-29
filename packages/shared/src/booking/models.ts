export type TravelerType = "adult" | "child" | "infant";
export type PaymentMethod = "vnpay" | "momo" | "bank_transfer";
export type TravelerForm = {
    fullName: string;
    gender: "male" | "female";
    type: TravelerType;
    birthday: string;
};
export type BookingExtraService = {
    id: string;
    name: string;
    description: string;
    unit_price: number;
    pricing_unit: "guest" | "group" | "booking";
};
export interface PricingSummary {
    adultUnitPrice: number;
    childUnitPrice: number;
    infantUnitPrice: number;
    singleRoomUnitPrice: number;
    singleRoomCount: number;
    singleRoomSurcharge: number;
    subtotal: number;
    discount: number;
    total: number;
    servicesTotal: number;
}

export interface BookingDetail {
  booking_id: number;
  status: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  note?: string | null;
  created_at: string;
  adult_count: number;
  child_count: number;
  infant_count: number;
  adult_unit_price: number | string;
  child_unit_price: number | string;
  infant_unit_price: number | string;
  discount_amount: number | string;
  services_total: number | string;
  total_amount: number | string;
  additional_services?: { id: string; name: string; quantity: number; unit_price: number; amount: number }[] | null;
  vouchers?: { code: string } | null;
  booking_travelers?: { traveler_id: number; full_name: string; dob?: string | null; gender: string; id_number?: string | null; traveler_type: string }[];
  payments?: { payment_id: number; method: string; status: string; transaction_code?: string | null; created_at: string; paid_at?: string | null }[];
  tour_schedules?: {
    start_date: string;
    end_date?: string | null;
    tours?: { tour_id: number; code: string; name: string; duration_days: number; duration_nights: number; departure_locations?: { name: string } | null; tour_images?: { image_url?: string | null }[] } | null;
  } | null;
}
