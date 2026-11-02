import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

/** An omitted list preserves the saved selection; an empty list explicitly clears it. */
export async function saveScheduleAttractions(tx: Prisma.TransactionClient, tourId: number, scheduleId: number, value: unknown) {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.length > 500 || value.some(id => !Number.isSafeInteger(id) || id <= 0)) {
    throw new BadRequestException('Danh sách điểm tham quan không hợp lệ.');
  }
  const ids: number[] = [...new Set<number>(value)];
  if (ids.length) {
    const provinces = await tx.tour_destinations.findMany({ where: { tour_id: tourId }, select: { location_id: true } });
    const count = await tx.locations.count({ where: {
      location_id: { in: ids }, level_id: 6, parent_id: { in: provinces.map(item => item.location_id) },
    } });
    if (count !== ids.length) throw new BadRequestException('Điểm tham quan phải thuộc tỉnh/thành đã chọn trong tour.');
  }
  await tx.tour_schedule_attractions.deleteMany({ where: { tour_schedule_id: scheduleId } });
  if (ids.length) await tx.tour_schedule_attractions.createMany({ data: ids.map((location_id, sort_order) => ({ tour_schedule_id: scheduleId, location_id, sort_order })) });
}
