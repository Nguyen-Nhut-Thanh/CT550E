import { requestAdminJson } from "@/lib/http/requestAdminJson";
import type { MembershipAdminList, MembershipSummary, MembershipTier } from "shared";

export function getAdminMembership(page = 1, search = "", tier = "all", limit = 20) {
  const query = new URLSearchParams({ page: String(page), search, tier, limit: String(limit) });
  return requestAdminJson<MembershipAdminList>(
    `/admin/membership?${query}`,
    { method: "GET", cache: "no-store" },
    "Không thể tải hạng thành viên.",
  );
}
export function getMemberDetails(userId: number) {
  return requestAdminJson<MembershipSummary>(`/admin/membership/customers/${userId}`, { method: "GET", cache: "no-store" }, "Không thể tải chi tiết thành viên.");
}
export function saveMembershipSettings(tiers: MembershipTier[]) {
  return requestAdminJson<MembershipTier[]>(
    "/admin/membership/settings",
    { method: "PATCH", body: JSON.stringify({ tiers }) },
    "Không thể lưu cấu hình hạng thành viên.",
  );
}
