export type CreateReviewPayload = {
    tour_id: number;
    booking_id?: number;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
};
export type CreateReplyPayload = {
    content: string;
};
