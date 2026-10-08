import type { FeaturedTourResponse } from "shared";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export async function getFeaturedTours(
  limit = 8,
): Promise<FeaturedTourResponse> {
  const response = await fetch(
    `${API_BASE_URL}/public/featured-tours?limit=${limit}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Không thể tải tour bán chạy: ${response.status}`);
  }

  return response.json();
}
