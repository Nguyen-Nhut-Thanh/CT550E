import { BadRequestException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { AdminBookingFilters } from "shared";

function positiveId(value: string | undefined) {
    if (!value || value === 'all') return undefined;
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) < 1) throw new BadRequestException('Mã tour hoặc lịch khởi hành không hợp lệ.');
    return Number(value);
}
function dayBoundary(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new BadRequestException('Ngày lọc không hợp lệ.');
    const day = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== value) throw new BadRequestException('Ngày lọc không hợp lệ.');
    return new Date(day.getTime() - 7 * 60 * 60 * 1000);
}
export function buildBookingListWhere(filters: AdminBookingFilters = {}): Prisma.bookingsWhereInput {
    const where: Prisma.bookingsWhereInput = {};
    const search = filters.search?.trim();
    if (search) {
        const text = { contains: search, mode: 'insensitive' as const };
        where.OR = [{ contact_name: text }, { contact_phone: text }, { contact_email: text }, { users: { full_name: text } }, { tour_schedules: { tours: { OR: [{ code: text }, { name: text }] } } }];
        const bookingId = search.replace(/^#?(?:BK)?0*/i, '');
        if (/^\d+$/.test(bookingId) && Number.isSafeInteger(Number(bookingId)) && Number(bookingId) <= 2147483647) where.OR.push({ booking_id: Number(bookingId) });
    }
    if (filters.status && filters.status !== 'all') {
        if (!['pending', 'paid', 'confirmed', 'cancel_requested', 'cancelled', 'completed'].includes(filters.status)) throw new BadRequestException('Trạng thái booking không hợp lệ.');
        where.status = filters.status;
    }
    const tourId = positiveId(filters.tourId);
    const scheduleId = positiveId(filters.scheduleId);
    const schedule: Prisma.tour_schedulesWhereInput = {};
    if (tourId) schedule.tour_id = tourId;
    if (scheduleId) where.tour_schedule_id = scheduleId;
    const from = filters.dateFrom ? dayBoundary(filters.dateFrom) : undefined;
    const to = filters.dateTo ? dayBoundary(filters.dateTo) : undefined;
    if (from && to && from > to) throw new BadRequestException('Ngày kết thúc phải từ ngày bắt đầu trở đi.');
    if (filters.dateField && !['created', 'departure'].includes(filters.dateField)) throw new BadRequestException('Loại ngày lọc không hợp lệ.');
    if (from || to) {
        const date = { ...(from ? { gte: from } : {}), ...(to ? { lt: new Date(to.getTime() + 86400000) } : {}) };
        if (filters.dateField === 'departure') schedule.start_date = date;
        else where.created_at = date;
    }
    if (Object.keys(schedule).length) where.tour_schedules = schedule;
    return where;
}
