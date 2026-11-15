import { requestJson } from "@/lib/http/requestJson";

export function requestAdminJson<T>(
  path: string,
  init: RequestInit = {},
  fallbackMessage = "Yêu cầu không thành công.",
): Promise<T> {
  const { body, mode, ...rest } = init;
  return requestJson<T>(path, {
    authMode: "admin",
    mode,
    body,
    ...rest,
    fallbackMessage,
  });
}
