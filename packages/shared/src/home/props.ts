import type { FeaturedDestinationItem, FeaturedTourItem, SeasonalShowcase } from "./models";
export type DestinationCardProps = {
    item: FeaturedDestinationItem;
    index: number;
};
export type FeaturedTourCardProps = {
    item: FeaturedTourItem;
};
export type WhyChooseCardProps = {
    title: string;
    description: string;
    icon: string;
    rotate?: string;
};
export type SeasonalShowcaseProps = {
    showcase: SeasonalShowcase;
};
