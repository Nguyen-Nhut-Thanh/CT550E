export type Banner = {
  banner_id: number;
  location_name: string;
  header: string;
  description: string;
  image_url: string;
  link_to: string | null;
  status: number;
  created_at: string;
  updated_at: string;
};

export type CreateBannerInput = {
  location_name: string;
  header: string;
  description: string;
  image_url: string;
  link_to?: string | null;
  status?: number;
};

export type UpdateBannerInput = Partial<CreateBannerInput>;

export type BannerPayload = {
  location_name?: string;
  header?: string;
  description?: string;
  image_url?: string;
  status?: number | string;
};
