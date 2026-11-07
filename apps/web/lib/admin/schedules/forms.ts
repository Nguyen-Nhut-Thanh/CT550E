import { formatLocalDate as formatDateString } from "@/lib/utils/dateTime";
import { parseCalendarDate } from "@/lib/utils/calendar";
import { getDayTransport, getSchedulePickupTimeError } from "shared";
import type { ItineraryFormItem, ScheduleEditorScheduleDetailResponse as ScheduleDetailResponse, ScheduleFormState, SchedulePriceItem } from 'shared';

export const DEFAULT_SCHEDULE_PRICES: SchedulePriceItem[] = [
  { passenger_type: "adult", price: 0, currency: "VND", note: "Giá người lớn" },
  { passenger_type: "child", price: 0, currency: "VND", note: "Giá trẻ em" },
  { passenger_type: "infant", price: 0, currency: "VND", note: "Giá em bé" },
];

export function createEmptyPickupPoint(form?: Pick<ScheduleFormState, "start_date" | "start_time">): ScheduleFormState["pickup_points"][number] {
  return { name: "", address: "", pickup_at: form?.start_date ? `${form.start_date}T${form.start_time || '08:00'}` : "", note: "" };
}

export function updateScheduleStart(form: ScheduleFormState, date: string, time: string, durationDays: number): ScheduleFormState {
  const start = parseCalendarDate(date);
  if (!start) return form;
  const end = new Date(start);
  end.setDate(end.getDate() + Math.max(0, (durationDays || 1) - 1));
  const previousStart = form.start_date ? `${form.start_date}T${form.start_time}` : "";
  const nextStart = `${date}T${time || '08:00'}`;
  return { ...form, start_date: date, start_time: time, end_date: formatDateString(end),
    pickup_points: form.pickup_points.map(point => {
      if (point.day_offset !== undefined && point.pickup_time) {
        const pickupDay = new Date(start);
        pickupDay.setDate(pickupDay.getDate() + point.day_offset);
        return { ...point, pickup_at: `${formatDateString(pickupDay)}T${point.pickup_time}` };
      }
      return !point.pickup_at || point.pickup_at === previousStart ? { ...point, pickup_at: nextStart } : point;
    }),
  };
}

export function updateScheduleBasePrice(form: ScheduleFormState, price: number): ScheduleFormState {
  return { ...form, price, prices: form.prices.map(item => item.passenger_type === "adult" ? { ...item, price } : item) };
}

export function createEmptyItineraryDay(dayNumber: number): ItineraryFormItem {
  return {
    day_number: dayNumber,
    title: "",
    content: "",
    meals: "",
    transport_id: "",
    hotel_id: "",
    room_type_id: "",
    activities: [],
  };
}

export function createDefaultScheduleForm(): ScheduleFormState {
  return {
    attraction_ids: [],
    use_tour_amenities: true,
    copy_tour_amenities: false,
    tour_schedule_amenities: [],
    departure_location_id: "",
    pickup_points: [createEmptyPickupPoint()],
    start_date: "",
    start_time: "08:00",
    end_date: "",
    end_time: "17:00",
    price: 0,
    quota: 20,
    status: 1,
    cover_image_url: "",
    note: "",
    prices: DEFAULT_SCHEDULE_PRICES.map((item) => ({ ...item })),
    itinerary: [],
  };
}

export function formatTimeValue(value?: string | Date | null) {
  if(!value) return "08:00";

  const date = new Date(value);
  if(Number.isNaN(date.getTime())) return "08:00";

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function pickupDateTimeInput(value: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(value)).replace(' ', 'T');
}

/** Chuyển giờ hiển thị của điểm đón sang Date cục bộ cho bộ chọn ngày–giờ. */
export function pickupInputToDate(value: string): Date | null {
  const matched = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!matched) return null;
  const date = parseCalendarDate(matched[1]);
  if (!date) return null;
  date.setHours(Number(matched[2]), Number(matched[3]), 0, 0);
  return date;
}

