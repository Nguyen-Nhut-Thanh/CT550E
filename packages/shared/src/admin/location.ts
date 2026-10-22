import type * as ReactTypes from 'react';

export type LocationLevel = {
  level_id: number;
  name: string;
};

export type LocationItem = {
  location_id: number;
  name: string;
  slug: string;
  level_id: number;
  is_featured?: boolean;
  geographic_levels?: {
    name?: string | null;
  } | null;
  locations?: {
    name?: string | null;
  } | null;
};

export type LocationDetailsCardProps = {
  form: LocationDetailForm;
  isNew: boolean;
  level3Id: string;
  level3List: AdminLocationItem[];
  onFormChange: (
    updater: (prev: LocationDetailForm) => LocationDetailForm,
  ) => void;
};

export type LocationHierarchyCardProps = {
  form: LocationDetailForm;
  level3Id: string;
  level4Id: string;
  level5Id: string;
  level6Id: string;
  level3List: AdminLocationItem[];
  level4List: AdminLocationItem[];
  level5List: AdminLocationItem[];
  level6List: AdminLocationItem[];
  loadingL3: boolean;
  loadingL4: boolean;
  loadingL5: boolean;
  loadingL6: boolean;
  onLevel3Change: (value: string) => void;
  onLevel4Change: (value: string) => void;
  onLevel5Change: (value: string) => void;
  onLevel6Change: (value: string) => void;
};

export type LocationImageSidebarProps = {
  form: LocationDetailForm;
  uploading: boolean;
  saving: boolean;
  fileInputRef: ReactTypes.RefObject<HTMLInputElement | null>;
  onFormChange: (
    updater: (prev: LocationDetailForm) => LocationDetailForm,
  ) => void;
  onFileUpload: (event: ReactTypes.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSave: () => void;
};

export type LocationLevelSelectorProps = {
  form: LocationDetailForm;
  onLevelChange: (level: number) => void;
};

export type LocationListResponse = {
  items?: AdminLocationItem[];
};

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

export type AdminLocationFetcher = (path: string) => Promise<Response>;

export type LocationHierarchyState = {
  level3Id: string;
  level4Id: string;
  level5Id: string;
  level6Id: string;
  level4List: AdminLocationItem[];
  level5List: AdminLocationItem[];
  level6List: AdminLocationItem[];
};

export type AdminLocationImage = {
  image_url?: string | null;
};

export type AdminLocationItem = {
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
  usage_summary?: {
    child_locations_count: number;
    destination_tours_count: number;
    departure_tours_count: number;
    hotel_count: number;
    destination_detail_count: number;
    is_used_in_tours: boolean;
    has_children: boolean;
    has_dependencies: boolean;
    can_delete: boolean;
    can_change_structure: boolean;
  } | null;
};
