import { requestJson } from "@/lib/http/requestJson";
import { uploadValidatedImage } from "@/lib/http/uploadApi";
import type { AdminBannerPayload, Banner, SeasonalThemeConfig } from 'shared';

export function fetchAdminBanners() {
  return requestJson<Banner[]>("/banners/admin", {
    authMode: "admin",
    fallbackMessage: "Không thể tải danh sách banner",
  });
}

export function fetchAdminBannerDetail(bannerId: string | number) {
  return requestJson<Banner>(`/banners/admin/${bannerId}`, {
    authMode: "admin",
    fallbackMessage: "Không thể tải thông tin banner",
  });
}

export function saveAdminBanner(
  payload: AdminBannerPayload,
  bannerId?: string | number,
) {
  return requestJson<Banner>(
    bannerId ? `/banners/admin/${bannerId}` : "/banners/admin",
    {
      authMode: "admin",
      method: bannerId ? "PATCH" : "POST",
      body: payload,
      fallbackMessage: "Không thể lưu banner",
    },
  );
}

export function updateAdminBannerStatus(bannerId: number, status: number) {
  return requestJson<void>(`/banners/admin/${bannerId}`, {
    authMode: "admin",
    method: "PATCH",
    body: { status },
    fallbackMessage: "Không thể cập nhật trạng thái banner",
  });
}

export function deleteAdminBanner(bannerId: string | number) {
  return requestJson<void>(`/banners/admin/${bannerId}`, {
    authMode: "admin",
    method: "DELETE",
    fallbackMessage: "Không thể xóa banner",
  });
}

export async function uploadAdminBannerImage(file: File) {
  return uploadValidatedImage(
    "/banners/admin/upload",
    file,
    "Không thể upload ảnh banner",
  );
}

export function fetchAdminSeasonalTheme(): Promise<SeasonalThemeConfig> {
  return requestJson<SeasonalThemeConfig>("/banners/admin/seasonal-theme", {
    authMode: "admin",
    fallbackMessage: "Không thể tải cấu hình hiệu ứng 4 mùa",
  });
}

export function saveAdminSeasonalTheme(
  payload: Partial<SeasonalThemeConfig>,
): Promise<SeasonalThemeConfig> {
  return requestJson<SeasonalThemeConfig>("/banners/admin/seasonal-theme", {
    authMode: "admin",
    method: "POST",
    body: payload,
    fallbackMessage: "Không thể lưu cấu hình hiệu ứng 4 mùa",
  });
}
