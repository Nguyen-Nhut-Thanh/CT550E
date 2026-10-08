import type { PublicToursQuery, PublicToursResponse, PublicTourDetail } from "shared";
import { publicFetch } from "./publicFetch";

export async function getPublicTours(
  query: PublicToursQuery = {},
): Promise<PublicToursResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  const path = queryString ? `/tours/public?${queryString}` : "/tours/public";

  return publicFetch<PublicToursResponse>(path, {
    cache: "no-store",
  });
}

export async function getPublicTourDetail(
  tourId: string | number,
): Promise<PublicTourDetail> {
  return publicFetch<PublicTourDetail>(`/tours/public/${tourId}`, {
    cache: "no-store",
  });
}
