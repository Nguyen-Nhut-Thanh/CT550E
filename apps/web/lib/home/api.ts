import type { Banner } from "shared";

import { API_BASE as API_BASE_URL } from "@/lib/http/config";

function normalizeBannerListResponse(data: unknown): Banner[] {
  if(Array.isArray(data)) {
    return data as Banner[];
  }

  if(
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

    if(!res.ok) {
      return [];
    }

    return normalizeBannerListResponse(await res.json());
  } catch {
    return [];
  }
}

import { publicFetch } from "@/lib/http/publicFetch";
import type { FeaturedDestinationsResponse } from "shared";

export async function getFeaturedDestinations(): Promise<FeaturedDestinationsResponse> {
  return publicFetch<FeaturedDestinationsResponse>(
    "/locations/featured-destinations",
    {
      cache: "no-store",
    },
  );
}

import type { FeaturedTourResponse } from "shared";

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

  if(!response.ok) {
    throw new Error(`Không thể tải tour bán chạy: ${response.status}`);
  }

  return response.json();
}

import type { FlashDealResponse } from "shared";

export async function getFlashDeals(limit = 8): Promise<FlashDealResponse> {
  const response = await fetch(
    `${API_BASE_URL}/public/flash-deals?limit=${limit}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if(!response.ok) {
    throw new Error(`Failed to fetch flash deals: ${response.status}`);
  }

  return response.json();
}
