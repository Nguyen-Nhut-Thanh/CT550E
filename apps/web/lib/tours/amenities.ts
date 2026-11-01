import type { TourAmenity, TourSchedule } from 'shared';

/** Resolve details against only the schedule currently displayed on the tour page. */
export function getTourAmenities(saved: TourAmenity[], schedule?: TourSchedule | null): TourAmenity[] {
  const source = schedule ? schedule.tour_schedule_amenities || [] : saved;
  const hidden = new Set(source.filter(item => 'is_visible' in item && item.is_visible === false).map(item => item.kind));
  const items: TourAmenity[] = source.filter(item => !hidden.has(item.kind)).map(item => ({ ...item }));
  const hotels = schedule?.tour_schedule_hotels || [];
  const transports = schedule?.tour_schedule_transports || [];
  const addDetails = (kind: 'hotel' | 'transport', title: string, details: string) => {
    if (hidden.has(kind)) return;
    const existing = items.find(item => item.kind === kind);
    if (existing) {
      existing.content = [existing.content.trim(), details].filter(Boolean).join('\n\n');
      if (kind === 'hotel' && hotels.length) existing.title = title;
    } else if (details) {
      items.push({ kind, title, content: details, sort_order: kind === 'hotel' ? 1 : 0 });
    }
  };
  const stars = [...new Set(hotels.map(item => item.hotels?.star_rating).filter((value): value is number => !!value))].sort((a, b) => a - b);
  addDetails('hotel', stars.length ? `Khách sạn ${stars.join('–')} sao` : 'Khách sạn', hotels.map(item => [
    `${item.hotels?.name || 'Khách sạn'}${item.hotels?.star_rating ? ` · ${item.hotels.star_rating} sao` : ''}`,
    item.hotels?.address,
    item.hotel_room_types?.name ? `Loại phòng: ${item.hotel_room_types.name}` : '',
    `Lưu trú: ${item.nights} đêm${item.day_from ? ` · Từ ngày ${item.day_from}${item.day_to ? ` đến ngày ${item.day_to}` : ''}` : ''}`,
    item.hotels?.description,
    item.note,
  ].filter(Boolean).join('\n')).join('\n\n'));
  addDetails('transport', 'Phương tiện di chuyển', transports.map(item => [
    item.transports.name,
    item.transports.description,
    item.day_from ? `Từ ngày ${item.day_from}${item.day_to ? ` đến ngày ${item.day_to}` : ''}` : '',
    item.note,
  ].filter(Boolean).join('\n')).join('\n\n'));
  return items.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}
