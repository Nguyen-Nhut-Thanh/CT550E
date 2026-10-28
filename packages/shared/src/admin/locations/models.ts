import type { ListResponse } from "../../common/http";
import type { LocationUsageSummary } from "./contracts";
export type LocationLevel = {
    level_id: number;
    name: string;
};
export type LocationItem = {
    location_id: number;
    name: string;
    slug: string;
    level_id: number;
    parent_id?: number | null;
    note?: string | null;
    updated_at?: string | null;
    featured_image?: string | null;
    location_images?: AdminLocationImage[];
    is_featured?: boolean;
    geographic_levels?: {
        name?: string | null;
    } | null;
    locations?: {
        name?: string | null;
    } | null;
};
export type LocationListResponse = ListResponse<AdminLocationItem>;
export type AdminLocationFetcher = (path: string) => Promise<Response>;
export type LocationHierarchyState = {
    level3Id: string;
    level4Id: string;
    level5Id: string;
    level4List: AdminLocationItem[];
    level5List: AdminLocationItem[];
};
export type AdminLocationImage = {
    image_url?: string | null;
};
export type AdminLocationItem = {
    note?: string | null;
    location_id: number;
    name: string;
    parent_id?: number | null;
    level_id: number;
    country_code?: string | null;
    is_featured?: boolean | null;
    featured_order?: number | null;
    featured_image?: string | null;
    geographic_levels?: LocationLevel | null;
    location_images?: AdminLocationImage[] | null;
    usage_summary?: Omit<LocationUsageSummary, "location_images_count"> | null;
};
