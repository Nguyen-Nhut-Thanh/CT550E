import type * as ReactTypes from 'react';
import type { StaffFormData } from "./forms";
import type { UserItem } from "./models";
export type CreateStaffModalProps = {
    open: boolean;
    saving: boolean;
    formData: StaffFormData;
    onClose: () => void;
    onSubmit: (event: ReactTypes.FormEvent) => void;
    onFormChange: (updater: (prev: StaffFormData) => StaffFormData) => void;
};
export type UsersTableProps = {
    users: UserItem[];
    loading: boolean;
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onToggleStatus: (user: UserItem) => void;
    onPageChange: (page: number) => void;
};
