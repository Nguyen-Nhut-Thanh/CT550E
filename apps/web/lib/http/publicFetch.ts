import { requestJson } from "@/lib/http/requestJson";

export function publicFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { mode, ...rest } = options;
  return requestJson<T>(path, {
    authMode: "public",
    mode,
    ...rest,
    fallbackMessage: "Không thể tải dữ liệu",
  });
}
