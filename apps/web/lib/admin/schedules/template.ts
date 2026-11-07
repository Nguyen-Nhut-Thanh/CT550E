import type { ScheduleFormState, TourScheduleTemplate } from 'shared';
import { ensureItineraryDays, updateScheduleStart } from './forms';

export function setTemplatePickupDate(form: ScheduleFormState, index: number, value: string): ScheduleFormState {
  const [date, time] = value.split('T');
  const offset = value && form.start_date ? Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${form.start_date}T00:00:00Z`)) / 86400000) : undefined;
  return { ...form, pickup_points: form.pickup_points.map((point, i) => i === index ? { ...point, pickup_at: value, day_offset: offset, pickup_time: value ? time : undefined } : point) };
}

export function applyScheduleTemplate(form: ScheduleFormState, template: TourScheduleTemplate, durationDays: number): ScheduleFormState {
  const next: ScheduleFormState = {
    ...form,
    departure_location_id: template.departure_location_id,
    attraction_ids: [...template.attraction_ids],
    pickup_points: template.pickup_points.map(point => ({ name: point.name, address: point.address, note: point.note, pickup_at: '', day_offset: point.day_offset, pickup_time: point.time })),
    itinerary: ensureItineraryDays(template.itinerary.map((day, index) => ({
      day_number: day.day_number ?? index + 1, title: day.title || '', content: day.content || '', meals: day.meals || '',
      hotel_id: day.hotel_id || '', room_type_id: day.room_type_id || '', transport_id: day.transport_id || '',
      activities: (day.activities || []).map(item => ({ time: item.time, title: item.title, description: item.description, location_id: item.location_id ?? null })),
    })), durationDays),
  };
  return form.start_date ? updateScheduleStart(next, form.start_date, form.start_time, durationDays) : next;
}

export function buildScheduleTemplatePayload(form: ScheduleFormState): TourScheduleTemplate {
  return {
    ...(form.start_date ? { reference_date: form.start_date } : {}),
    departure_location_id: Number(form.departure_location_id),
    attraction_ids: [...form.attraction_ids],
    pickup_points: form.pickup_points.map(point => {
      if (form.start_date && !point.pickup_at) throw new Error('Vui lòng chọn ngày và giờ cho tất cả điểm đón mẫu.');
      const [date, time] = point.pickup_at.split('T');
      const day_offset = form.start_date && date ? Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${form.start_date}T00:00:00Z`)) / 86400000) : point.day_offset ?? 0;
      return { name: point.name, address: point.address, note: point.note, day_offset, time: time || point.pickup_time || '08:00' };
    }),
    itinerary: form.itinerary.map(day => ({
      day_number: day.day_number, title: day.title, content: day.content, meals: day.meals,
      hotel_id: day.hotel_id ? Number(day.hotel_id) : null, room_type_id: day.room_type_id ? Number(day.room_type_id) : null,
      transport_id: day.transport_id ? Number(day.transport_id) : null,
      activities: (day.activities || []).map(item => ({ time: item.time, title: item.title, description: item.description, location_id: item.location_id ?? null })),
    })),
  };
}
