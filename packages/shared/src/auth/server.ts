import type { Request } from 'express';
import type { JwtPayload } from "./contracts";
export type AuthRequestUser = Pick<JwtPayload, "sub" | "isStaff"> & Partial<Pick<JwtPayload, "email" | "accountId">>;
export type AuthRequest = Request & {
    user: AuthRequestUser;
};
export type JwtRequest = Request & {
    cookies?: Record<string, string | undefined>;
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
