export type TourListParams = {
    search?: string;
    status?: string;
};
export type PolicyContentsPayload = Record<string, string | null | undefined>;
export type TourAdminPayload = {
    code?: string;
    name?: string;
    summary?: string | null;
    description?: string;
    duration_days?: number | string;
    duration_nights?: number | string;
    base_price?: number | string;
    cut_off_hours?: number | string;
    tour_type?: string;
    departure_location?: number | string;
    transport_id?: number | string;
    status?: number | string | null;
    tour_amenities?: import('../../tours/amenities').TourAmenity[];
    policy_contents?: PolicyContentsPayload;
    destinations?: Array<number | string>;
    images?: string[];
};
