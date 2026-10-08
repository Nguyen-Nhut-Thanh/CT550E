import { getToken } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:4000";

type RecommendationEventPayload = {
  event_type: string;
  source?: string;
  tour_id?: number;
  destination?: string;
  metadata?: Record<string, unknown>;
};

export async function trackRecommendationEvent(
  payload: RecommendationEventPayload,
): Promise<void> {
  const token = getToken();
  if (!token) return;

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
