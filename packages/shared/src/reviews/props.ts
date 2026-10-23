import type { RatingBreakdownItem, ReviewItem } from "./models";
export type TourReviewsSectionProps = {
    averageRating?: number;
    totalReviews?: number;
    breakdown?: RatingBreakdownItem[];
    reviews?: ReviewItem[];
    onViewAll?: () => void;
};
