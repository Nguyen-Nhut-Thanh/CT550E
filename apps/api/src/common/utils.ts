export { slugify } from "shared";

export function toNumber(value: unknown): number {
  if (value == null) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
