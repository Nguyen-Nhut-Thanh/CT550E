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

export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter';
export type SeasonMode = SeasonType | 'auto' | 'disabled';

export interface SeasonalThemeConfig {
    mode: SeasonMode;
    activeSeason: SeasonType;
    enableParticles: boolean;
    enableColors: boolean;
    particleDensity: 'light' | 'normal' | 'dense';
}
