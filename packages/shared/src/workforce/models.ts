export const WORKFORCE_REGIONS = { north: 'Miền Bắc', central: 'Miền Trung', south: 'Miền Nam' } as const;
export const WORKFORCE_ROLES = { admin: 'Quản trị viên', region_manager: 'Quản lý miền', page_staff: 'Trực page / tư vấn', tour_leader: 'Trưởng đoàn', deputy_leader: 'Phó đoàn', guide: 'Hướng dẫn viên' } as const;
export type RegionCode = keyof typeof WORKFORCE_REGIONS;
export type WorkforceRole = keyof typeof WORKFORCE_ROLES;
export type WorkforceActor = { userId: number; fullName: string; roles: WorkforceRole[]; regions: RegionCode[]; isAdmin: boolean; isManager: boolean; canChat: boolean };
export type EmployeePayload = {
  email?: string; password?: string; full_name: string; phone?: string | null;
  employee_code: string; position: string; primary_region: RegionCode | null; regions: RegionCode[];
  roles: WorkforceRole[]; employment_type: 'full_time' | 'contractor'; status: 'active' | 'inactive'; languages: string[]; note?: string | null;
};
export type Employee = Omit<EmployeePayload, 'password'> & { user_id: number; account_status: number };
export type StaffShiftPayload = { user_id: number; duty_type: 'page' | 'leave'; region_code?: RegionCode | null; starts_at: string; ends_at: string; note?: string };
export type StaffShift = StaffShiftPayload & { shift_id: number; status: string; user: { full_name: string } };
export const CREW_ROLES = { tour_leader: 'Trưởng đoàn', deputy_leader: 'Phó đoàn', guide: 'Hướng dẫn viên' } as const;
export type CrewRole = keyof typeof CREW_ROLES;
export type CrewPayload = { crew_required_count?: number; assignments: Array<{ roles: CrewRole[]; user_id: number; report_at: string; release_at: string; note?: string }> };
export type CrewAssignment = {
  assignment_id: number; tour_schedule_id: number; user_id: number; roles: CrewRole[]; status: 'pending' | 'confirmed' | 'declined' | 'completed';
  report_at: string; release_at: string; note?: string | null; response_note?: string | null; user: { full_name: string; phone?: string | null };
};
export type WorkforceSchedule = {
  tour_schedule_id: number; code: string | null; start_date: string; end_date: string; status: number; booked_count: number;
  cover_image_url?: string | null;
  operating_region: RegionCode | null; departure_location: { name: string }; tours: { name: string }; crew: CrewAssignment[]; crew_ready: boolean;
  crew_required_count: number; crew_confirmed_count: number; crew_issues: string[];
};
export type WorkforceOverview = { employees: number; on_duty: number; upcoming: number; missing_crew: number };
