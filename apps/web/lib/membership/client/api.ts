import { requestWithToken } from "@/lib/http/requestWithToken";
import type { MembershipSummary } from "shared";

export function getMembership() {
  return requestWithToken<MembershipSummary>("/membership/me", {
    cache: "no-store",
  });
}
export function markMembershipNotificationsRead() {
  return requestWithToken<{ success: boolean }>(
    "/membership/notifications/read",
    { method: "POST" },
  );
}

export function redeemMembershipReward(rewardId: string) {
  return requestWithToken<{
    success: boolean;
    voucherCode: string;
    remainingPoints: number;
  }>("/membership/rewards/redeem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rewardId }),
  });
}
