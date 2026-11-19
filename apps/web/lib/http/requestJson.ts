import { getToken, removeToken } from "@/lib/auth/client/session";
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
  if (status === 401) {
    return "Vui lòng đăng nhập để tiếp tục.";
  }
  if (status === 403) {
    return "Bạn không có quyền thực hiện hành động này.";
  }
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      const trimmed = message.trim();
      if (trimmed.toLowerCase() === "unauthorized") {
        return "Vui lòng đăng nhập để tiếp tục.";
      }
      if (trimmed.toLowerCase().includes("forbidden")) {
        return "Bạn không có quyền thực hiện hành động này.";
      }
      return trimmed;
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
    if (response.status === 401 && (needsAuth || getToken())) {
      removeToken();
    }
    throw new Error(parseErrorMessage(data, response.status, fallbackMessage));
  }

  return data as T;
}
