import { requestAdminJson } from "@/lib/http/requestAdminJson";
import type { TourScheduleTemplate, TourScheduleTemplateResponse } from 'shared';

export function getTourScheduleTemplate(tourId: number | string) {
  return requestAdminJson<TourScheduleTemplateResponse>(`/admin/tours/${tourId}/schedule-template`, { method: 'GET' }, 'Không thể tải mẫu lịch trình.');
}
export function saveTourScheduleTemplate(tourId: number | string, template: TourScheduleTemplate, allowIncomplete = false) {
  return requestAdminJson<TourScheduleTemplateResponse>(`/admin/tours/${tourId}/schedule-template`, { method: 'PATCH', body: JSON.stringify({ ...template, allow_incomplete_itinerary: allowIncomplete }) }, 'Không thể lưu mẫu lịch trình.');
}

export function getTourSchedules<T>(tourId: number) {
  return requestAdminJson<T[]>(
    `/admin/tours/${tourId}/schedules`,
    { method: "GET" },
    "Không thể tải lịch trình.",
  );
}

export function createTourSchedule(
  tourId: number,
  body: Record<string, unknown>,
) {
  return requestAdminJson(
    `/admin/tours/${tourId}/schedules`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    "Không thể tạo lịch trình.",
  );
}

export function deleteTourSchedule(scheduleId: number) {
  return requestAdminJson(
    `/admin/tours/schedules/${scheduleId}/delete`,
    { method: "POST" },
    "Không thể xóa lịch trình.",
  );
}

export function getAdminScheduleDetail<T>(scheduleId: string | number) {
  return requestAdminJson<T>(
    `/admin/tours/schedules/${scheduleId}`,
    { method: "GET" },
    "Không thể tải chi tiết lịch khởi hành.",
  );
}

export function saveAdminSchedule(
  path: string,
  method: "POST" | "PATCH",
  body: Record<string, unknown>,
) {
  return requestAdminJson(
    path,
    {
      method,
      body: JSON.stringify(body),
    },
    "Không thể lưu lịch khởi hành.",
  );
}

export function deleteAdminSchedule(scheduleId: number) {
  return requestAdminJson(
    `/admin/tours/schedules/${scheduleId}`,
    { method: "DELETE" },
    "Không thể xóa lịch khởi hành.",
  );
}

export function updateAdminScheduleStatus(scheduleId: number, status: number) {
  return requestAdminJson(
    `/admin/tours/schedules/${scheduleId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    "Không thể cập nhật trạng thái lịch khởi hành.",
  );
}
