import type { PublicTourCard } from "./models";
export type PublicToursFilters = {
    search: string;
    destination: string;
    departure_location: string;
    date_from: string;
    min_price: string;
    max_price: string;
};
export type PublicToursResponse = {
    items: PublicTourCard[];
    take: number;
    skip: number;
    total: number;
    filters: PublicToursFilters;
};
export type PublicToursQuery = {
    search?: string;
    destination?: string;
    departure_location?: string;
    date_from?: string;
    min_price?: string;
    max_price?: string;
    collection?: string;
    deal?: string;
    take?: number | string;
    skip?: number | string;
};
export type PublicListParams = Omit<PublicToursQuery, "take" | "skip"> & {
    take?: string;
    skip?: string;
};
