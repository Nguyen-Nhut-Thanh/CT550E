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
    tour_type?: string;
    departure_location?: number | string;
    transport_id?: number | string;
    status?: number | string | null;
    sightseeing_summary?: string | null;
    cuisine_info?: string | null;
    best_for?: string | null;
    best_time?: string | null;
    transport_info?: string | null;
    promotion_info?: string | null;
    policy_contents?: PolicyContentsPayload;
    destinations?: Array<number | string>;
    images?: string[];
};
