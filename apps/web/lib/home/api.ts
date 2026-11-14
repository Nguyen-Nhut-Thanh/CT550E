import type { Banner, SeasonalThemeConfig } from "shared";

import { API_BASE as API_BASE_URL } from "@/lib/http/config";

const DEFAULT_SEASONAL_THEME: SeasonalThemeConfig = {
  mode: "auto",
  activeSeason: "spring",
  enableParticles: true,
  enableColors: true,
  particleDensity: "normal",
};

export async function getPublicSeasonalTheme(): Promise<SeasonalThemeConfig> {
  try {
    const res = await fetch(`${API_BASE_URL}/banners/seasonal-theme`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 30 },
    });
    if (!res.ok) return DEFAULT_SEASONAL_THEME;
    return await res.json();
  } catch {
    return DEFAULT_SEASONAL_THEME;
  }
}

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

import type { FlashDealResponse, PublicHomeVouchersData } from "shared";

const DEFAULT_PUBLIC_HOME_VOUCHERS: PublicHomeVouchersData = {
  config: {
    enabled: true,
    title: "SĂN VOUCHER ƯU ĐÃI",
    subtitle: "Nhận ngay các mã giảm giá hấp dẫn dành riêng cho chuyến du lịch của bạn!",
    badge: "ƯU ĐÃI ĐẶC BIỆT",
    voucher_ids: [],
  },
  vouchers: [],
};

export async function getPublicHomeVouchers(): Promise<PublicHomeVouchersData> {
  try {
    const res = await fetch(`${API_BASE_URL}/public/vouchers/home-campaign`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 30 },
    });
    if (!res.ok) return DEFAULT_PUBLIC_HOME_VOUCHERS;
    return await res.json();
  } catch {
    return DEFAULT_PUBLIC_HOME_VOUCHERS;
  }
}

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
