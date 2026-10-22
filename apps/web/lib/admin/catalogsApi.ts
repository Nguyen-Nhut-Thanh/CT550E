import type { ListResponse as ListPayload } from 'shared';
import { requestAdminJson } from "./requestAdminJson";

export function getAdminHotels<T>() {
  return requestAdminJson<T[]>(
    "/admin/catalogs/hotels",
    { method: "GET" },
    "Không thể tải danh sách khách sạn.",
  );
}

export function getAdminCatalogTransports<T>() {
  return requestAdminJson<T[]>(
    "/admin/catalogs/transports",
    { method: "GET" },
    "Không thể tải danh sách phương tiện.",
  );
}

export function getHotelRoomTypes<T>(hotelId: number) {
  return requestAdminJson<T[]>(
    `/admin/catalogs/hotels/${hotelId}/room-types`,
    { method: "GET" },
    "Không thể tải loại phòng.",
  );
}

export function getAdminTransports<T>() {
  return requestAdminJson<ListPayload<T>>(
    "/admin/transports",
    { method: "GET" },
    "Không thể tải danh sách phương tiện.",
  );
}
