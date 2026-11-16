/**
 * Kiểm tra xem hai khoảng thời gian (dạng chuỗi ISO 'YYYY-MM-DD' hoặc Date) có bị trùng nhau hay không.
 * Hai khoảng [startA, endA] và [startB, endB] bị trùng nhau khi: startA <= endB && startB <= endA.
 */
export function isDateRangeOverlap(
  startA: string | Date,
  endA: string | Date,
  startB: string | Date,
  endB: string | Date,
): boolean {
  const sA = typeof startA === "string" ? startA.slice(0, 10) : startA.toISOString().slice(0, 10);
  const eA = typeof endA === "string" ? endA.slice(0, 10) : endA.toISOString().slice(0, 10);
  const sB = typeof startB === "string" ? startB.slice(0, 10) : startB.toISOString().slice(0, 10);
  const eB = typeof endB === "string" ? endB.slice(0, 10) : endB.toISOString().slice(0, 10);

  return sA <= eB && sB <= eA;
}

