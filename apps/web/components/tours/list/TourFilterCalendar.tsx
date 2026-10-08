"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  buildCalendarDays,
  fromDateValue,
  isSameDate,
  MONTH_LABELS,
  startOfDay,
  toDateValue,
  WEEKDAY_HEADERS,
} from "@/lib/client/utils/searchBar.utils";

type TourFilterCalendarProps = {
  dateValue: string;
  onSelectDate: (value: string) => void;
  label?: string;
};

export default function TourFilterCalendar({
  dateValue,
  onSelectDate,
  label = "Ngày đi",
}: TourFilterCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const today = useMemo(() => startOfDay(new Date()), []);
  const selectedDate = useMemo(() => {
    if (!dateValue) return null;
    try {
      return fromDateValue(dateValue);
    } catch {
      return null;
    }
  }, [dateValue]);

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const initial = selectedDate || new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth),
    [calendarMonth],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeMonth = (offset: number) => {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + offset, 1),
    );
  };

  const handleSelectDay = (date: Date) => {
    if (startOfDay(date) < today) return;
    onSelectDate(toDateValue(date));
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectDate("");
  };

  const displayDateText = useMemo(() => {
    if (!selectedDate) return "mm/dd/yyyy";
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const yyyy = selectedDate.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }, [selectedDate]);

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      {label && (
        <label className="text-[14px] font-extrabold uppercase tracking-wider text-slate-600">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex w-full items-center justify-between rounded-xl border bg-gray-50/50 px-3.5 py-3 text-left text-[15px] font-medium outline-none transition ${
            isOpen
              ? "border-sky-400 bg-white ring-4 ring-sky-50"
              : "border-gray-200 hover:border-sky-300 hover:bg-white"
          }`}
          aria-expanded={isOpen}
        >
          {/* Icon Calendar ở phía trước bên trái */}
          <div className="flex items-center gap-2.5 overflow-hidden">
            <CalendarIcon className="h-4.5 w-4.5 shrink-0 text-gray-400" />
            <span
              className={`truncate ${
                selectedDate ? "font-semibold text-slate-800" : "text-slate-600"
              }`}
            >
              {displayDateText}
            </span>
          </div>

          {selectedDate && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="rounded-full p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              title="Xóa ngày đã chọn"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-full min-w-[230px] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_14px_40px_rgba(15,23,42,0.15)]">
            {/* Calendar Month Header */}
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
                aria-label="Tháng trước"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <strong className="text-[13px] font-bold text-slate-900">
                {MONTH_LABELS[calendarMonth.getMonth()]}{" "}
                {calendarMonth.getFullYear()}
              </strong>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-sky-50 hover:text-sky-700"
                aria-label="Tháng sau"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="mb-1.5 grid grid-cols-7 text-center text-[10px] font-semibold text-slate-500">
              {WEEKDAY_HEADERS.map((day) => (
                <span key={day} className={day === "CN" ? "text-red-500" : ""}>
                  {day}
                </span>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-y-0.5 text-center">
              {calendarDays.map((day) => {
                const disabled = !day.date || day.date < today;
                const isSelected =
                  day.date && selectedDate && isSameDate(day.date, selectedDate);

                return (
                  <button
                    key={day.key}
                    type="button"
                    disabled={disabled}
                    onClick={() => day.date && handleSelectDay(day.date)}
                    className={`mx-auto flex h-7.5 w-7.5 items-center justify-center rounded-lg text-[12px] font-semibold transition ${
                      isSelected
                        ? "bg-sky-600 font-bold text-white shadow-sm"
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
        )}
      </div>
    </div>
  );
}
