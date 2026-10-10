export type UserProfile = {
  user_id?: number;
  full_name?: string | null;
  phone?: string | null;
  number_id?: string | null;
  gender?: string | null;
  avatar_url?: string | null;
  address?: string | null;
  birthday?: string | null;
  nationality?: string | null;
  bio?: string | null;
  is_staff?: boolean;
  accounts?: {
    email?: string | null;
    hasPassword?: boolean;
  } | null;
};

export type AccountStats = {
  totalBookings?: number;
  totalFavorites?: number;
  totalReviews?: number;
  totalPhotos?: number;
};

export type AccountBooking = {
  booking_id: number;
  status: string;
  total_amount: number | string;
  adult_count: number;
  child_count: number;
  infant_count: number;
  tour_schedules: {
    start_date: string;
    end_date?: string;
    tours: {
      name: string;
      tour_images?: { image_url?: string | null }[];
    };
  };
  rating?: number;
  review_count?: number;
};

export type FavoriteTourItem = {
  tour_id: number;
  tours: {
    tour_id: number;
    name: string;
    status: number;
    base_price: number | string;
    duration_days: number;
    duration_nights: number;
    tour_type: string;
    departure_locations?: { name?: string | null } | null;
    tour_images?: { image_url?: string | null }[];
    tour_schedules?: { start_date: string }[];
  };
};

export type RecommendationProfile = {
  user_id?: number;
  travel_scope?: string | null;
  preferred_styles?: string[];
  preferred_themes?: string[];
  budget_band?: string | null;
  preferred_duration_band?: string | null;
  preferred_group_type?: string | null;
  preferred_departure?: string | null;
  adventure_level?: string | null;
  allow_behavior_tracking?: boolean;
  allow_chat_signals?: boolean;
};

export interface AccountSidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  user?: UserProfile | null;
}

export interface AccountRightSidebarProps {
  user: UserProfile | null;
  setActiveTab?: (tab: string) => void;
}

export interface AccountOverviewProps {
  user: UserProfile | null;
  stats: AccountStats | null;
  bookings: AccountBooking[];
  favorites: FavoriteTourItem[];
  loading: boolean;
  setActiveTab: (tab: string) => void;
}

export interface AccountOverviewTabProps {
  user: UserProfile | null;
  stats: AccountStats | null;
  bookings: AccountBooking[];
  favorites: FavoriteTourItem[];
  loading: boolean;
  setActiveTab?: (tab: string) => void;
}

export interface AccountProfileHeaderProps {
  user: UserProfile | null;
}

export interface AccountFavoritesTabProps {
  favorites?: FavoriteTourItem[];
}

export type FavItem = {
  tour_id: number;
  name: string;
  location: string;
  rating: number;
  reviewsCount: number;
  price: number;
  duration: string;
  type: "domestic" | "international";
  image: string;
};

export type FavFilterType = "all" | "domestic" | "international";
export type FavSortType = "newest" | "price-asc" | "price-desc" | "rating";

export interface AccountBookingsTabProps {
  bookings?: AccountBooking[];
}

export type BookingItemUI = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  passengers: string;
  status: "completed" | "upcoming" | "cancelled";
  statusText: string;
  price: number;
  image: string;
};

export type BookingStatusFilter = "all" | "upcoming" | "completed" | "cancelled";

export interface AccountSettingsTabProps {
  user: UserProfile | null;
}

export type RecommendationEventPayload = {
  event_type: string;
  source?: string;
  tour_id?: number;
  destination?: string;
  metadata?: Record<string, unknown>;
};

export type ToggleFavoriteResult =
  | { ok: true; action: "added" | "removed" }
  | { ok: false; reason: "unauthenticated" | "error"; message: string };

