import { z } from 'zod';

export const VoucherCodeRegex = /^[A-Z0-9_-]{1,50}$/;

export const VoucherDiscountTypeEnum = z.enum(['percentage', 'fixed', 'fixed_amount'], {
  message: 'Loại giảm giá không hợp lệ.',
});

export const VoucherApplicableScopeEnum = z.enum(['all', 'tour_type', 'specific_tours'], {
  message: 'Phạm vi áp dụng tour không hợp lệ.',
});

export const BaseVoucherPayloadSchema = z.object({
  code: z
    .string({ message: 'Mã voucher không được để trống.' })
    .regex(VoucherCodeRegex, 'Mã voucher cần 1–50 ký tự chữ, số, gạch ngang hoặc gạch dưới.'),
  name: z.string().trim().max(255).optional().nullable(),
  short_description: z.string().trim().max(1000).optional().nullable(),
  image_url: z.string().trim().max(1000).optional().nullable(),
  discount_type: VoucherDiscountTypeEnum,
  discount_value: z
    .number({ message: 'Mức giảm giá không được để trống.' })
    .min(0.01, 'Mức giảm phải lớn hơn 0.')
    .max(9_999_999_999, 'Giá trị tiền không hợp lệ.'),
  min_order_value: z
    .number()
    .min(0, 'Giá trị tiền không hợp lệ.')
    .max(9_999_999_999, 'Giá trị tiền không hợp lệ.')
    .optional()
    .nullable(),
  max_discount_amount: z
    .number()
    .min(0, 'Giá trị tiền không hợp lệ.')
    .max(9_999_999_999, 'Giá trị tiền không hợp lệ.')
    .optional()
    .nullable(),
  usage_limit: z
    .number()
    .int('Số lượng voucher phải là số nguyên.')
    .min(1, 'Số lượng voucher không hợp lệ.')
    .max(2147483647, 'Số lượng voucher không hợp lệ.')
    .optional()
    .nullable(),
  usage_limit_per_user: z
    .number()
    .int('Giới hạn lượt dùng phải là số nguyên.')
    .min(1, 'Giới hạn lượt dùng trên mỗi khách không hợp lệ.')
    .max(2147483647, 'Giới hạn lượt dùng trên mỗi khách không hợp lệ.')
    .optional()
    .nullable(),
  applicable_scope: VoucherApplicableScopeEnum.optional(),
  applicable_tour_ids: z.array(z.number().int()).optional().nullable(),
  applicable_tour_types: z.array(z.string()).optional().nullable(),
  eligible_tiers: z.array(z.string()).optional().nullable(),
  start_date: z.coerce.date({ message: 'Thời gian voucher không hợp lệ.' }),
  expiry_date: z.coerce.date({ message: 'Thời gian voucher không hợp lệ.' }),
  status: z.union([z.literal(0), z.literal(1)]).optional(),
});

export const VoucherPayloadSchema = BaseVoucherPayloadSchema.superRefine((data, ctx) => {
  if (data.discount_type === 'percentage' && data.discount_value > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Mức giảm phần trăm không vượt quá 100.',
      path: ['discount_value'],
    });
  }
  if (data.expiry_date <= data.start_date) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Ngày hết hạn phải sau ngày bắt đầu.',
      path: ['expiry_date'],
    });
  }
});

export type VoucherInput = z.infer<typeof VoucherPayloadSchema>;

export const UpdateVoucherPayloadSchema = BaseVoucherPayloadSchema.partial();
export type UpdateVoucherInput = z.infer<typeof UpdateVoucherPayloadSchema>;

export const ValidateVoucherQuerySchema = z.object({
  code: z.string().min(1, 'Mã giảm giá không hợp lệ.'),
  amount: z.coerce.number().positive('Giá trị đơn không hợp lệ.'),
  tourId: z.coerce.number().int().positive().optional(),
});
export type ValidateVoucherQuery = z.infer<typeof ValidateVoucherQuerySchema>;

export const HomeVoucherCampaignSchema = z.object({
  enabled: z.boolean().optional(),
  title: z.string().trim().min(1, 'Tiêu đề không được để trống.').optional(),
  subtitle: z.string().trim().optional(),
  badge: z.string().trim().optional(),
  voucher_ids: z.array(z.number().int().positive()).optional(),
});
export type HomeVoucherCampaignInput = z.infer<typeof HomeVoucherCampaignSchema>;
