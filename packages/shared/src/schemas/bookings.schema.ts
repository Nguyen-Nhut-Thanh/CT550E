import { z } from 'zod';

export const TravelerSchema = z.object({
  fullName: z.string().min(1, 'Họ tên hành khách không được để trống'),
  gender: z.string().min(1, 'Giới tính không được để trống'),
  birthday: z.string().min(1, 'Ngày sinh không được để trống'),
  idNumber: z.string().optional(),
  type: z.string().default('adult'),
});

export const CreateBookingSchema = z.object({
  tour_schedule_id: z.number({ message: 'Vui lòng chọn lịch khởi hành.' }).int().positive(),
  pickup_point_id: z.number().int().positive().optional().nullable(),
  contact_name: z.string({ message: 'Vui lòng nhập họ tên người liên hệ.' }).min(1, 'Họ tên người liên hệ không được để trống.'),
  contact_phone: z.string({ message: 'Vui lòng nhập số điện thoại liên hệ.' }).min(9, 'Số điện thoại không hợp lệ.'),
  contact_email: z.string({ message: 'Vui lòng nhập email liên hệ.' }).email('Email không hợp lệ.'),
  contact_id_card: z.string().optional(),
  confirmed_schedule_conflict: z.boolean().optional(),
  adult_count: z.number().int().min(1, 'Phải có ít nhất 1 người lớn.'),
  child_count: z.number().int().min(0).default(0),
  infant_count: z.number().int().min(0).default(0),
  travelers: z.array(TravelerSchema).min(1, 'Danh sách hành khách không được để trống.'),
  note: z.string().max(1000, 'Ghi chú không được quá 1000 ký tự.').optional(),
  voucher_code: z.string().optional(),
  payment_method: z.string().min(1, 'Vui lòng chọn phương thức thanh toán.'),
  room_type: z.enum(['shared', 'single']).optional(),
  single_room_count: z.number().int().min(0).optional(),
  single_room_surcharge: z.number().min(0).optional(),
  additional_service_ids: z.array(z.string()).optional(),
});
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;

export const CancelBookingSchema = z.object({
  reason: z.string().min(5, 'Lý do hủy đơn cần ít nhất 5 ký tự.').max(500, 'Lý do hủy đơn không quá 500 ký tự.').optional(),
});
export type CancelBookingInput = z.infer<typeof CancelBookingSchema>;
