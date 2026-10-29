"use client";

import {
  buildCalendarDays,
  isSameDate,
  MONTH_LABELS,
  startOfDay,
  WEEKDAY_HEADERS,
} from "@/lib/utils/calendar";
import { formatShortDate } from "@/lib/utils/dateTime";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Hiển thị lịch theo tháng để chọn ngày, hỗ trợ giới hạn ngày sớm nhất. */
export function Calendar({
  month,
  selectedDate,
  minDate,
  onMonthChange,
  onSelect,
}: {
  month: Date;
  selectedDate?: Date | null;
  minDate?: Date | null;
  onMonthChange: (month: Date) => void;
  onSelect: (date: Date) => void;
}) {
  const minimum = minDate ? startOfDay(minDate) : null;
  const changeMonth = (offset: number) =>
    onMonthChange(new Date(month.getFullYear(), month.getMonth() + offset, 1));

  return (
    <div aria-label="Lịch chọn ngày">
      <div className="mb-3 flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="Tháng trước"
          className="rounded-full p-1.5 text-slate-500 hover:bg-sky-50 hover:text-sky-700"
        >
          <ChevronLeft size={18} />
        </button>
        <strong aria-live="polite" className="text-sm text-slate-900">
          {MONTH_LABELS[month.getMonth()]} {month.getFullYear()}
        </strong>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          aria-label="Tháng sau"
          className="rounded-full p-1.5 text-slate-500 hover:bg-sky-50 hover:text-sky-700"
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_HEADERS.map((day) => (
          <span
            key={day}
            className={`mb-1 text-[10px] font-semibold ${day === "CN" ? "text-red-500" : "text-slate-500"}`}
          >
            {day}
          </span>
        ))}
        {buildCalendarDays(month).map((day) => {
          if (!day.date) return <span key={day.key} />;
          const date = day.date;
          const disabled = Boolean(minimum && date < minimum);
          const selected = Boolean(
            selectedDate && isSameDate(date, selectedDate),
          );
          return (
            <button
              key={day.key}
              type="button"
              disabled={disabled}
              aria-label={formatShortDate(date)}
              aria-pressed={selected}
              onClick={() => {
                if (!disabled) onSelect(date);
              }}
              className={`mx-auto flex aspect-square w-full max-w-9 items-center justify-center rounded-lg text-xs font-semibold transition focus-visible:outline-sky-600 ${selected ? "bg-sky-600 text-white" : disabled ? "cursor-not-allowed text-slate-300" : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"}`}
            >
              {day.dayNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}
