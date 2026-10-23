import type { LocationLite } from "../locations/models";
import type { PublicTourDetail } from "./models";
export type TourDestinationLite = {
    visit_order?: number | null;
    note?: string | null;
    name?: string | null;
    location_id?: number | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
    locations?: LocationLite | null;
};
export type TourWithMapData = PublicTourDetail & {
    departure_locations?: LocationLite | null;
    tour_destinations?: TourDestinationLite[] | null;
};
export type RouteStop = {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    note?: string | null;
    isDeparture?: boolean;
};
