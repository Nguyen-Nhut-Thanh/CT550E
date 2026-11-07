import { BadRequestException } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import type { ScheduleItineraryPayload } from "shared";
import { mapScheduleItinerary } from "./schedule.mapper";

function optionalServiceId(value: unknown) {
  if (value === undefined || value === null || value === '') return null;
  if ((typeof value !== 'number' && typeof value !== 'string') || (typeof value === 'string' && !/^[1-9]\d*$/.test(value)) || !Number.isSafeInteger(Number(value)) || Number(value) <= 0) throw new BadRequestException('ID dịch vụ trong ngày không hợp lệ.');
  return Number(value);
}

export function normalizeActivities(value: unknown, allowIncomplete = false) {
  if (!Array.isArray(value))
    throw new BadRequestException("Danh sách hoạt động không hợp lệ.");
  const normalized = value
    .map((item: Record<string, unknown>, index) => {
      if (!item || typeof item !== "object")
        throw new BadRequestException("Hoạt động không hợp lệ.");
      const time = typeof item.time === "string" ? item.time.trim() : "";
      const title = typeof item.title === "string" ? item.title.trim() : "";
      const description =
        typeof item.description === "string" ? item.description.trim() : "";
      const location_id =
        item.location_id == null ? null : Number(item.location_id);
      if (!(allowIncomplete && time === '') && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
        throw new BadRequestException("Giờ hoạt động phải có dạng HH:mm.");
      if ((!allowIncomplete && !title) || title.length > 255)
        throw new BadRequestException(
          "Tiêu đề hoạt động phải có từ 1 đến 255 ký tự."
        );
      if (
        location_id !== null &&
        (!Number.isSafeInteger(location_id) || location_id <= 0)
      )
        throw new BadRequestException("Điểm tham quan không hợp lệ.");
      return { time, title, description, location_id, sort_order: index + 1 };
    });
  return (allowIncomplete ? normalized : normalized.sort((a, b) => a.time.localeCompare(b.time) || a.sort_order - b.sort_order))
    .map((activity, index) => ({ ...activity, sort_order: index + 1 }));
}

export async function saveItineraryDays(
  tx: Prisma.TransactionClient,
  tourId: number,
  scheduleId: number,
  days: ScheduleItineraryPayload[],
  allowIncomplete = false,
) {
  const tour = await tx.tours.findUniqueOrThrow({
    where: { tour_id: tourId },
    select: {
      duration_days: true,
      tour_destinations: { select: { location_id: true } },
    },
  });
  const previous = await tx.tour_itineraries.findMany({
    where: { tour_schedule_id: scheduleId },
    include: { activities: { orderBy: { sort_order: "asc" } } },
  });
  const seen = new Set<number>();
  const normalized = days.map((day, index) => {
    const dayNumber = day.day_number ?? index + 1;
    if (
      !Number.isInteger(dayNumber) ||
      dayNumber < 1 ||
      dayNumber > tour.duration_days ||
      seen.has(dayNumber)
    )
      throw new BadRequestException(
        "Ngày lịch trình bị trùng hoặc nằm ngoài thời lượng tour."
      );
    seen.add(dayNumber);
    const oldDay = previous.find(item => item.day_number === dayNumber);
    const oldDraft = oldDay?.draft_data as unknown as ScheduleItineraryPayload | null;
    const source = day.activities === undefined && oldDraft ? { ...oldDraft, ...day } : day;
    const keepDraft = allowIncomplete || Boolean(oldDraft && day.activities === undefined);
    const hotelId = optionalServiceId(source.hotel_id);
    const roomTypeId = optionalServiceId(source.room_type_id);
    const transportId = optionalServiceId(source.transport_id);
    if (!keepDraft && Boolean(hotelId) !== Boolean(roomTypeId)) throw new BadRequestException('Vui lòng chọn đủ khách sạn và loại phòng cho ngày đã nhập.');
    const activities = normalizeActivities(
      source.activities === undefined
        ? oldDay?.activities ??
            []
        : source.activities,
      keepDraft,
    );
    return {
      ...mapScheduleItinerary(source, index),
      day_number: dayNumber,
      activities,
      draft_data: keepDraft ? {
        day_number: dayNumber, title: source.title || '', content: source.content || '', meals: source.meals || '',
        hotel_id: hotelId, room_type_id: roomTypeId, transport_id: transportId,
        activities: activities.map(({ time, title, description, location_id }) => ({ time, title, description, location_id })),
      } : undefined,
    };
  });
  for (const day of normalized) {
    const draft = day.draft_data;
    if (draft?.hotel_id && !await tx.hotels.count({ where: { hotel_id: draft.hotel_id } })) throw new BadRequestException('Khách sạn trong lịch trình không tồn tại.');
    if (draft?.room_type_id && !await tx.hotel_room_types.count({ where: { ...(draft.hotel_id ? { hotel_id: draft.hotel_id } : {}), room_type_id: draft.room_type_id } })) throw new BadRequestException('Loại phòng trong lịch trình không hợp lệ.');
  }
  const ids = [
    ...new Set(
      normalized.flatMap((day) =>
        day.activities.flatMap((item) =>
          item.location_id == null ? [] : [item.location_id]
        )
      )
    ),
  ];
  const locations = await tx.locations.findMany({
    where: { location_id: { in: ids } },
    select: { location_id: true, level_id: true, parent_id: true },
  });
  const provinces = new Set(
    tour.tour_destinations.map((item) => item.location_id)
  );
  if (
    locations.length !== ids.length ||
    locations.some(
      (item) =>
        item.level_id !== 6 ||
        item.parent_id == null ||
        !provinces.has(item.parent_id)
    )
  ) {
    throw new BadRequestException(
      "Chỉ được chọn điểm tham quan trực thuộc tỉnh/thành trong tuyến tour."
    );
  }
  await tx.tour_itineraries.deleteMany({
    where: { tour_schedule_id: scheduleId },
  });
  for (const { activities, ...day } of normalized) {
    await tx.tour_itineraries.create({
      data: {
        ...day,
        tour_schedule_id: scheduleId,
        activities: { create: activities.filter(activity => activity.time && activity.title).map((activity, index) => ({ ...activity, sort_order: index + 1 })) },
      },
    });
  }
}
