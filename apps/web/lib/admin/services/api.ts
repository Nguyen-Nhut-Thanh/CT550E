import { requestAdminJson } from "@/lib/http/requestAdminJson";
import type {
  AdminHotel,
  AdminHotelRoomType,
  AdminProvider,
  AdminTransport,
  HotelPayload,
  ProviderPayload,
  RoomTypePayload,
  TransportPayload,
} from "shared";

// ==========================================
// HOTELS
// ==========================================
export function getServicesHotels(params?: {
  search?: string;
  locationId?: number;
  starRating?: number;
  status?: number;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.locationId) query.set("locationId", String(params.locationId));
  if (params?.starRating) query.set("starRating", String(params.starRating));
  if (typeof params?.status === "number") query.set("status", String(params.status));

  const qs = query.toString();
  return requestAdminJson<AdminHotel[]>(
    `/admin/services/hotels${qs ? `?${qs}` : ""}`,
    { method: "GET" },
    "Không thể tải danh sách khách sạn.",
  );
}

export function getServicesHotel(id: number) {
  return requestAdminJson<AdminHotel>(
    `/admin/services/hotels/${id}`,
    { method: "GET" },
    "Không thể tải thông tin khách sạn.",
  );
}

export function createServicesHotel(data: HotelPayload) {
  return requestAdminJson<AdminHotel>(
    "/admin/services/hotels",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    "Không thể tạo khách sạn.",
  );
}

export function updateServicesHotel(id: number, data: Partial<HotelPayload>) {
  return requestAdminJson<AdminHotel>(
    `/admin/services/hotels/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    "Không thể cập nhật khách sạn.",
  );
}

export function deleteServicesHotel(id: number) {
  return requestAdminJson<{ success: boolean }>(
    `/admin/services/hotels/${id}`,
    { method: "DELETE" },
    "Không thể xóa khách sạn.",
  );
}

// ==========================================
// ROOM TYPES
// ==========================================
export function getServicesRoomTypes(hotelId: number) {
  return requestAdminJson<AdminHotelRoomType[]>(
    `/admin/services/hotels/${hotelId}/room-types`,
    { method: "GET" },
    "Không thể tải danh sách loại phòng.",
  );
}

export function createServicesRoomType(hotelId: number, data: RoomTypePayload) {
  return requestAdminJson<AdminHotelRoomType>(
    `/admin/services/hotels/${hotelId}/room-types`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    "Không thể tạo loại phòng.",
  );
}

export function updateServicesRoomType(id: number, data: Partial<RoomTypePayload>) {
  return requestAdminJson<AdminHotelRoomType>(
    `/admin/services/room-types/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    "Không thể cập nhật loại phòng.",
  );
}

export function deleteServicesRoomType(id: number) {
  return requestAdminJson<{ success: boolean }>(
    `/admin/services/room-types/${id}`,
    { method: "DELETE" },
    "Không thể xóa loại phòng.",
  );
}

// ==========================================
// TRANSPORTS
// ==========================================
export function getServicesTransports(params?: {
  search?: string;
  type?: string;
  providerId?: number;
  status?: number;
}) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.type) query.set("type", params.type);
  if (params?.providerId) query.set("providerId", String(params.providerId));
  if (typeof params?.status === "number") query.set("status", String(params.status));

  const qs = query.toString();
  return requestAdminJson<AdminTransport[]>(
    `/admin/services/transports${qs ? `?${qs}` : ""}`,
    { method: "GET" },
    "Không thể tải danh sách phương tiện.",
  );
}

export function createServicesTransport(data: TransportPayload) {
  return requestAdminJson<AdminTransport>(
    "/admin/services/transports",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    "Không thể tạo phương tiện.",
  );
}

export function updateServicesTransport(id: number, data: Partial<TransportPayload>) {
  return requestAdminJson<AdminTransport>(
    `/admin/services/transports/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    "Không thể cập nhật phương tiện.",
  );
}

export function deleteServicesTransport(id: number) {
  return requestAdminJson<{ success: boolean }>(
    `/admin/services/transports/${id}`,
    { method: "DELETE" },
    "Không thể xóa phương tiện.",
  );
}

// ==========================================
// PROVIDERS
// ==========================================
export function getServicesProviders() {
  return requestAdminJson<AdminProvider[]>(
    "/admin/services/providers",
    { method: "GET" },
    "Không thể tải danh sách nhà cung cấp.",
  );
}

export function createServicesProvider(data: ProviderPayload) {
  return requestAdminJson<AdminProvider>(
    "/admin/services/providers",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    "Không thể tạo nhà cung cấp.",
  );
}

export function updateServicesProvider(id: number, data: Partial<ProviderPayload>) {
  return requestAdminJson<AdminProvider>(
    `/admin/services/providers/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
    "Không thể cập nhật nhà cung cấp.",
  );
}

export function deleteServicesProvider(id: number) {
  return requestAdminJson<{ success: boolean }>(
    `/admin/services/providers/${id}`,
    { method: "DELETE" },
    "Không thể xóa nhà cung cấp.",
  );
}

