import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { ScheduleItineraryPayload } from 'shared';
import { mapScheduleItinerary } from './schedule.mapper';

export function normalizeActivities(value: unknown) {
    if (!Array.isArray(value)) throw new BadRequestException('Danh sách hoạt động không hợp lệ.');
    return value.map((item: Record<string, unknown>, index) => {
        if (!item || typeof item !== 'object') throw new BadRequestException('Hoạt động không hợp lệ.');
        const time = typeof item.time === 'string' ? item.time.trim() : '';
        const title = typeof item.title === 'string' ? item.title.trim() : '';
        const description = typeof item.description === 'string' ? item.description.trim() : '';
        const location_id = item.location_id == null ? null : Number(item.location_id);
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new BadRequestException('Giờ hoạt động phải có dạng HH:mm.');
        if (!title || title.length > 255) throw new BadRequestException('Tiêu đề hoạt động phải có từ 1 đến 255 ký tự.');
        if (location_id !== null && (!Number.isSafeInteger(location_id) || location_id <= 0)) throw new BadRequestException('Điểm tham quan không hợp lệ.');
        return { time, title, description, location_id, sort_order: index + 1 };
    }).sort((a, b) => a.time.localeCompare(b.time) || a.sort_order - b.sort_order)
        .map((activity, index) => ({ ...activity, sort_order: index + 1 }));
}

export async function saveItineraryDays(tx: Prisma.TransactionClient, tourId: number, scheduleId: number, days: ScheduleItineraryPayload[]) {
    const tour = await tx.tours.findUniqueOrThrow({ where: { tour_id: tourId }, select: { duration_days: true, tour_destinations: { select: { location_id: true } } } });
    const previous = await tx.tour_itineraries.findMany({ where: { tour_schedule_id: scheduleId }, include: { activities: { orderBy: { sort_order: 'asc' } } } });
    const seen = new Set<number>();
    const normalized = days.map((day, index) => {
        const dayNumber = day.day_number ?? index + 1;
        if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > tour.duration_days || seen.has(dayNumber)) throw new BadRequestException('Ngày lịch trình bị trùng hoặc nằm ngoài thời lượng tour.');
        seen.add(dayNumber);
        const activities = normalizeActivities(day.activities === undefined ? previous.find(item => item.day_number === dayNumber)?.activities ?? [] : day.activities);
        return { ...mapScheduleItinerary(day, index), day_number: dayNumber, activities };
    });
    const ids = [...new Set(normalized.flatMap(day => day.activities.flatMap(item => item.location_id == null ? [] : [item.location_id])))];
    const locations = await tx.locations.findMany({ where: { location_id: { in: ids } }, select: { location_id: true, level_id: true, parent_id: true } });
    const provinces = new Set(tour.tour_destinations.map(item => item.location_id));
    if (locations.length !== ids.length || locations.some(item => item.level_id !== 6 || item.parent_id == null || !provinces.has(item.parent_id))) {
        throw new BadRequestException('Chỉ được chọn điểm tham quan trực thuộc tỉnh/thành trong tuyến tour.');
    }
    await tx.tour_itineraries.deleteMany({ where: { tour_schedule_id: scheduleId } });
    for (const { activities, ...day } of normalized) {
        await tx.tour_itineraries.create({ data: { ...day, tour_schedule_id: scheduleId, activities: { create: activities } } });
    }
}
