export type RecommendationEventPayload = {
    event_type: string;
    source?: string;
    tour_id?: number;
    destination?: string;
    metadata?: Record<string, unknown>;
};
