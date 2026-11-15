import { z } from 'zod';

export const CreateReviewSchema = z.object({
  rating: z
    .number({ message: 'Vui lòng chọn số sao đánh giá.' })
    .int('Số sao đánh giá phải là số nguyên.')
    .min(1, 'Số sao đánh giá phải từ 1 đến 5.')
    .max(5, 'Số sao đánh giá phải từ 1 đến 5.'),
  comment: z
    .string({ message: 'Vui lòng nhập nội dung đánh giá.' })
    .min(1, 'Nội dung đánh giá phải từ 1 đến 5000 ký tự.')
    .max(5000, 'Nội dung đánh giá không được quá 5000 ký tự.'),
  booking_id: z.number().int().positive().optional().nullable(),
  images: z.array(z.string()).optional(),
});
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

export const UpdateReviewSchema = z.object({
  rating: z
    .number()
    .int('Số sao đánh giá phải là số nguyên.')
    .min(1, 'Số sao đánh giá phải từ 1 đến 5.')
    .max(5, 'Số sao đánh giá phải từ 1 đến 5.')
    .optional(),
  comment: z
    .string()
    .min(1, 'Nội dung đánh giá phải từ 1 đến 5000 ký tự.')
    .max(5000, 'Nội dung đánh giá không được quá 5000 ký tự.')
    .optional(),
});
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;

export const CreateReviewReplySchema = z.object({
  content: z.string({ message: 'Nội dung trả lời không được để trống.' }).min(1, 'Nội dung trả lời không được để trống.'),
});
export type CreateReviewReplyInput = z.infer<typeof CreateReviewReplySchema>;

export const AdminUpdateReviewStatusSchema = z.object({
  status: z.union([z.literal(0), z.literal(1)]),
});
export type AdminUpdateReviewStatusInput = z.infer<typeof AdminUpdateReviewStatusSchema>;
