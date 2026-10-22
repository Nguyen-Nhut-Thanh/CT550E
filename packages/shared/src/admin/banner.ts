import type { CreateBannerInput } from '../banner';

export type AdminBannerPayload = Omit<Required<CreateBannerInput>, 'link_to'> & {
  link_to: string;
};
