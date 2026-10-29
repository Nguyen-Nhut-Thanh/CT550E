import { requestAdminJson } from "@/lib/http/requestAdminJson";
import type { MembershipAdminList, MembershipTier } from "shared";

export function getAdminMembership(page = 1) {
  return requestAdminJson<MembershipAdminList>(
    `/admin/membership?page=${page}`,
    { method: "GET", cache: "no-store" },
    "Không thể tải hạng thành viên.",
  );
}
export function saveMembershipSettings(tiers: MembershipTier[]) {
  return requestAdminJson<MembershipTier[]>(
    "/admin/membership/settings",
    { method: "PATCH", body: JSON.stringify({ tiers }) },
    "Không thể lưu cấu hình hạng thành viên.",
  );
}
