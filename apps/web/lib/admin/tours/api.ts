import { requestAdminJson } from "@/lib/http/requestAdminJson";
import type { ListResponse as ToursListResponse } from 'shared';

export function getAdminTours<T>() {
  return requestAdminJson<ToursListResponse<T>>(
    "/admin/tours",
    { method: "GET" },
    "Không thể tải danh sách tour.",
  );
}

export function getAdminTourDetail<T>(tourId: string | number) {
  return requestAdminJson<{ tour: T }>(
    `/admin/tours/${tourId}`,
    { method: "GET" },
    "Không thể tải thông tin tour.",
  );
}

export function toggleAdminTourStatus(tourId: number) {
  return requestAdminJson(
    `/admin/tours/${tourId}/status`,
    { method: "PATCH" },
    "Không thể cập nhật trạng thái tour.",
  );
}

export function deleteAdminTour(tourId: number) {
  return requestAdminJson(
    `/admin/tours/${tourId}`,
    { method: "DELETE" },
    "Không thể xóa tour.",
  );
}

export function createAdminTour(body: Record<string, unknown>) {
  return requestAdminJson(
    "/admin/tours",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    "Không thể tạo tour.",
  );
}

export function updateAdminTour(
  tourId: string | number,
  body: Record<string, unknown>,
) {
  return requestAdminJson(
    `/admin/tours/${tourId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
    "Không thể cập nhật tour.",
  );
}
