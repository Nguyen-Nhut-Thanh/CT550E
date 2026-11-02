export function parseTimeValue(value: string) {
  const matched = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  return matched ? { hour: Number(matched[1]), minute: Number(matched[2]) } : null;
}

export function formatTimeLabel(value: string) {
  const time = parseTimeValue(value);
  if (!time) return "";
  return `${String(time.hour % 12 || 12).padStart(2, "0")}:${String(time.minute).padStart(2, "0")} ${time.hour >= 12 ? "PM" : "AM"}`;
}

export function changeTimePart(value: string, part: "hour" | "minute" | "period", next: number) {
  const time = parseTimeValue(value) ?? { hour: 8, minute: 0 };
  if (!Number.isInteger(next) || (part === "hour" && (next < 1 || next > 12)) || (part === "minute" && (next < 0 || next > 59)) || (part === "period" && next !== 0 && next !== 1)) return value;
  const hour = part === "hour" ? next % 12 + (time.hour >= 12 ? 12 : 0) : part === "period" ? time.hour % 12 + next * 12 : time.hour;
  const minute = part === "minute" ? next : time.minute;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
