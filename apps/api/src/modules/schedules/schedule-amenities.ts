import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { ScheduleAdminPayload } from 'shared';
import { normalizeAmenities } from '../tours/tour-amenities';

export async function saveScheduleAmenities(tx: Prisma.TransactionClient, scheduleId: number, body: ScheduleAdminPayload, creating = false) {
    if (!creating && body.use_tour_amenities === undefined && body.copy_tour_amenities === undefined && body.tour_schedule_amenities === undefined) return;
    for (const field of ['use_tour_amenities', 'copy_tour_amenities'] as const) {
        if (body[field] !== undefined && typeof body[field] !== 'boolean') throw new BadRequestException('Lựa chọn nguồn tiện ích không hợp lệ.');
    }
    const current = await tx.tour_schedules.findUniqueOrThrow({
        where: { tour_schedule_id: scheduleId },
        include: { tour_schedule_amenities: { orderBy: { sort_order: 'asc' } }, _count: { select: { bookings: true } } },
    });
    const useTemplate = body.use_tour_amenities ?? current.use_tour_amenities;
    if (!useTemplate && body.copy_tour_amenities) throw new BadRequestException('Chọn sử dụng tiện ích tour trước khi sao chép lại mẫu.');
    if (useTemplate && body.tour_schedule_amenities !== undefined) throw new BadRequestException('Bỏ chọn sử dụng tiện ích tour để chỉnh sửa bản riêng.');

    const shouldCopy = (creating && useTemplate) || (useTemplate && (!current.use_tour_amenities || body.copy_tour_amenities === true)) || (creating && body.tour_schedule_amenities === undefined);
    const template = shouldCopy || creating ? await tx.tour_amenities.findMany({ where: { tour_id: current.tour_id }, orderBy: { sort_order: 'asc' } }) : [];
    const rows = shouldCopy
        ? template.map((item, sort_order) => ({ kind: item.kind, title: item.title, content: item.content, sort_order, is_visible: true, source_amenity_id: item.amenity_id }))
        : body.tour_schedule_amenities !== undefined
            ? normalizeAmenities(body.tour_schedule_amenities, true).map(item => ({ ...item, is_visible: item.is_visible ?? true,
                source_amenity_id: current.tour_schedule_amenities.find(old => old.kind === item.kind)?.source_amenity_id ?? (creating ? template.find(source => source.kind === item.kind)?.amenity_id : null) ?? null,
            }))
            : current.tour_schedule_amenities;
    const comparable = (items: typeof rows) => JSON.stringify(items.map(({ kind, title, content, is_visible }) => ({ kind, title: title.trim(), content: content.trim(), is_visible })));
    const changed = comparable(rows) !== comparable(current.tour_schedule_amenities);
    if (current._count.bookings > 0 && (changed || useTemplate !== current.use_tour_amenities)) {
        throw new BadRequestException('Chuyến đã có đơn đặt: không thể thay đổi tiện ích đã xác nhận.');
    }
    if (changed || (shouldCopy && current._count.bookings === 0)) {
        await tx.tour_schedule_amenities.deleteMany({ where: { tour_schedule_id: scheduleId } });
        if (rows.length) await tx.tour_schedule_amenities.createMany({ data: rows.map(item => ({
            tour_schedule_id: scheduleId, source_amenity_id: item.source_amenity_id,
            kind: item.kind, title: item.title, content: item.content, sort_order: item.sort_order, is_visible: item.is_visible,
        })) });
    }
    if (useTemplate !== current.use_tour_amenities) await tx.tour_schedules.update({ where: { tour_schedule_id: scheduleId }, data: { use_tour_amenities: useTemplate } });
}
