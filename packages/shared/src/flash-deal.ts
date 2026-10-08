export type FlashDealItem = {
  schedule_id: number;
  tour_id: number;
  code: string;
  name: string;
  slug: string;
  image_url: string | null;
  departure_name: string;
  start_date: string;
  end_date: string;
  duration_text: string;
  original_price: number;
  sale_price: number;
  seats_left: number;
  discount_percent: number | null;
  countdown_to: string;
  link: string;
  transport_name?: string | null;
  transport_type?: string | null;
  promotion_info: string | null;
  cover_image_url: string | null;
  deal_id?: number;
  discount_value?: number;
  discount_type?: string;
};

export type FlashDealResponse = {
  items: FlashDealItem[];
  total: number;
  fetched_at: string;
};

export type FlashDealPayload = {
  tour_schedule_id?: number | string;
  discount_type?: string;
  discount_value?: number | string;
  start_date?: string | Date;
  end_date?: string | Date;
  status?: number | string;
};

export type FlashDealTourRecord = {
  tour_id: number;
  code: string;
  name: string;
  duration_days: number;
  duration_nights: number;
  promotion_info: string | null;
  departure_locations?: { name: string | null } | null;
  transports?: { name: string | null } | null;
  tour_images: Array<{ image_url: string | null }>;
};
