"use client";

import { Calendar as CalendarView } from "./Calendar";
import { Popover } from "./Popover";

import { formatSearchDate } from "@/lib/utils/calendar";
import { useDismiss } from "@/lib/ui/useDismiss";
import { useId, useRef } from "react";
import { ChevronDown } from "lucide-react";
import type { SearchDateInputProps as Props } from 'shared';

/** Hiển thị ô chọn ngày đi cho biểu mẫu tìm kiếm với lịch dạng popup. */
export default function SearchDateInput({
  selectedDate,
  calendarMonth,
  today,
  isOpen,
  onToggle,
  onSelect,
  onMonthChange,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useDismiss(ref, isOpen, onToggle);
  return (
    <div ref={ref} className="relative">
      <label htmlFor={id} className="text-[15px] font-semibold text-[#1f1f1f]">Ngày đi</label>
      <button
        id={id}
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
        <Popover anchorRef={ref} width={320} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
          <CalendarView month={calendarMonth} selectedDate={selectedDate} minDate={today} onMonthChange={onMonthChange} onSelect={onSelect} />
        </Popover>
      ) : null}
    </div>
  );
}
