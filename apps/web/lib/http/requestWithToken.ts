import { requestJson } from "@/lib/http/requestJson";

export function requestWithToken<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const { body, mode, ...rest } = init;
  return requestJson<T>(path, {
    authMode: "auth",
    mode,
    body,
    ...rest,
    fallbackMessage: "Yêu cầu không thành công.",
  });
}
