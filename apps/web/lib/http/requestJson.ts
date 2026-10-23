import { getToken } from "@/lib/auth/session";
import { API_BASE } from "@/lib/http/config";
import type { AuthJsonRequestOptions as JsonInit } from 'shared';

function buildHeaders(
  headers: HeadersInit | undefined,
  requireAuth: boolean,
  hasJsonBody: boolean,
) {
  const nextHeaders = new Headers(headers);

  if(hasJsonBody && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  if(requireAuth) {
    nextHeaders.set("Authorization", `Bearer ${getToken() || ""}`);
  }

  return nextHeaders;
}

export async function requestJson<T>(path: string, init: JsonInit): Promise<T> {
  const { requireAuth = false, fallbackMessage, body, headers, ...rest } = init;
  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: buildHeaders(headers, requireAuth, body !== undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = (await response.json().catch(() => null)) as
    | { message?: string }
    | T
    | null;

  if(!response.ok) {
    throw new Error(
      data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : fallbackMessage,
    );
  }

  return data as T;
}
