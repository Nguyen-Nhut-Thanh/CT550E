export type ReviewReplyItem = {
    id: number;
    content: string;
    userName: string;
    userAvatar?: string;
    createdAt?: string;
};

export type ReviewItem = {
    id: number | string;
    name: string;
    rating: number;
    title?: string;
    content: string;
    timeAgo?: string;
    avatarUrl?: string;
    images?: string[];
    likesCount?: number;
    replies?: ReviewReplyItem[];
};

export type RatingBreakdownItem = {
    stars: 1 | 2 | 3 | 4 | 5;
    percent: number;
    count?: number;
};
