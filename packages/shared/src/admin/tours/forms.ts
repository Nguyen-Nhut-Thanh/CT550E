import type { TourPolicy } from "../../tours/models";
import type { TourPolicyContentMap } from "../../tours/policies";
import type { TourScheduleSummary } from "./models";
export type TourDetailForm = {
    name?: string;
    code?: string;
    summary?: string | null;
    description?: string | null;
    tour_type?: string;
    departure_location?: number;
    transport_id?: number;
    destinations?: number[];
    images?: string[] | string;
    duration_days?: number;
    duration_nights?: number;
    tour_amenities?: import('../../tours/amenities').TourAmenity[];
    policy_contents?: TourPolicyContentMap;
    cut_off_hours?: number;
    base_price?: number | string;
    tour_schedules?: TourScheduleSummary[];
    tour_destinations?: {
        location_id: number;
    }[];
    tour_images?: {
        image_url: string;
    }[];
    tour_policies?: TourPolicy[];
};
