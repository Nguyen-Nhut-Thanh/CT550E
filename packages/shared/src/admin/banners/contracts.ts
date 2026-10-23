import type { Banner } from "../../banners/models";
export type BannerPayload = Partial<Pick<Banner, "location_name" | "header" | "description" | "image_url">> & {
    status?: number | string;
};
export type AdminBannerPayload = Omit<Banner, "banner_id" | "created_at" | "updated_at" | "link_to"> & {
    link_to: string;
};
