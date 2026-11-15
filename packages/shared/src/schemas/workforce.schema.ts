import { z } from 'zod';

export const RegionCodeEnum = z.enum(['north', 'central', 'south', 'overseas']);
export const WorkforceRoleEnum = z.enum(['admin', 'sales', 'operator', 'guide', 'support']);
export const CrewRoleEnum = z.enum(['tour_leader', 'deputy_leader', 'guide']);

export const EmployeePayloadSchema = z.object({
  email: z.string().email('Email không hợp lệ').optional(),
  password: z.string().min(6, 'Mật khẩu phải từ 6 ký tự').optional(),
  full_name: z.string().min(1, 'Họ tên không được để trống'),
  phone: z.string().optional().nullable(),
  employee_code: z.string().min(1, 'Mã nhân viên không được để trống'),
  position: z.string().min(1, 'Vị trí công việc không được để trống'),
  primary_region: RegionCodeEnum.optional().nullable(),
  regions: z.array(RegionCodeEnum).default([]),
  roles: z.array(WorkforceRoleEnum).min(1, 'Phải chọn ít nhất 1 vai trò'),
  employment_type: z.enum(['full_time', 'contractor']),
  status: z.enum(['active', 'inactive']).default('active'),
  languages: z.array(z.string()).default([]),
  note: z.string().optional().nullable(),
});
export type EmployeeInput = z.infer<typeof EmployeePayloadSchema>;

export const StaffShiftPayloadSchema = z.object({
  user_id: z.number().int().positive('ID nhân viên không hợp lệ'),
  duty_type: z.enum(['page', 'leave']),
  region_code: RegionCodeEnum.optional().nullable(),
  starts_at: z.string().min(1, 'Thời gian bắt đầu không được để trống'),
  ends_at: z.string().min(1, 'Thời gian kết thúc không được để trống'),
  note: z.string().optional(),
});
export type StaffShiftInput = z.infer<typeof StaffShiftPayloadSchema>;

export const CrewAssignmentItemSchema = z.object({
  user_id: z.number().int().positive('ID nhân viên không hợp lệ'),
  roles: z.array(CrewRoleEnum).min(1, 'Phải có ít nhất một vai trò điều hành đoàn'),
  report_at: z.string().min(1, 'Thời gian tập trung không được để trống'),
  release_at: z.string().min(1, 'Thời gian giải tán không được để trống'),
  note: z.string().optional(),
});

export const CrewPayloadSchema = z.object({
  crew_required_count: z.number().int().min(0).optional(),
  override_reason: z.string().optional(),
  assignments: z.array(CrewAssignmentItemSchema),
});
export type CrewInput = z.infer<typeof CrewPayloadSchema>;

