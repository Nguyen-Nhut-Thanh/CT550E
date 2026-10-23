import { requestAdminJson } from "@/lib/http/requestAdminJson";
import type { FlashDealForm, FlashDealSchedule } from "shared";

export function getAdminFlashDeals() {
  return requestAdminJson<FlashDealSchedule[]>(
    "/admin/marketing/flash-deals",
    { method: "GET" },
    "Không thể tải danh sách lịch trình.",
  );
}

export function saveAdminFlashDeal(
  path: string,
  method: "POST" | "PATCH",
  payload: FlashDealForm | Record<string, unknown>,
) {
  return requestAdminJson(
    path,
    {
      method,
      body: JSON.stringify(payload),
    },
    "Không thể cập nhật flash deal.",
  );
}
