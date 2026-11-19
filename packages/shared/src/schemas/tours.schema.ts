import { z } from 'zod';

export const TourListQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
  tour_type: z.string().optional(),
  destination_id: z.coerce.number().int().optional(),
  departure_id: z.coerce.number().int().optional(),
  deal: z.string().optional(),
  sort: z.string().optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
});
export type TourListQuery = z.infer<typeof TourListQuerySchema>;

export const TourAdminPayloadSchema = z.object({
  code: z.string().min(1, 'Mã tour không được để trống').optional(),
  name: z.string().min(1, 'Tên tour không được để trống'),
  summary: z.string().optional().nullable(),
  description: z.string().optional(),
  duration_days: z.coerce.number().int().min(1, 'Số ngày phải từ 1'),
  duration_nights: z.coerce.number().int().min(0, 'Số đêm không hợp lệ'),
  base_price: z.coerce.number().min(0, 'Giá gốc không được âm'),
  single_room_surcharge: z.coerce.number().min(0, 'Giá phụ thu không được âm').default(0).optional(),
  tour_type: z.enum(['domestic', 'outbound', 'international']).default('domestic'),
  departure_location_id: z.coerce.number().int().positive('Điểm khởi hành không hợp lệ'),
  destination_ids: z.array(z.number().int()).min(1, 'Phải có ít nhất 1 điểm đến').optional(),
  transport_id: z.coerce.number().int().optional().nullable(),
  status: z.coerce.number().int().default(1).optional(),
  cut_off_hours: z.coerce.number().int().min(0).default(24).optional(),
  cover_image: z.string().optional().nullable(),
});
export type TourAdminInput = z.infer<typeof TourAdminPayloadSchema>;

export const FlashDealPayloadSchema = z.object({
  schedule_id: z.coerce.number().int().positive('Lịch khởi hành không hợp lệ'),
  discount_type: z.enum(['percentage', 'fixed_amount', 'fixed'], {
    message: 'discount_type không hợp lệ',
  }),
  discount_value: z.coerce.number().positive('discount_value phải > 0'),
  start_date: z.coerce.date({ message: 'Thời gian bắt đầu không hợp lệ' }),
  end_date: z.coerce.date({ message: 'Thời gian kết thúc không hợp lệ' }),
  quota: z.coerce.number().int().positive().optional().nullable(),
  status: z.coerce.number().int().default(1).optional(),
}).superRefine((data, ctx) => {
  if (data.discount_type === 'percentage' && data.discount_value > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Phần trăm giảm không được vượt quá 100%',
      path: ['discount_value'],
    });
  }
  if (data.end_date <= data.start_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Thời gian kết thúc phải sau thời gian bắt đầu',
      path: ['end_date'],
    });
  }
});
export type FlashDealInput = z.infer<typeof FlashDealPayloadSchema>;
