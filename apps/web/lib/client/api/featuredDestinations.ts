import type { FeaturedDestinationsResponse } from "shared";
import { publicFetch } from "./publicFetch";

export async function getFeaturedDestinations(): Promise<FeaturedDestinationsResponse> {
  return publicFetch<FeaturedDestinationsResponse>(
    "/locations/featured-destinations",
    {
      cache: "no-store",
    },
  );
}
