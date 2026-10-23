import { getToken } from "@/lib/auth/session";
import type { RecommendationEventPayload } from "shared";

import { API_BASE as API_BASE_URL } from "@/lib/http/config";

export async function trackRecommendationEvent(
  payload: RecommendationEventPayload,
): Promise<void> {
  const token = getToken();
  if(!token) return;

  try {
    await fetch(`${API_BASE_URL}/recommendation-profile/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silent by design: tracking should never block UX.
  }
}
