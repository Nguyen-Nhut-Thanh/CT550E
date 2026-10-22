import type { ListResponse as LocationListPayload } from 'shared';
import { requestAdminJson } from "./requestAdminJson";

export function getAdminLocations<T>() {
  return requestAdminJson<LocationListPayload<T>>(
    "/admin/locations",
    { method: "GET" },
    "Không thể tải danh sách địa điểm.",
  );
}

export function getAdminLocationLevels<T>() {
  return requestAdminJson<T[]>(
    "/admin/locations/levels",
    { method: "GET" },
    "Không thể tải danh sách cấp độ.",
  );
}

export function getAdminLocationDetail<T>(locationId: string | number) {
  return requestAdminJson<T>(
    `/admin/locations/${locationId}`,
    { method: "GET" },
    "Không thể tải thông tin địa điểm.",
  );
}

export function deleteAdminLocation(locationId: number) {
  return requestAdminJson(
    `/admin/locations/${locationId}`,
    { method: "DELETE" },
    "Không thể xóa địa điểm.",
  );
}

export function updateAdminLocation(
  locationId: number,
  body: Record<string, unknown>,
) {
  return requestAdminJson(
    `/admin/locations/${locationId}`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    },
    "Không thể cập nhật địa điểm.",
  );
}

export function saveAdminLocation(
  locationId: string | number | null,
  body: Record<string, unknown>,
) {
  return requestAdminJson(
    locationId ? `/admin/locations/${locationId}` : "/admin/locations",
    {
      method: locationId ? "PATCH" : "POST",
      body: JSON.stringify(body),
    },
    "Không thể lưu địa điểm.",
  );
}
