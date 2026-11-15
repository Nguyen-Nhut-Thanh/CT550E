import { BadRequestException } from '@nestjs/common';
export function requireFields(body: Record<string, unknown>, fields: string[]) {
    for (const field of fields) {
        const value = body[field];
        if (value === undefined || value === null || value === '') {
            throw new BadRequestException(`Missing ${field}`);
        }
    }
}
export function validatePrice(price: unknown) {
    const numericPrice = Number(price || 0);
    if (numericPrice < 0)
        return 0;
    if (numericPrice > 999999999)
        return 999999999;
    return numericPrice;
}

export function parsePositiveId(
  value: unknown,
  fieldName = "ID",
  optional = false,
): number | null {
  if (optional && (value === null || value === undefined || value === ""))
    return null;
  if (
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && !/^[1-9]\d*$/.test(value)) ||
    !Number.isSafeInteger(Number(value)) ||
    Number(value) <= 0
  ) {
    throw new BadRequestException(`${fieldName} không hợp lệ.`);
  }
  return Number(value);
}

export function parseTrimmedText(
  value: unknown,
  maxLength: number,
  fieldName = "Thông tin",
  required = false,
): string {
  const result = typeof value === "string" ? value.trim() : "";
  if ((required && !result) || result.length > maxLength) {
    throw new BadRequestException(
      `${fieldName} bị thiếu hoặc vượt quá ${maxLength} ký tự.`,
    );
  }
  return result;
}

export function parseIsoDate(value: unknown, fieldName = "Ngày"): string {
  const dateStr = typeof value === "string" ? value.trim() : "";
  if (
    !dateStr ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateStr) ||
    Number.isNaN(Date.parse(`${dateStr}T00:00:00Z`)) ||
    new Date(`${dateStr}T00:00:00Z`).toISOString().slice(0, 10) !== dateStr
  ) {
    throw new BadRequestException(`${fieldName} không hợp lệ.`);
  }
  return dateStr;
}

export function parsePayloadObject(
  value: unknown,
  message = "Dữ liệu không hợp lệ.",
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new BadRequestException(message);
  }
  return value as Record<string, unknown>;
}

export function parsePayloadList(
  value: unknown,
  maximum: number,
  message = "Danh sách không hợp lệ.",
): unknown[] {
  if (!Array.isArray(value) || value.length > maximum) {
    throw new BadRequestException(message);
  }
  return value;
}
