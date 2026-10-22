export type FeaturedDestinationItem = {
  location_id: number;
  name: string;
  slug: string;
  image_url: string | null;
  alt_text: string;
  total_tours: number;
};

export type FeaturedDestinationGroup = {
  key: string;
  label: string;
  items: FeaturedDestinationItem[];
};

export type FeaturedDestinationsResponse = {
  regions: FeaturedDestinationGroup[];
};

export type LocationUsageSummary = {
  child_locations_count: number;
  destination_tours_count: number;
  departure_tours_count: number;
  hotel_count: number;
  destination_detail_count: number;
  location_images_count: number;
  is_used_in_tours: boolean;
  has_children: boolean;
  has_dependencies: boolean;
  can_delete: boolean;
  can_change_structure: boolean;
};

export type LocationListParams = {
  search?: string;
  level_id?: string;
};

export type LocationAdminPayload = {
  name?: string;
  slug?: string;
  location_type?: string;
  level_id?: number | string;
  parent_id?: number | string | null;
  country_code?: string | null;
  note?: string | null;
  image_url?: string | null;
  is_featured?: boolean;
  featured_order?: number | string | null;
  featured_image?: string | null;
};

export type RegionConfig = {
  key: string;
  label: string;
  parentNames: string[];
};

export type DestinationCardProps = {
  item: FeaturedDestinationItem;
  index: number;
};

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
