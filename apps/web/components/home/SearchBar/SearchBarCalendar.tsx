"use client";

import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarDay } from "@/lib/client/searchBar.types";
import {
  isSameDate,
  MONTH_LABELS,
  formatSearchDate,
  WEEKDAY_HEADERS,
} from "@/lib/client/searchBar.utils";

type Props = {
  selectedDate: Date;
  calendarMonth: Date;
  calendarDays: CalendarDay[];
  today: Date;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
};

export default function SearchBarCalendar({
  selectedDate,
  calendarMonth,
  calendarDays,
  today,
  isOpen,
  onToggle,
  onSelect,
  onMonthChange,
}: Props) {
  const changeMonth = (offset: number) => {
    onMonthChange(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1),
    );
  };

  return (
    <div data-search-calendar className="relative">
      <span className="text-[15px] font-semibold text-[#1f1f1f]">Ngày đi</span>
      <button
        type="button"
        onClick={onToggle}
        className="mt-3 flex w-full items-center justify-between gap-3 border-0 bg-transparent px-0 py-0 text-left text-[16px] text-[#1f1f1f] outline-none focus:ring-0 md:text-[17px]"
        aria-expanded={isOpen}
      >
        <span className="truncate">{formatSearchDate(selectedDate)}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+14px)] z-50 w-[296px] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.18)] sm:w-[320px]">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
              aria-label="Tháng trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <strong className="text-[15px] text-slate-900">
              {MONTH_LABELS[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
            </strong>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
              aria-label="Tháng sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold text-slate-500">
            {WEEKDAY_HEADERS.map((day) => (
              <span key={day} className={day === "CN" ? "text-red-500" : ""}>
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center">
            {calendarDays.map((day) => {
              const disabled = !day.date || day.date < today;
              return (
                <button
                  key={day.key}
                  type="button"
                  disabled={disabled}
                  onClick={() => day.date && onSelect(day.date)}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                    day.date && isSameDate(day.date, selectedDate)
                      ? "bg-sky-600 text-white"
                      : disabled
                        ? "cursor-not-allowed text-slate-200"
                        : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                  }`}
                >
                  {day.dayNumber}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
