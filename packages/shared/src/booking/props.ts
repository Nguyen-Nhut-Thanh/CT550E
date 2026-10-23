import type { PublicTourDetail, TourSchedule } from "../tours/models";
import type { VoucherValidationResult } from "../vouchers/models";
import type { PaymentMethod, PricingSummary, TravelerForm, TravelerType } from "./models";
export interface BookingContactFormProps {
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    note: string;
    onContactNameChange: (value: string) => void;
    onContactPhoneChange: (value: string) => void;
    onContactEmailChange: (value: string) => void;
    onNoteChange: (value: string) => void;
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
export interface BookingTourInfoCardProps {
    tour: PublicTourDetail;
    selectedSchedule: TourSchedule;
    seatsLeft: number;
    adultUnitPrice: number;
}
export interface BookingTravelersListProps {
    travelers: TravelerForm[];
    selectedSchedule: TourSchedule;
    singleRoomSelections: boolean[];
    singleRoomUnitPrice: number;
    getUnitPrice: (schedule: TourSchedule | null, type: TravelerType) => number;
    onUpdateTraveler: (index: number, field: keyof TravelerForm, value: string) => void;
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
