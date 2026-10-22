import type * as ReactTypes from 'react';

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

export type UserItem = {
  user_id: number;
  full_name: string;
  phone?: string | null;
  avatar_url?: string | null;
  is_staff?: boolean;
  accounts?: {
    email?: string | null;
    status?: number;
    last_login_at?: string | null;
  } | null;
};

export type StaffFormData = {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  position: string;
  employee_code: string;
};
