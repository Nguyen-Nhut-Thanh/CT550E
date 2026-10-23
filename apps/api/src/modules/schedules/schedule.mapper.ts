import type { ScheduleItineraryPayload, SchedulePricePayload } from 'shared';
import { validatePrice } from "../../common/validation/payload";
export function mapSchedulePrice(price: SchedulePricePayload) {
    return {
        passenger_type: price.passenger_type,
        price: validatePrice(price.price),
        currency: price.currency || 'VND',
        note: price.note || null,
    };
}
export function mapScheduleItinerary(itinerary: ScheduleItineraryPayload, index: number) {
    return {
        day_number: itinerary.day_number || index + 1,
        title: itinerary.title || `Ngày ${index + 1}`,
        content: itinerary.content || itinerary.description || '',
        meals: itinerary.meals || null,
    };
}
export function mapScheduleHotel(itinerary: ScheduleItineraryPayload, index: number, scheduleId: number) {
    const hotelId = Number(itinerary.hotel_id || 0);
    const roomTypeId = Number(itinerary.room_type_id || 0);
    if (!hotelId || !roomTypeId) {
        return null;
    }
    const dayNumber = Number(itinerary.day_number || index + 1);
    return {
        tour_schedule_id: scheduleId,
        hotel_id: hotelId,
        room_type_id: roomTypeId,
        nights: Number(itinerary.nights || 1) || 1,
        day_from: dayNumber,
        day_to: dayNumber,
        note: itinerary.description || itinerary.content || null,
    };
}
export function mapScheduleResponse(schedule: {
    price?: unknown;
    tour_schedule_prices?: Array<{
        price?: unknown;
    } & Record<string, unknown>>;
} | null) {
    if (!schedule)
        return null;
    return {
        ...schedule,
        price: schedule.price ? Number(schedule.price) : 0,
        tour_schedule_prices: schedule.tour_schedule_prices?.map((price) => ({
            ...price,
            price: price.price ? Number(price.price) : 0,
        })) || [],
    };
}
