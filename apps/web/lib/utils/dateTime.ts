export function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatLocalTime(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatLocalDateTime(date: Date) {
  return `${formatLocalDate(date)}T${formatLocalTime(date)}`;
}

export function parseDateOnly(value?: string | null) {
  return value ? new Date(`${value}T00:00:00`) : new Date();
}

export function formatShortDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatDate(value?: string | Date | null) {
  if(!value) return "";
  const date = new Date(value);
  if(Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value?: string | Date | null, options?: { withSeconds?: boolean }) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...(options?.withSeconds ? { second: "2-digit" } : {}),
  }).format(date);
}

export function parseViDateTime(value?: string | null): Date | null {
  if (!value || typeof value !== "string") return null;
  const cleaned = value.trim();
  if (!cleaned) return null;

  // Hỗ trợ dạng: "03:35:47 14/11/2026", "14/11/2026, 03:35:47", "14/11/2026 03:35:47", "14/11/2026"
  const dmyMatch = cleaned.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  const timeMatch = cleaned.match(/(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/);

  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const hour = timeMatch ? parseInt(timeMatch[1], 10) : 0;
    const minute = timeMatch ? parseInt(timeMatch[2], 10) : 0;
    const second = timeMatch && timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;

    const parsed = new Date(year, month, day, hour, minute, second);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const fallback = new Date(cleaned);
  return !Number.isNaN(fallback.getTime()) ? fallback : null;
}
