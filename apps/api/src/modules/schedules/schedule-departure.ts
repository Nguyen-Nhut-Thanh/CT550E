import { BadRequestException } from "@nestjs/common";
import type { SchedulePickupPointPayload } from "shared";

export function normalizePickupPoints(value: unknown) {
  if (!Array.isArray(value) || value.length > 50) {
    throw new BadRequestException(
      "Danh sách điểm đón không hợp lệ (tối đa 50 điểm).",
    );
  }
  return value.map((item: SchedulePickupPointPayload, index: number) => {
    if (
      !item ||
      typeof item.name !== "string" ||
      !item.name.trim() ||
      item.name.trim().length > 150 ||
      typeof item.address !== "string" ||
      !item.address.trim() ||
      item.address.trim().length > 500 ||
      typeof item.pickup_at !== "string" ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(
        item.pickup_at,
      ) ||
      Number.isNaN(Date.parse(item.pickup_at)) ||
      (item.note != null &&
        (typeof item.note !== "string" || item.note.trim().length > 1000))
    ) {
      throw new BadRequestException(
        `Điểm đón ${index + 1}: cần tên, địa chỉ và thời gian đón hợp lệ.`,
      );
    }
    return {
      name: item.name.trim(),
      address: item.address.trim(),
      pickup_at: new Date(item.pickup_at),
      sort_order: index,
      note: item.note?.trim() || null,
    };
  });
}

export function departureId(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
    throw new BadRequestException("Vui lòng chọn nơi xuất phát hợp lệ.");
  }
  return value;
}

export function pickupPointsEqual(
  left: ReturnType<typeof normalizePickupPoints>,
  right: ReturnType<typeof normalizePickupPoints>,
) {
  return (
    left.length === right.length &&
    left.every((point, index) => {
      const other = right[index];
      return (
        point.name === other.name &&
        point.address === other.address &&
        point.pickup_at.getTime() === other.pickup_at.getTime() &&
        (point.note || null) === (other.note || null)
      );
    })
  );
}
