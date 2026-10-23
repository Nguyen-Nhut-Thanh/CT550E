export type ReviewItem = {
    id: number | string;
    name: string;
    rating: number;
    content: string;
    timeAgo?: string;
    avatarUrl?: string;
};
export type RatingBreakdownItem = {
    stars: 1 | 2 | 3 | 4 | 5;
    percent: number;
};
