import type { ScheduleItineraryPayload } from './contracts';

export type TourScheduleTemplate = {
    reference_date?: string;
    departure_location_id: number;
    pickup_points: Array<{ name: string; address: string; day_offset: number; time: string; note: string }>;
    attraction_ids: number[];
    itinerary: ScheduleItineraryPayload[];
};
export type TourScheduleTemplateResponse = { template: TourScheduleTemplate | null; updated_at: string | null };
