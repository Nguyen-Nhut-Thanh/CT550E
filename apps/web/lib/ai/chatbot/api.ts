import type { AiChatRequest, AiChatResponse } from "shared";
import { API_BASE } from "@/lib/http/config";

export async function sendAiChatMessage(request: AiChatRequest): Promise<AiChatResponse> {
  const response = await fetch(`${API_BASE}/ai/chatbot/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(60_000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) {
    throw new Error(response.status === 429 || response.status === 503
      ? data?.message || "Trợ lý AI đang bận. Bạn thử lại sau nhé."
      : "Chưa gửi được tin nhắn. Bạn thử lại nhé.");
  }
  return data;
}
