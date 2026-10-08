import type { BudgetOption, CalendarDay } from "shared";

export const BUDGET_OPTIONS: BudgetOption[] = [
  { label: "Chọn mức giá" },
  { label: "Dưới 5 triệu", maxPrice: "5000000" },
  { label: "Từ 5 - 10 triệu", minPrice: "5000000", maxPrice: "10000000" },
  { label: "Từ 10 - 20 triệu", minPrice: "10000000", maxPrice: "20000000" },
  { label: "Trên 20 triệu", minPrice: "20000000" },
] as const;

export const WEEKDAY_HEADERS = ["Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7", "CN"];

export const MONTH_LABELS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

export function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function fromDateValue(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isSameDate(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function formatSearchDate(date: Date) {
  const weekday = date.getDay() === 0 ? "CN" : `Th ${date.getDay() + 1}`;
  return `${weekday}, ${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
}

export function buildCalendarDays(monthDate: Date): CalendarDay[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: CalendarDay[] = [];

  for (let index = 0; index < firstDayOffset; index += 1) {
    days.push({ key: `empty-start-${index}`, date: null, dayNumber: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    days.push({ key: toDateValue(date), date, dayNumber: day });
  }

  while (days.length % 7 !== 0) {
    days.push({
      key: `empty-end-${days.length}`,
      date: null,
      dayNumber: null,
    });
  }

  return days;
}
