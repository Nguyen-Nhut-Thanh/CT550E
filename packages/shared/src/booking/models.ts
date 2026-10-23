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
