export type LocationDetailForm = {
    name: string;
    slug: string;
    location_type: string;
    level_id: number;
    parent_id: string | number;
    country_code: string;
    note: string;
    image_url: string;
    is_featured: boolean;
    featured_order: number | null;
};
