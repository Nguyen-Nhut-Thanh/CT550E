import { z } from 'zod';

export const SchedulePickupPointSchema = z.object({
  name: z.string().min(1, 'Tên điểm đón không được để trống'),
  address: z.string().min(1, 'Địa chỉ đón không được để trống'),
  pickup_at: z.string().min(1, 'Thời gian đón không được để trống'),
  note: z.string().optional().nullable(),
});

export const ScheduleItinerarySchema = z.object({
  day_number: z.number().int().min(1).optional(),
  title: z.string().optional(),
  content: z.string().optional(),
  image_url: z.string().optional().nullable(),
});

export const SchedulePriceSchema = z.object({
  price: z.coerce.number().min(0, 'Giá không được âm'),
  ticket_type: z.string().default('adult'),
});

export const ScheduleAdminPayloadSchema = z.object({
  tour_id: z.coerce.number().int().positive('Mã tour không hợp lệ'),
  departure_location_id: z.coerce.number().int().positive('Điểm khởi hành không hợp lệ'),
  code: z.string().optional().nullable(),
  start_date: z.coerce.date({ message: 'Ngày bắt đầu không hợp lệ' }),
  end_date: z.coerce.date({ message: 'Ngày kết thúc không hợp lệ' }),
  quota: z.coerce.number().int().min(1, 'Số chỗ phải ít nhất là 1'),
  price: z.coerce.number().min(0, 'Giá khởi hành không được âm'),
  cover_image_url: z.string().optional().nullable(),
  status: z.coerce.number().int().default(1).optional(),
  pickup_points: z.array(SchedulePickupPointSchema).optional(),
  itineraries: z.array(ScheduleItinerarySchema).optional(),
  prices: z.array(SchedulePriceSchema).optional(),
  attraction_ids: z.array(z.number().int()).optional(),
  use_tour_amenities: z.boolean().optional(),
  copy_tour_amenities: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.end_date <= data.start_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Ngày kết thúc phải sau ngày bắt đầu',
      path: ['end_date'],
    });
  }
});
export type ScheduleAdminInput = z.infer<typeof ScheduleAdminPayloadSchema>;

export const SchedulePromotionPayloadSchema = z.object({
  title: z.string().trim().min(1, 'Vui lòng nhập tên chương trình ưu đãi.'),
  discount_type: z.enum(['percentage', 'fixed_amount'], {
    message: 'Loại ưu đãi không hợp lệ.',
  }),
  discount_value: z.coerce.number().positive('Giá trị giảm giá phải lớn hơn 0.'),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  usage_limit: z.coerce.number().int().positive().optional().nullable(),
  note: z.string().max(500).optional().nullable(),
});
export type SchedulePromotionPayloadInput = z.infer<typeof SchedulePromotionPayloadSchema>;
