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
