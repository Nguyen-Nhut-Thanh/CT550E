export type AuthRequestUser = {
  sub: number;
  email?: string;
  accountId?: number;
  isStaff?: boolean;
};

export type JwtPayload = {
  sub: number;
  email: string;
  accountId: number;
  isStaff?: boolean;
};

export type UpdateProfilePayload = {
  full_name?: string;
  phone?: string | null;
  address?: string | null;
  avatar_url?: string;
  gender?: string;
  number_id?: string | null;
};

export type ChangePasswordPayload = {
  oldPassword?: string;
  newPassword: string;
};

export type AdminLoginPayload = {
  email: string;
  password: string;
};

export type AuthAccountWithUser = {
  account_id: number;
  email: string;
  password_hash: string | null;
  status: number;
  provider_account_id: string | null;
  email_verified: boolean;
  email_verified_at: Date | null;
  users: {
    user_id: number;
    full_name: string | null;
    avatar_url: string | null;
    profile_completed: boolean;
    is_staff: boolean;
  };
};
