export type RecommendationEventPayload = {
    event_type: string;
    source?: string;
    tour_id?: number;
    destination?: string;
    metadata?: Record<string, unknown>;
};

export type TourCompareVerdict = {
  summary: string;
  best_for: {
    tour_id: number;
    tour_name: string;
    recommendation: string;
  }[];
};

export type TourCompareMatrixRow = {
  criterion: string;
  values: Record<number, string>;
};

export type TourCompareItemSummary = {
  tour_id: number;
  code: string;
  name: string;
  image_url: string;
  price: number;
  original_price?: number;
  duration: string;
  departure_name: string;
  link: string;
};

export type TourCompareResult = {
  verdict: TourCompareVerdict;
  criteria_matrix: TourCompareMatrixRow[];
  key_tradeoff: string;
  tours: TourCompareItemSummary[];
};

export type TourCompareRequest = {
  tourIds: number[];
};

export type UserBehaviorSignals = {
  viewed_tours: { tourId: number; viewedAt: string; duration?: number }[];
  searched_keywords: string[];
  applied_filters?: {
    price_range?: { min?: number; max?: number };
    departure_location_id?: number;
    destination?: string;
    tour_type?: string;
  };
  wishlist_tour_ids?: number[];
};

export type TourRecommendationItem = {
  tour_id: number;
  name: string;
  code: string;
  image_url: string;
  price: number;
  original_price?: number;
  duration_text: string;
  departure_name: string;
  rating_avg: number;
  rating_count: number;
  ai_reason: string;
  is_personalized?: boolean;
  match_score?: number;
  vibes?: string[];
  link: string;
  summary?: string | null;
  destination?: string | null;
  start_date?: string | null;
  transport_name?: string | null;
  transport_type?: string | null;
  tour_type?: string | null;
  seats_left?: number;
  booking_link?: string | null;
};

export type TourRecommendationsResponse = {
  recommendations: TourRecommendationItem[];
  basis?: string;
};
