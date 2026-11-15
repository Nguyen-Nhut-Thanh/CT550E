import { getToken } from "@/lib/auth/session";
import { API_BASE } from "@/lib/http/config";
import { requestJson } from "@/lib/http/requestJson";
import { uploadAuthenticatedFile } from "@/lib/http/uploadApi";
import type { AccountBooking, AccountStats, UploadResponse } from 'shared';

export function updateUserProfile(body: Record<string, unknown>) {
  return requestJson("/auth/update-profile", {
    method: "POST",
    body,
    requireAuth: true,
    fallbackMessage: "Không thể cập nhật thông tin",
  });
}

export function changeUserPassword(body: {
  oldPassword?: string;
  newPassword: string;
}) {
  return requestJson("/auth/change-password", {
    method: "POST",
    body,
    requireAuth: true,
    fallbackMessage: "Không thể cập nhật mật khẩu",
  });
}

export function getAccountStats() {
  return requestJson<AccountStats>("/bookings/stats", {
    method: "GET",
    requireAuth: true,
    fallbackMessage: "Không thể tải thống kê tài khoản.",
  });
}

export function getMyBookings() {
  return requestJson<AccountBooking[]>("/bookings/my", {
    method: "GET",
    requireAuth: true,
    fallbackMessage: "Không thể tải danh sách booking.",
  });
}

export async function uploadUserAvatar(file: File) {
  const data = await uploadAuthenticatedFile(
    `${API_BASE}/auth/upload-avatar`,
    getToken() || "",
    file,
    "Không thể upload ảnh",
  );

  if (!data?.url) {
    throw new Error(data?.message || "Không thể upload ảnh");
  }

  return data as UploadResponse;
}
