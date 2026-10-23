export type RankedTourCandidate = {
    tourId: number;
    nextScheduleId: number;
    nextStartDate: Date;
    nextPrice: number;
    bookingCount: number;
    passengerCount: number;
    bestsellerScore: number;
};
export type FlashDealTourRecord = {
    tour_id: number;
    code: string;
    name: string;
    duration_days: number;
    duration_nights: number;
    promotion_info: string | null;
    departure_locations?: {
        name: string | null;
    } | null;
    transports?: {
        name: string | null;
    } | null;
    tour_images: Array<{
        image_url: string | null;
    }>;
};
