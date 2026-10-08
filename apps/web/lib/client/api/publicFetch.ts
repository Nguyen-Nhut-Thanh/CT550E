const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "") ||
  "http://localhost:4000";

export async function publicFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`Không thể tải dữ liệu: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
