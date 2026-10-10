export type TravelerType = "adult" | "child" | "infant";
export type PaymentMethod = "vnpay" | "momo" | "bank_transfer";

export type TravelerForm = {
  fullName: string;
  gender: "male" | "female";
  type: TravelerType;
  birthday: string;
};

export type VoucherValidationResult = {
  voucher_id: number;
  code: string;
  discountAmount: number;
  finalAmount?: number;
};

export type VoucherValidationApiResponse = {
  voucher_id: number;
  code: string;
  discount_amount: number;
  final_amount?: number;
};

export type UserProfileLite = {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
};

export type BookingPayload = {
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
