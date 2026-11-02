/** Tạo ngày cục bộ, bao gồm các năm từ 0 đến 99 mà không bị đổi thành 1900. */
export function localDate(year: number, month: number, day: number) {
  const date = new Date(0);
  date.setFullYear(year, month, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isValidDate(value?: Date | null): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

export function minuteBounds(minDate?: Date, maxDate?: Date) {
  return {
    minimum: isValidDate(minDate)
      ? Math.ceil(minDate.getTime() / 60_000) * 60_000
      : -Infinity,
    maximum: isValidDate(maxDate)
      ? Math.floor(maxDate.getTime() / 60_000) * 60_000
      : Infinity,
  };
}

export function clampDateTime(date: Date, minimum: number, maximum: number) {
  const minutes = Math.floor(date.getTime() / 60_000) * 60_000;
  return new Date(Math.min(maximum, Math.max(minimum, minutes)));
}

export function isDayAvailable(date: Date, minimum: number, maximum: number) {
  const nextDay = localDate(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return minimum <= maximum && date.getTime() <= maximum && nextDay.getTime() - 1 >= minimum;
}

/** Chỉ hiển thị số tuần cần cho tháng, điền ngày liền kề đến hết hàng cuối. */
export function buildDateTimeDays(month: Date) {
  const firstDay = localDate(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = localDate(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const dayCount = Math.ceil((firstDay.getDay() + daysInMonth) / 7) * 7;
  return Array.from({ length: dayCount }, (_, index) =>
    localDate(month.getFullYear(), month.getMonth(), index - firstDay.getDay() + 1),
  );
}

/** Tìm giờ hợp lệ trong một khung giờ; giữ phút hiện tại nếu có thể. */
export function timeInHour(date: Date, hour: number, minimum: number, maximum: number) {
  const start = new Date(date);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start);
  end.setMinutes(59);
  if (start.getTime() > maximum || end.getTime() < minimum) return null;
  const candidate = new Date(start);
  candidate.setMinutes(date.getMinutes());
  return clampDateTime(candidate, minimum, maximum);
}
