import type { Banner } from "shared";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  "http://localhost:4000";

function normalizeBannerListResponse(data: unknown): Banner[] {
  if (Array.isArray(data)) {
    return data as Banner[];
  }

  if (
    typeof data === "object" &&
    data !== null &&
    "data" in data &&
    Array.isArray((data as { data?: unknown }).data)
  ) {
    return (data as { data: Banner[] }).data;
  }

  return [];
}

export async function getPublicBanners(): Promise<Banner[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/banners/public`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return [];
    }

    return normalizeBannerListResponse(await res.json());
  } catch {
    return [];
  }
}
