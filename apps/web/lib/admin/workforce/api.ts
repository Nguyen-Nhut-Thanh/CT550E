import { requestJson } from '@/lib/http/requestJson';
import { formatVietnamDateTimeInput } from '@/lib/utils/dateTime';
import type { CrewPayload, Employee, EmployeePayload, StaffShift, StaffShiftPayload, WorkforceActor, WorkforceOverview, WorkforceSchedule } from 'shared';
const base = '/admin/workforce';
function request<T>(path: string, method = 'GET', body?: unknown) {
  return requestJson<T>(`${base}${path}`, {
    authMode: 'admin',
    method,
    body,
  });
}
const query = (region: string) => region ? `?region=${encodeURIComponent(region)}` : '';
export const workforceApi = {
  me: () => request<WorkforceActor>('/me'),
  overview: () => request<WorkforceOverview>('/overview'),
  employees: (region = '') => request<Employee[]>(`/employees${query(region)}`),
  saveEmployee: (userId: number | null, body: EmployeePayload) => request(`/employees${userId ? `/${userId}` : ''}`, userId ? 'PATCH' : 'POST', body),
  shifts: (region = '') => request<StaffShift[]>(`/shifts${query(region)}`),
  createShift: (body: StaffShiftPayload) => request('/shifts', 'POST', body),
  cancelShift: (id: number) => request(`/shifts/${id}/cancel`, 'POST'),
  schedules: (region = '') => request<WorkforceSchedule[]>(`/schedules${query(region)}`),
  setRegion: (id: number, region_code: string, override_reason?: string) => request(`/schedules/${id}/region`, 'PATCH', { region_code, override_reason }),
  crew: (id: number, body: CrewPayload) => request(`/schedules/${id}/crew`, 'PUT', body),
  respond: (id: number, action: string, note?: string) => request(`/assignments/${id}/respond`, 'POST', { action, note }),
  events: (id?: number) => request<Array<{ event_id: number; action: string; actor_user_id: number; created_at: string; details: unknown }>>(`/events${id ? `?schedule_id=${id}` : ''}`),
};
export const vietnamInput = formatVietnamDateTimeInput;
export function fromVietnamInput(value: string) { return new Date(`${value}:00+07:00`).toISOString(); }
export function workforceDate(value: string) { return new Date(value).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
