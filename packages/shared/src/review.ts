export type ReviewUser = {
  user_id: number;
  full_name: string;
  avatar_url?: string | null;
};

export type ReviewReplyItem = {
  reply_id: number;
  review_id: number;
  user_id: number;
  content: string;
  status: number;
  created_at: string;
  user: ReviewUser;
};

export type TourReviewItem = {
  review_id: number;
  user_id: number;
  tour_id: number;
  booking_id?: number | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  images?: string[] | null;
  likes_count: number;
  is_liked?: boolean;
  status: number;
  admin_note?: string | null;
  created_at: string;
  user: ReviewUser;
  replies?: ReviewReplyItem[];
  tour_name?: string;
  tour_code?: string;
};

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
