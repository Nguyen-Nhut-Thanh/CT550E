import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự'),
  full_name: z.string().min(1, 'Họ tên không được để trống'),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const VerifyEmailSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  code: z.string().min(1, 'Mã xác thực không được để trống'),
});
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;

export const ResendVerificationSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});
export type ResendVerificationInput = z.infer<typeof ResendVerificationSchema>;

export const GoogleLoginSchema = z.object({
  token: z.string().min(1, 'Token không được để trống'),
});
export type GoogleLoginInput = z.infer<typeof GoogleLoginSchema>;

export const ChangePasswordSchema = z.object({
  old_password: z.string().optional(),
  new_password: z.string().min(6, 'Mật khẩu mới phải từ 6 ký tự'),
});
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export const UpdateProfileSchema = z.object({
  full_name: z.string().min(1, 'Họ tên không được để trống').optional(),
  phone: z.string().optional().nullable(),
  avatar_url: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  citizen_id: z.string().optional().nullable(),
  birthday: z.string().optional().nullable(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

