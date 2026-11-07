import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { TourScheduleTemplate } from 'shared';
import { normalizeActivities } from './itinerary-activities';

function object(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BadRequestException('Dữ liệu mẫu lịch trình không hợp lệ.');
    return value as Record<string, unknown>;
}
function list(value: unknown, maximum: number) {
    if (!Array.isArray(value) || value.length > maximum) throw new BadRequestException('Danh sách trong mẫu lịch trình không hợp lệ.');
    return value;
}
function text(value: unknown, maximum: number, required = false) {
    const result = typeof value === 'string' ? value.trim() : '';
    if ((required && !result) || result.length > maximum) throw new BadRequestException('Thông tin trong mẫu bị thiếu hoặc vượt quá độ dài cho phép.');
    return result;
}
function id(value: unknown, optional = false): number | null {
    if (optional && (value === null || value === undefined || value === '')) return null;
    if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !/^[1-9]\d*$/.test(value)) || !Number.isSafeInteger(Number(value)) || Number(value) <= 0) throw new BadRequestException('ID dịch vụ hoặc địa điểm trong mẫu không hợp lệ.');
    return Number(value);
}

export async function normalizeScheduleTemplate(tx: Prisma.TransactionClient, tourId: number, value: unknown): Promise<TourScheduleTemplate> {
    const body = object(value);
    const allowIncomplete = body.allow_incomplete_itinerary === true;
    const reference_date = text(body.reference_date, 10);
    if (reference_date && (!/^\d{4}-\d{2}-\d{2}$/.test(reference_date) || Number.isNaN(Date.parse(`${reference_date}T00:00:00Z`)) || new Date(`${reference_date}T00:00:00Z`).toISOString().slice(0, 10) !== reference_date)) throw new BadRequestException('Ngày khởi hành tham chiếu của mẫu không hợp lệ.');
    const tour = await tx.tours.findUnique({ where: { tour_id: tourId }, select: { duration_days: true, tour_destinations: { select: { location_id: true } } } });
    if (!tour) throw new NotFoundException('Tour không tồn tại.');
    const departure_location_id = id(body.departure_location_id)!;
    if (!await tx.locations.count({ where: { location_id: departure_location_id } })) throw new BadRequestException('Nơi xuất phát trong mẫu không tồn tại.');
    const pickup_points = list(body.pickup_points, 50).map(value => {
        const point = object(value);
        const day_offset = point.day_offset;
        if (!Number.isInteger(day_offset) || Number(day_offset) < -1 || Number(day_offset) >= tour.duration_days) throw new BadRequestException('Ngày đón trong mẫu nằm ngoài hành trình.');
        const time = text(point.time, 5, true);
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new BadRequestException('Giờ đón trong mẫu phải có dạng HH:mm.');
        return { name: text(point.name, 150, true), address: text(point.address, 500, true), note: text(point.note, 1000), day_offset: Number(day_offset), time };
    });
    const attraction_ids = [...new Set(list(body.attraction_ids, 500).map(value => id(value)!))];
    const seen = new Set<number>();
    const itinerary = list(body.itinerary, tour.duration_days).map((value, index) => {
        const day = object(value);
        const number = day.day_number ?? index + 1;
        if (!Number.isInteger(number) || Number(number) < 1 || Number(number) > tour.duration_days || seen.has(Number(number))) throw new BadRequestException('Ngày trong lịch trình mẫu bị trùng hoặc vượt thời lượng tour.');
        seen.add(Number(number));
        const hotel_id = id(day.hotel_id, true);
        const room_type_id = id(day.room_type_id, true);
        if (!allowIncomplete && Boolean(hotel_id) !== Boolean(room_type_id)) throw new BadRequestException('Vui lòng chọn đủ khách sạn và loại phòng trong mẫu.');
        return {
            day_number: Number(number), title: text(day.title, 255) || (allowIncomplete ? '' : `Ngày ${number}`), content: text(day.content, 50000), meals: text(day.meals, 100),
            hotel_id, room_type_id, transport_id: id(day.transport_id, true),
            activities: normalizeActivities(day.activities ?? [], allowIncomplete).map(({ time, title, description, location_id }) => ({ time, title, description, location_id })),
        };
    }).sort((a, b) => a.day_number - b.day_number);
    const locationIds = [...new Set([...attraction_ids, ...itinerary.flatMap(day => day.activities.flatMap(item => item.location_id ? [item.location_id] : []))])];
    if (locationIds.length && await tx.locations.count({ where: { location_id: { in: locationIds }, level_id: 6, parent_id: { in: tour.tour_destinations.map(item => item.location_id) } } }) !== locationIds.length) throw new BadRequestException('Điểm tham quan trong mẫu phải thuộc tỉnh/thành của tour.');
    const transportIds = [...new Set(itinerary.flatMap(day => day.transport_id ? [day.transport_id] : []))];
    if (transportIds.length && await tx.transports.count({ where: { transport_id: { in: transportIds } } }) !== transportIds.length) throw new BadRequestException('Phương tiện trong mẫu không còn tồn tại.');
    for (const day of itinerary) {
        if (day.hotel_id && !await tx.hotels.count({ where: { hotel_id: day.hotel_id } })) throw new BadRequestException('Khách sạn trong mẫu không tồn tại.');
        if (day.room_type_id && !await tx.hotel_room_types.count({ where: { ...(day.hotel_id ? { hotel_id: day.hotel_id } : {}), room_type_id: day.room_type_id } })) throw new BadRequestException('Khách sạn hoặc loại phòng trong mẫu không hợp lệ.');
    }
    return { ...(reference_date ? { reference_date } : {}), departure_location_id, pickup_points, attraction_ids, itinerary };
}
