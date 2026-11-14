export type PromotionDiscountType = 'percentage' | 'fixed_amount' | string;

export interface SchedulePromotion {
  promotion_id: number;
  tour_schedule_id: number;
  title: string;
  discount_type: PromotionDiscountType;
  discount_value: number | any;
  max_slots: number | null;
  used_slots: number;
  start_date: string | Date;
  end_date: string | Date;
  gift_description: string | null;
  is_active: boolean;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface SaveSchedulePromotionPayload {
  title: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  max_slots?: number | null;
  start_date: string;
  end_date: string;
  gift_description?: string | null;
  is_active: boolean;
}

export interface SchedulePromotionSummary {
  has_promotion: boolean;
  promotion_title?: string;
  discount_type?: PromotionDiscountType;
  discount_value?: number;
  effective_price?: number;
  original_price?: number;
  is_active?: boolean;
  gift_description?: string | null;
}