/** Giữ nguyên giờ trên bộ chọn; buildSchedulePayload áp dụng múi giờ +07:00 khi lưu. */
export function pickupDateToInput(value: Date | null) {
  if (!value || Number.isNaN(value.getTime())) return "";
  return `${formatDateString(value)}T${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
}

export function buildScheduleFormFromResponse(
  data: ScheduleDetailResponse,
): ScheduleFormState {
  const startDt = data.start_date ? new Date(data.start_date) : null;
  const endDt = data.end_date ? new Date(data.end_date) : null;
  const hotelByDay = new Map<number, { hotel_id: string | number; room_type_id: string | number }>();
  const draftDays = new Set((data.tour_itineraries || []).filter(item => item.draft_data).map((item, index) => item.day_number ?? index + 1));

  data.tour_schedule_hotels?.forEach((item, index) => {
    const dayNumber = Number(item.day_from ?? item.day_to ?? index + 1);
    if(!dayNumber || hotelByDay.has(dayNumber)) return;

    hotelByDay.set(dayNumber, {
      hotel_id: item.hotel_id ?? "",
      room_type_id: item.room_type_id ?? "",
    });
  });

  const itinerary = ensureItineraryDays((data.tour_itineraries || []).map(item => ({ ...item, ...(item.draft_data || {}) })).map((item, index) => ({
    day_number: item.day_number ?? index + 1,
    title: item.title ?? "", content: item.content ?? "", meals: item.meals ?? "", activities: item.activities ?? [],
    transport_id: item.transport_id ?? "",
    hotel_id: item.draft_data ? item.hotel_id ?? "" : item.hotel_id ?? hotelByDay.get(item.day_number ?? index + 1)?.hotel_id ?? "",
    room_type_id: item.draft_data ? item.room_type_id ?? "" : item.room_type_id ?? hotelByDay.get(item.day_number ?? index + 1)?.room_type_id ?? "",
  })), data.duration_days || 0);
  const durationDays = data.duration_days || Math.max(1, ...itinerary.map(day => day.day_number));

  return {
    use_tour_amenities: data.use_tour_amenities ?? true,
    attraction_ids: (data.tour_schedule_attractions || []).map(item => item.location_id),
    copy_tour_amenities: false,
    tour_schedule_amenities: (data.tour_schedule_amenities || []).map(item => ({ ...item })),
    departure_location_id: data.departure_location_id ?? "",
    pickup_points: (data.pickup_points || []).map(point => ({
      name: point.name, address: point.address, note: point.note || "",
      pickup_at: pickupDateTimeInput(point.pickup_at),
    })),
    start_date: startDt ? formatDateString(startDt) : "",
    start_time: startDt ? formatTimeValue(startDt) : "08:00",
    end_date: endDt ? formatDateString(endDt) : "",
    end_time: endDt ? formatTimeValue(endDt) : "17:00",
    price: data.price ?? 0,
    quota: data.quota ?? 20,
    status: data.status ?? 1,
    cover_image_url: data.cover_image_url ?? "",
    note: data.note ?? "",
    prices: data.tour_schedule_prices?.length
      ? data.tour_schedule_prices
      : DEFAULT_SCHEDULE_PRICES.map((item) => ({ ...item })),
    itinerary: itinerary.map(day => ({ ...day, transport_id: draftDays.has(day.day_number) ? day.transport_id : getDayTransport(data.tour_schedule_transports || [], day.day_number, durationDays)?.transport_id ?? day.transport_id })),
  };
}

export function ensureItineraryDays(
  itinerary: ItineraryFormItem[],
  durationDays: number,
) {
  if(!durationDays || durationDays < 1) {
    return itinerary;
  }

  const normalized = [...itinerary];
  const nextDays: ItineraryFormItem[] = [];

  for(let day = 1;day <= durationDays;day += 1) {
    const currentDay = normalized.find((item) => item.day_number === day);
    nextDays.push(currentDay || createEmptyItineraryDay(day));
  }

  return nextDays;
}

export function buildScheduleDateTime(date: string, time: string) {
  return `${date}T${time}:00+07:00`;
}

export function getSchedulePickupError(form: Pick<ScheduleFormState, "start_date" | "start_time" | "pickup_points">) {
  return getSchedulePickupTimeError(buildScheduleDateTime(form.start_date, form.start_time || '00:00'),
    form.pickup_points.map(point => ({ pickup_at: `${point.pickup_at}:00+07:00` })));
}

export function buildSchedulePayload(form: ScheduleFormState) {
  const { tour_schedule_amenities, copy_tour_amenities, ...base } = form;
  return {
    ...base,
    ...(form.use_tour_amenities ? { copy_tour_amenities } : { tour_schedule_amenities }),
    departure_location_id: Number(form.departure_location_id),
    pickup_points: form.pickup_points.map(point => ({ name: point.name, address: point.address, note: point.note, pickup_at: new Date(`${point.pickup_at}:00+07:00`).toISOString() })),
    start_date: buildScheduleDateTime(form.start_date, form.start_time),
    end_date: buildScheduleDateTime(form.end_date, form.end_time),
    itinerary: form.itinerary.map((item) => ({
      ...item,
      transport_id: item.transport_id ? Number(item.transport_id) : null,
      hotel_id: item.hotel_id ? Number(item.hotel_id) : null,
      room_type_id: item.room_type_id ? Number(item.room_type_id) : null,
    })),
  };
}
