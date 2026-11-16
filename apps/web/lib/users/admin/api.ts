import { requestJson } from "@/lib/http/requestJson";
import type { UserItem } from "shared";

export function getAdminUsers() {
  return requestJson<UserItem[]>("/admin/users", {
    authMode: "admin",
    method: "GET",
    fallbackMessage: "Không thể tải danh sách người dùng.",
  });
}

export function updateAdminUserStatus(userId: number, status: number) {
  return requestJson(`/admin/users/${userId}/status`, {
    authMode: "admin",
    method: "PATCH",
    body: { status },
    fallbackMessage: "Không thể cập nhật trạng thái tài khoản.",
  });
}
