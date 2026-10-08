export function normalizeImageSrc(src?: string | null): string | null {
  if (!src || !src.trim()) {
    return null;
  }

  const value = src.trim();

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return value.startsWith("/") ? value : `/${value}`;
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(date);
}

export function formatVND(value?: number | string | null): string {
  if (value == null || value === "") return "Liên hệ";
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return "Liên hệ";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND"
  }).format(numberValue).replace("₫", "đ");
}

export const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200";

export function getTodayString(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = `${today.getMonth() + 1}`.padStart(2, "0");
  const dd = `${today.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

