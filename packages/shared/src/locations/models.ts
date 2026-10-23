
export type LocationDetailLite = {
    latitude?: number | string | null;
    longitude?: number | string | null;
};
export type LocationLite = {
    location_id?: number | null;
    name?: string | null;
    latitude?: number | string | null;
    longitude?: number | string | null;
    destinations_detail?: LocationDetailLite | null;
};
