import type { ReactNode } from 'react';
import type { LocationLite } from './location';

export type TourDestinationItem = {
  visit_order: number;
  location_id: number | null;
  name: string | null;
  note?: string | null;
  locations?: {
    location_id: number;
    name: string;
    slug?: string | null;
  } | null;
};

export type TourLocation = {
  location_id: number;
  name: string;
  slug?: string | null;
};

export type TourItinerary = {
  day_number: number;
  title: string;
  content: string;
  meals?: string | null;
};

export type TourScheduleHotel = {
  schedule_hotel_id: number;
  hotel_id: number;
  room_type_id: number;
  nights: number;
  day_from?: number | null;
  day_to?: number | null;
  note?: string | null;
  hotels?: {
    hotel_id: number;
    name: string;
    star_rating?: number | null;
  } | null;
  hotel_room_types?: {
    room_type_id: number;
    name: string;
    base_price: number | string;
    extra_price?: number | string;
  } | null;
};

export type TourSchedulePrice = {
  passenger_type: string;
  price: number;
  currency: string;
  note?: string | null;
};

export type TourSchedule = {
  tour_schedule_id: number;
  start_date: string;
  end_date: string;
  price: number;
  original_price?: number;
  quota: number;
  booked_count: number;
  cover_image_url?: string | null;
  tour_itineraries?: TourItinerary[];
  tour_schedule_prices?: TourSchedulePrice[];
  tour_schedule_hotels?: TourScheduleHotel[];
};

export type TourImage = {
  image_id: number;
  image_url: string;
  is_cover: number;
  sort_order: number;
};

export type TourReview = {
  review_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: number;
};

export type TourPolicy = {
  policy_id: number;
  policy_type: string;
  content: string;
};

export type PublicTourCard = {
  tour_id: number;
  code: string;
  name: string;
  summary: string | null;
  duration_days: number;
  duration_nights: number;
  base_price: number;
  tour_type: string;
  updated_at: string;
  cover_image: string | null;
  departure_location: TourLocation | null;
  destinations: TourDestinationItem[];
  next_schedule: TourSchedule | null;
  upcoming_schedules?: TourSchedule[];
  transport: {
    name: string;
    type: string;
  } | null;
  rating_avg: number | null;
  rating_count: number;
};

export type PublicTourDetail = {
  tour_id: number;
  code: string;
  name: string;
  summary: string | null;
  description: string | null;
  duration_days: number;
  duration_nights: number;
  base_price: number;
  tour_type: string;
  sightseeing_summary: string | null;
  cuisine_info: string | null;
  best_for: string | null;
  best_time: string | null;
  transport_info: string | null;
  promotion_info: string | null;
  transports?: {
    name: string;
    transport_type: string;
  } | null;
  departure_locations?: TourLocation | null;
  tour_images: TourImage[];
  tour_destinations: TourDestinationItem[];
  tour_schedules: TourSchedule[];
  reviews: TourReview[];
  tour_policies?: TourPolicy[];
  rating_avg?: number | string | null;
  rating_count?: number | null;
};

export type PublicToursFilters = {
  search: string;
  destination: string;
  departure_location: string;
  date_from: string;
  min_price: string;
  max_price: string;
};

export type PublicToursResponse = {
  items: PublicTourCard[];
  take: number;
  skip: number;
  total: number;
  filters: PublicToursFilters;
};

export type PublicToursQuery = {
  search?: string;
  destination?: string;
  departure_location?: string;
  date_from?: string;
  min_price?: string;
  max_price?: string;
  collection?: string;
  deal?: string;
  take?: number | string;
  skip?: number | string;
};

export type BestSellerStat = {
  tour_id: number;
  booking_count: number;
  passenger_count: number;
};

export type TourListParams = {
  search?: string;
  status?: string;
};

export type PolicyContentsPayload = Record<string, string | null | undefined>;

export type TourAdminPayload = {
  code?: string;
  name?: string;
  summary?: string | null;
  description?: string;
  duration_days?: number | string;
  duration_nights?: number | string;
  base_price?: number | string;
  tour_type?: string;
  departure_location?: number | string;
  transport_id?: number | string;
  status?: number | string | null;
  sightseeing_summary?: string | null;
  cuisine_info?: string | null;
  best_for?: string | null;
  best_time?: string | null;
  transport_info?: string | null;
  promotion_info?: string | null;
  policy_contents?: PolicyContentsPayload;
  destinations?: Array<number | string>;
  images?: string[];
};

export type SchedulePricePayload = {
  passenger_type: string;
  price: number | string;
  currency?: string;
  note?: string | null;
};

export type ScheduleItineraryPayload = {
  day_number?: number;
  title?: string;
  content?: string;
  description?: string;
  meals?: string | null;
  hotel_id?: number | string | null;
  room_type_id?: number | string | null;
  nights?: number | string | null;
};

export type ScheduleAdminPayload = {
  start_date?: string;
  end_date?: string;
  price?: number | string;
  quota?: number | string;
  status?: number | string | null;
  cover_image_url?: string | null;
  prices?: SchedulePricePayload[];
  itinerary?: ScheduleItineraryPayload[];
};

