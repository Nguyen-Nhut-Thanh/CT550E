import { getToken } from "@/lib/auth/session";
import { adminFetch } from "@/lib/http/adminFetch";
import { API_BASE } from "@/lib/http/config";
import { uploadAuthenticatedFile } from "@/lib/http/uploadApi";
import type { AdminBannerPayload, Banner, SeasonalThemeConfig } from 'shared';

async function parseJsonResponse<T>(response: Response) {
  return (await response.json()) as T;
}

export async function fetchAdminBanners() {
  const response = await adminFetch("/banners/admin");
  if(!response.ok) {
    throw new Error("Không thể tải danh sách banner");
  }

  return parseJsonResponse<Banner[]>(response);
}

export async function fetchAdminBannerDetail(bannerId: string | number) {
  const response = await adminFetch(`/banners/admin/${bannerId}`);
  if(!response.ok) {
    throw new Error("Không thể tải thông tin banner");
  }

  return parseJsonResponse<Banner>(response);
}

export async function saveAdminBanner(
  payload: AdminBannerPayload,
  bannerId?: string | number,
) {
  const response = await adminFetch(
    bannerId ? `/banners/admin/${bannerId}` : "/banners/admin",
    {
      method: bannerId ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    },
  );

  if(!response.ok) {
    throw new Error("Không thể lưu banner");
  }

  return response;
}

export async function updateAdminBannerStatus(bannerId: number, status: number) {
  const response = await adminFetch(`/banners/admin/${bannerId}`, {method: "PATCH", body: JSON.stringify({status})});
  if (!response.ok) throw new Error("Không thể cập nhật trạng thái banner");
}

export async function deleteAdminBanner(bannerId: string | number) {
  const response = await adminFetch(`/banners/admin/${bannerId}`, {
    method: "DELETE",
  });

  if(!response.ok) {
    throw new Error("Không thể xóa banner");
  }
}

export async function uploadAdminBannerImage(file: File) {
  const data = await uploadAuthenticatedFile(
    `${API_BASE}/banners/admin/upload`,
    getToken() || "",
    file,
    "Không thể upload ảnh banner",
  );

  if (!data?.url) {
    throw new Error(data?.message || "Không thể upload ảnh banner");
  }

  return { url: data.url };
}

export async function fetchAdminSeasonalTheme(): Promise<SeasonalThemeConfig> {
  const response = await adminFetch("/banners/admin/seasonal-theme");
  if (!response.ok) {
    throw new Error("Không thể tải cấu hình hiệu ứng 4 mùa");
  }
  return parseJsonResponse<SeasonalThemeConfig>(response);
}

export async function saveAdminSeasonalTheme(payload: Partial<SeasonalThemeConfig>): Promise<SeasonalThemeConfig> {
  const response = await adminFetch("/banners/admin/seasonal-theme", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Không thể lưu cấu hình hiệu ứng 4 mùa");
  }
  return parseJsonResponse<SeasonalThemeConfig>(response);
}
