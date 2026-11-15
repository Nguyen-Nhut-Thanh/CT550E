import { getToken } from "@/lib/auth/session";
import { API_BASE } from "@/lib/http/config";

export type RequestAuthMode = "public" | "auth" | "admin";

export interface RequestJsonOptions extends Omit<RequestInit, "body" | "mode"> {
  authMode?: RequestAuthMode;
  mode?: RequestMode;
  requireAuth?: boolean;
  body?: unknown;
  fallbackMessage?: string;
}

function parseErrorMessage(
  data: unknown,
  status: number,
  fallback = "Yêu cầu không thành công",
): string {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
    if (Array.isArray(message) && message.length > 0) {
      return message.filter(Boolean).map(String).join(", ");
    }
  }
  return `${fallback} (${status})`;
}

export async function requestJson<T>(
  path: string,
  options: RequestJsonOptions = {},
): Promise<T> {
  const {
    authMode = options.requireAuth ? "auth" : "public",
    requireAuth = false,
    body,
    headers,
    fallbackMessage = "Yêu cầu không thành công.",
    mode,
    ...rest
  } = options;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}${normalizedPath}`;

  const requestHeaders = new Headers(headers);
  const hasJsonBody = body !== undefined;

  if (hasJsonBody && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const needsAuth = authMode === "auth" || authMode === "admin" || requireAuth;
  if (needsAuth && !requestHeaders.has("Authorization")) {
    const token = getToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  const fetchInit: RequestInit = {
    ...rest,
    mode,
    headers: requestHeaders,
    body:
      hasJsonBody
        ? typeof body === "string"
          ? body
          : JSON.stringify(body)
        : undefined,
  };

  if (authMode === "admin" && fetchInit.cache === undefined) {
    fetchInit.cache = "no-store";
  }

  const response = await fetch(url, fetchInit);

  const data = (await response.json().catch(() => null)) as
    | { message?: string | string[] }
    | T
    | null;

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, response.status, fallbackMessage));
  }

  return data as T;
}
