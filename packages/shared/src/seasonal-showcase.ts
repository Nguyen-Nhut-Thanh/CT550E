export type SeasonalShowcase = {
  showcase_id: number;
  slug: string;
  eyebrow: string;
  title: string;
  subtitle: string | null;
  description: string;
  image_urls: string[];
  link_to: string | null;
  status: number;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type CreateSeasonalShowcaseInput = {
  slug: string;
  eyebrow: string;
  title: string;
  subtitle?: string | null;
  description: string;
  image_urls: string[];
  link_to?: string | null;
  status?: number;
  display_order?: number;
};

export type UpdateSeasonalShowcaseInput =
  Partial<CreateSeasonalShowcaseInput>;
