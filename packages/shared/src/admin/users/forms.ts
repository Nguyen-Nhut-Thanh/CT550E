import type { CreateStaffPayload } from "./contracts";
export type StaffFormData = Required<Omit<CreateStaffPayload, "phone">> & {
    phone: string;
};
