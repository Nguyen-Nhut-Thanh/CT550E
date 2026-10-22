import type { TourPolicyContentMap } from '../tour-policy';

export type LocationOption = {
  location_id: number;
  name: string;
  country_code?: string | null;
};

export type TransportOption = {
  transport_id: number;
  name: string;
  transport_type: string;
};

export type ToursPageTour = {
  tour_id: number;
  code: string;
  name: string;
  duration_days: number;
  duration_nights: number;
  base_price: string | number;
  status: number;
  tour_type: string | null;
  tour_images?: { image_url: string; is_cover: number }[];
};

export type TourBasicInfoCardProps = {
  tour: TourDetailForm;
  locations: LocationOption[];
  transports: TransportOption[];
  lockCoreFields?: boolean;
  onTourChange: (updater: (prev: TourDetailForm) => TourDetailForm) => void;
};

export type TourDetailsCardProps = {
  tour: TourDetailForm;
  onTourChange: (updater: (prev: TourDetailForm) => TourDetailForm) => void;
};

export type TourPoliciesAccordionEditorProps = {
  value: TourPolicyContentMap | undefined;
  onChange: (next: TourPolicyContentMap) => void;
};

export type TourSidebarProps = {
  tour: TourDetailForm;
  saving: boolean;
  success: boolean;
  lockCoreFields?: boolean;
  onSave: () => void;
  onTourChange: (updater: (prev: TourDetailForm) => TourDetailForm) => void;
};

export type TourScheduleSummary = {
  _count?: {
    bookings?: number;
  };
};

export type TourDetailForm = {
  name?: string;
  code?: string;
  description?: string | null;
  tour_type?: string;
  departure_location?: number;
  transport_id?: number;
  destinations?: number[];
  images?: string[] | string;
  duration_days?: number;
  duration_nights?: number;
  cuisine_info?: string | null;
  promotion_info?: string | null;
  best_for?: string | null;
  best_time?: string | null;
  policy_contents?: TourPolicyContentMap;
  cut_off_hours?: number;
  base_price?: number | string;
  tour_schedules?: TourScheduleSummary[];
  tour_destinations?: { location_id: number }[];
  tour_images?: { image_url: string }[];
  tour_policies?: {
    policy_id: number;
    policy_type: string;
    content: string;
  }[];
};

export type TourLike = {
  code?: string | null;
  name?: string | null;
  status: number;
  tour_type?: string | null;
};
