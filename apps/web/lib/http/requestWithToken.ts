import { getToken } from "@/lib/auth/session";
import { API_BASE } from "@/lib/http/config";

export async function requestWithToken<T>(path: string, init: RequestInit = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: `Bearer ${token || ""}`,
    },
  });

  const data = await response.json().catch(() => null);

  if(!response.ok) {
    const message =
      data &&
        typeof data === "object" &&
        "message" in data &&
        typeof data.message === "string"
        ? data.message
        : "Yêu cầu không thành công.";

    throw new Error(message);
  }

  return data as T;
}
