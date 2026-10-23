import type { TourWithMapData } from "./map";
import type { PublicTourCard, PublicTourDetail, TourItinerary, TourSchedule, VideoItem } from "./models";
export type TourBookingCardProps = {
    tour: PublicTourDetail;
    selectedSchedule?: TourSchedule | null;
};
export type TourDepartureCalendarProps = {
    schedules: TourSchedule[];
    selectedScheduleId: number | null;
    onSelect: (scheduleId: number) => void;
    onReset: () => void;
};
export type TourDetailHeroProps = {
    tour: PublicTourDetail;
};
export type TourHighlightsListProps = {
    highlights?: string[];
};
export type TourItineraryTimelineProps = {
    itineraries?: TourItinerary[];
    durationDays?: number;
};
export type TourSmartMapProps = {
    tour?: TourWithMapData | null;
};
export type TourVideoHighlightsProps = {
    videos?: VideoItem[];
};
export type TourCardProps = {
    tour: PublicTourCard;
    onTourClick?: (tour: PublicTourCard) => void;
};
export type TourEmptyStateProps = {
    message?: string;
};
export type TourFilterSidebarProps = {
    keyword: string;
    setKeyword: (val: string) => void;
    destination: string;
    setDestination: (val: string) => void;
    dateFrom: string;
    setDateFrom: (val: string) => void;
    minPrice: string;
    setMinPrice: (val: string) => void;
    maxPrice: string;
    setMaxPrice: (val: string) => void;
    tourType: string;
    setTourType: (val: string) => void;
    duration: string;
    setDuration: (val: string) => void;
    onApplyFilters: () => void;
    totalResults: number;
};
export type TourSortControlProps = {
    totalResults: number;
    sortBy: string;
    setSortBy: (val: string) => void;
    showBestsellerOption?: boolean;
};
