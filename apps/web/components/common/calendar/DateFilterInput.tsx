"use client";

import { Calendar as CalendarView } from "./Calendar";
import { Popover } from "@/components/common/overlays/Popover";

import { useDismiss } from "@/lib/ui/useDismiss";
import { parseCalendarDate, startOfDay, toDateValue } from "@/lib/utils/calendar";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import type { DateFilterInputProps } from 'shared';

/** Hiển thị ô lọc ngày đi với lịch chọn ngày và nút xóa lựa chọn. */
export default function DateFilterInput({
  dateValue,
  onSelectDate,
  label = "Ngày đi",
}: DateFilterInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const id = useId();

  const today = useMemo(() => startOfDay(new Date()), []);
  const selectedDate = useMemo(() => parseCalendarDate(dateValue), [dateValue]);

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const initial = selectedDate || new Date();
    return new Date(initial.getFullYear(), initial.getMonth(), 1);
  });

  useDismiss(containerRef, isOpen, () => setIsOpen(false));

  const handleSelectDay = (date: Date) => {
    if (startOfDay(date) < today) return;
    onSelectDate(toDateValue(date));
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelectDate("");
  };

  const displayDateText = useMemo(() => {
    if (!selectedDate) return "dd/mm/yyyy";
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const yyyy = selectedDate.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }, [selectedDate]);

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      {label && (
        <label htmlFor={id} className="text-[14px] font-extrabold uppercase tracking-wider text-slate-600">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          id={id}
          aria-label={label || "Chọn ngày đi"}
          type="button"
          onClick={() => {
            const initial = selectedDate ?? today;
            setCalendarMonth(new Date(initial.getFullYear(), initial.getMonth(), 1));
            setIsOpen((prev) => !prev);
          }}
          className={`flex w-full items-center justify-between rounded-xl border bg-gray-50/50 px-3.5 py-3 text-left text-[15px] font-medium outline-none transition ${
            isOpen
              ? "border-sky-400 bg-white ring-4 ring-sky-50"
              : "border-gray-200 hover:border-sky-300 hover:bg-white"
          }`}
          aria-expanded={isOpen}
        >
          {/* Icon Calendar ở phía trước bên trái */}
          <div className="flex items-center gap-2.5 overflow-hidden pr-6">
            <CalendarIcon className="h-4.5 w-4.5 shrink-0 text-gray-400" />
            <span
              className={`truncate ${
                selectedDate ? "font-semibold text-slate-800" : "text-slate-600"
              }`}
            >
              {displayDateText}
            </span>
          </div>

        </button>
          {selectedDate && (
            <button
              type="button"
              aria-label="Xóa ngày đã chọn"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700"
              title="Xóa ngày đã chọn"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

        {isOpen && (
          <Popover anchorRef={containerRef} matchAnchorWidth className="rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_14px_40px_rgba(15,23,42,0.15)]">
            <CalendarView month={calendarMonth} selectedDate={selectedDate} minDate={today} onMonthChange={setCalendarMonth} onSelect={handleSelectDay} />
          </Popover>
        )}
      </div>
    </div>
  );
}
