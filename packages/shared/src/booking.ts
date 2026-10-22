import type { PublicTourDetail, TourSchedule } from './tour';
import type { VoucherValidationResult } from './vouchers';

export type TravelerType = "adult" | "child" | "infant";
export type PaymentMethod = "vnpay" | "momo" | "bank_transfer";

export type TravelerForm = {
  fullName: string;
  gender: "male" | "female";
  type: TravelerType;
  birthday: string;
};

export type BookingPayload = BookingBasePayload & {
  single_room_count?: number;
  additional_service_ids?: string[];
};

export type BookingExtraService = {
  id: string;
  name: string;
  description: string;
  unit_price: number;
  pricing_unit: "guest" | "group" | "booking";
};

export const BOOKING_EXTRAS: BookingExtraService[] = [
  {
    id: "private_guide",
    name: "Hướng dẫn viên riêng",
    description: "Hướng dẫn viên dành riêng cho đoàn trong đơn đặt tour",
    unit_price: 200000,
    pricing_unit: "booking",
  },
  {
    id: "travel_insurance",
    name: "Bảo hiểm du lịch",
    description: "Gói bảo hiểm bổ sung cho chuyến đi",
    unit_price: 50000,
    pricing_unit: "guest",
  },
  {
    id: "photography",
    name: "Chụp ảnh chuyên nghiệp",
    description: "Lưu giữ những khoảnh khắc đáng nhớ",
    unit_price: 300000,
    pricing_unit: "group",
  },
];

export interface BookingContactFormProps {
  contactName: string; contactPhone: string; contactEmail: string; note: string;
  onContactNameChange: (value: string) => void; onContactPhoneChange: (value: string) => void;
  onContactEmailChange: (value: string) => void; onNoteChange: (value: string) => void;
}

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

export interface BookingOrderSummaryProps {
  tour: PublicTourDetail;
  selectedSchedule: TourSchedule;
  adultCount: number;
  childCount: number;
  infantCount: number;
  totalGuests: number;
  pricing: PricingSummary;
  submitting: boolean;
  onSubmitBooking: () => void;
}

export interface BookingPassengerCountsProps {
  schedules: TourSchedule[];
  selectedSchedule: TourSchedule;
  onScheduleChange: (schedule: TourSchedule) => void;
  adultCount: number;
  childCount: number;
  infantCount: number;
  totalGuests: number;
  adultUnitPrice: number;
  childUnitPrice: number;
  infantUnitPrice: number;
  onCountChange: (type: TravelerType, delta: number) => void;
}

export interface BookingTourInfoCardProps { tour: PublicTourDetail; selectedSchedule: TourSchedule; seatsLeft: number; adultUnitPrice: number; }

export interface BookingTravelersListProps {
  travelers: TravelerForm[];
  selectedSchedule: TourSchedule;
  singleRoomSelections: boolean[];
  singleRoomUnitPrice: number;
  getUnitPrice: (schedule: TourSchedule | null, type: TravelerType) => number;
  onUpdateTraveler: (
    index: number,
    field: keyof TravelerForm,
    value: string,
  ) => void;
  onUpdateSingleRoomSelection: (adultIndex: number, checked: boolean) => void;
}

export interface BookingVoucherAndPaymentProps {
  voucherCode: string;
  voucherLoading: boolean;
  voucherResult: VoucherValidationResult | null;
  voucherError: string | null;
  paymentMethod: PaymentMethod;
  onVoucherCodeChange: (code: string) => void;
  onApplyVoucher: () => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
}

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
