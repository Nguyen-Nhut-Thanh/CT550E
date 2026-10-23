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
