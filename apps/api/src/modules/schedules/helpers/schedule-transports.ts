import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { getDayTransport, type ScheduleItineraryPayload } from 'shared';

/** Undefined keeps an existing choice; null or an empty string explicitly removes it. */
export async function saveDayTransports(tx: Prisma.TransactionClient, tourId: number, scheduleId: number, days: ScheduleItineraryPayload[]) {
    if (days.length && days.every(day => day.transport_id === undefined)) return;
    const tour = await tx.tours.findUniqueOrThrow({ where: { tour_id: tourId }, select: { duration_days: true } });
    const changes = days.flatMap((day, index) => {
        if (day.transport_id === undefined) return [];
        const dayNumber = day.day_number ?? index + 1;
        if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > tour.duration_days) {
            throw new BadRequestException('Ngày sử dụng phương tiện nằm ngoài thời lượng tour.');
        }
        const empty = day.transport_id === null || day.transport_id === '';
        const transportId = empty ? null : Number(day.transport_id);
        if (!empty && ((typeof day.transport_id !== 'number' && typeof day.transport_id !== 'string') || (typeof day.transport_id === 'string' && !/^[1-9]\d*$/.test(day.transport_id)) || !Number.isSafeInteger(transportId) || transportId! <= 0)) {
            throw new BadRequestException(`Phương tiện ngày ${dayNumber} không hợp lệ.`);
        }
        return [{ dayNumber, transportId }];
    });
    const ids = [...new Set(changes.flatMap(item => item.transportId === null ? [] : [item.transportId]))];
    if (ids.length && await tx.transports.count({ where: { transport_id: { in: ids } } }) !== ids.length) {
        throw new BadRequestException('Phương tiện đã chọn không tồn tại.');
    }
    const where = { tour_schedule_id: scheduleId, transport_role: 'main' };
    const current = await tx.tour_schedule_transports.findMany({ where });
    const rows = new Map<number, { transport_id: number; day_from: number; day_to: number; note: string | null }>();
    for (let day = 1; day <= tour.duration_days; day++) {
        const saved = getDayTransport(current, day, tour.duration_days);
        if (saved) rows.set(day, { transport_id: saved.transport_id, day_from: day, day_to: day, note: saved.note });
    }
    let changed = days.length === 0;
    if (!days.length) rows.clear();
    for (const { dayNumber, transportId } of changes) {
        const previous = rows.get(dayNumber);
        if ((previous?.transport_id ?? null) === transportId) continue;
        changed = true;
        if (transportId === null) rows.delete(dayNumber);
        else rows.set(dayNumber, { transport_id: transportId, day_from: dayNumber, day_to: dayNumber, note: null });
    }
    if (!changed) return;
    await tx.tour_schedule_transports.deleteMany({ where });
    if (rows.size) await tx.tour_schedule_transports.createMany({
        data: [...rows.values()].map(row => ({ ...row, tour_schedule_id: scheduleId, transport_role: 'main' })),
    });
}
