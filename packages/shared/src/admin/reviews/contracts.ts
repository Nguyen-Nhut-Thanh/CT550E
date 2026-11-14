export type AdminReviewQuery = {
    status?: string | number;
    tour_id?: string | number;
    take?: string | number;
    skip?: string | number;
};

export type AdminUpdateReviewStatusPayload = {
    status: number; // 0: pending, 1: approved, 2: rejected
    admin_note?: string;
};

export type AdminReviewReply = {
    reply_id: number;
    review_id: number;
    user_id: number;
    content: string;
    status: number;
    created_at: string;
    user: {
        user_id: number;
        full_name?: string | null;
        avatar_url?: string | null;
    };
};

export type AdminReviewItem = {
    review_id: number;
    user_id: number;
    tour_id: number;
    booking_id?: number | null;
    rating: number;
    title?: string | null;
    comment?: string | null;
    images: string[];
    likes_count: number;
    status: number; // 0: Chờ duyệt, 1: Đã duyệt, 2: Từ chối / Ẩn
    admin_note?: string | null;
    created_at: string;
    tour_name: string;
    tour_code: string;
    user: {
        user_id: number;
        full_name?: string | null;
        avatar_url?: string | null;
    };
    replies: AdminReviewReply[];
};

export type AdminReviewListResponse = {
    items: AdminReviewItem[];
    total: number;
    take: number;
    skip: number;
};
