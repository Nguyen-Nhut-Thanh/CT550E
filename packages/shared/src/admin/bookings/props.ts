import type { AdminBooking } from "./models";
export type ActionModalState = {
    type: "approve";
    booking: AdminBooking;
} | {
    type: "reject";
    booking: AdminBooking;
} | {
    type: "detail";
    booking: AdminBooking;
} | {
    type: "cancel-pending";
    booking: AdminBooking;
} | {
    type: "cancel-booking";
    booking: AdminBooking;
} | null;