export type PublicListParams = {
  search?: string;
  destination?: string;
  departure_location?: string;
  date_from?: string;
  min_price?: string;
  max_price?: string;
  collection?: string;
  deal?: string;
  take?: string;
  skip?: string;
};

export type PublicFlashDealRecord = {
  discount_type: string;
  discount_value: unknown;
};

export type PublicItineraryRecord = {
  day_number: number;
  title: string | null;
  content: string | null;
  meals: string | null;
};

export type PublicScheduleRecord = {
  tour_schedule_id: number;
  code?: string | null;
  start_date: Date;
  end_date: Date;
  price: unknown;
  quota: number;
  booked_count: number;
  cover_image_url?: string | null;
  flash_deals?: PublicFlashDealRecord | null;
  tour_schedule_hotels?: Array<{
    schedule_hotel_id: number;
    hotel_id: number;
    room_type_id: number;
    nights: number;
    day_from: number | null;
    day_to: number | null;
    note: string | null;
    hotels?: {
      hotel_id: number;
      name: string;
      star_rating: number | null;
    } | null;
    hotel_room_types?: {
      room_type_id: number;
      name: string;
      base_price: unknown;
      extra_price?: unknown;
    } | null;
  }>;
  tour_itineraries?: PublicItineraryRecord[];
};

export type PublicDestinationRecord = {
  visit_order: number;
  locations?: {
    location_id: number | null;
    name: string | null;
    slug: string | null;
  } | null;
};

export type PublicTourCardRecord = {
  tour_id: number;
  code: string;
  name: string;
  summary: string | null;
  duration_days: number;
  duration_nights: number;
  base_price: unknown;
  tour_type: string;
  updated_at: Date;
  cut_off_hours: number | null;
  departure_locations?: {
    location_id: number;
    name: string;
    slug: string | null;
  } | null;
  tour_images?: Array<{ image_url: string | null }>;
  tour_destinations?: PublicDestinationRecord[];
  tour_schedules?: PublicScheduleRecord[];
  transports?: {
    name: string;
    transport_type: string;
  } | null;
  rating_avg?: number | string | null;
  rating_count?: number | string | null;
};

export type TourBookingCardProps = {
  tour: PublicTourDetail;
  selectedSchedule?: TourSchedule | null;
};

export type TourDepartureCalendarProps = {
  schedules: TourSchedule[];
  selectedScheduleId: number | null;
  onSelect: (scheduleId: number) => void;
  onReset: () => void;
};

export type TourDetailHeroProps = {
  tour: PublicTourDetail;
};

export type TourHighlightsListProps = {
  highlights?: string[];
};

export type TourItineraryTimelineProps = {
  itineraries?: TourItinerary[];
  durationDays?: number;
};

export type TourDestinationLite = {
  visit_order?: number | null;
  note?: string | null;
  name?: string | null;
  location_id?: number | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  locations?: LocationLite | null;
};

export type TourWithMapData = PublicTourDetail & {
  departure_locations?: LocationLite | null;
  tour_destinations?: TourDestinationLite[] | null;
};

export type TourSmartMapProps = {
  tour?: TourWithMapData | null;
};

export type RouteStop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  note?: string | null;
  isDeparture?: boolean;
};

export type VideoItem = {
  id: number;
  title: string;
  thumbnail: string;
  videoUrl: string;
};

export type TourVideoHighlightsProps = {
  videos?: VideoItem[];
};

export type TourCardProps = {
  tour: PublicTourCard;
  onTourClick?: (tour: PublicTourCard) => void;
};

export type TourEmptyStateProps = {
  message?: string;
};

export type TourFilterCalendarProps = {
  dateValue: string;
  onSelectDate: (value: string) => void;
  label?: string;
};

export type TourFilterSidebarProps = {
  keyword: string;
  setKeyword: (val: string) => void;
  destination: string;
  setDestination: (val: string) => void;
  dateFrom: string;
  setDateFrom: (val: string) => void;
  minPrice: string;
  setMinPrice: (val: string) => void;
  maxPrice: string;
  setMaxPrice: (val: string) => void;
  tourType: string;
  setTourType: (val: string) => void;
  duration: string;
  setDuration: (val: string) => void;
  onApplyFilters: () => void;
  totalResults: number;
};

export type TourMetaItemProps = {
  icon: ReactNode;
  label?: string;
  value: ReactNode;
  labelClassName?: string;
  valueClassName?: string;
  className?: string;
};

export type TourSortControlProps = {
  totalResults: number;
  sortBy: string;
  setSortBy: (val: string) => void;
  showBestsellerOption?: boolean;
};

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

export type TourReviewsSectionProps = {
  averageRating?: number;
  totalReviews?: number;
  breakdown?: RatingBreakdownItem[];
  reviews?: ReviewItem[];
  onViewAll?: () => void;
};

export type GetPublicToursParams = Omit<PublicToursQuery, 'min_price' | 'max_price' | 'deal'> & {
  min_price?: string | number;
  max_price?: string | number;
};
