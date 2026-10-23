"use client";

import { Calendar as CalendarView } from "./Calendar";
import { Popover } from "./Popover";

import { formatLocalDate, formatShortDate } from "@/lib/utils/dateTime";
import { parseCalendarDate } from "@/lib/utils/calendar";
import { useDismiss } from "@/lib/ui/useDismiss";
import { Calendar, ChevronRight } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import type { AdminDatePickerProps } from "shared";

/** Hiển thị ô chọn ngày bằng lịch hoặc cho phép nhập ngày trực tiếp. */
export function AdminDatePicker({
  label,
  value,
  minDate,
  disabled = false,
  placeholder = "Chọn ngày",
  allowManualInput = false,
  onChange,
}: AdminDatePickerProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const id = useId();
  const selectedDate = useMemo(() => parseCalendarDate(value), [value]);
  const minDateValue = useMemo(() => parseCalendarDate(minDate), [minDate]);
  const baseDate = selectedDate ?? minDateValue ?? new Date();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(
    () => new Date(baseDate.getFullYear(), baseDate.getMonth(), 1),
  );

  useDismiss(wrapperRef, open && !disabled, () => setOpen(false));

  return (
    <div className="space-y-2" ref={wrapperRef}>
      {label ? (
        <label
          htmlFor={id}
          className="ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"
        >
          <Calendar size={16} className="text-blue-600" />
          {label}
        </label>
      ) : null}

      <div className="relative">
        {allowManualInput ? (
          <div>
            <input
              id={id}
              aria-label={label ?? placeholder}
              type="date"
              value={value}
              min={minDate}
              disabled={disabled}
              onChange={(event) => onChange(event.target.value)}
              className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition [color-scheme:light] ${
                disabled
                  ? "cursor-not-allowed opacity-60"
                  : "focus:border-sky-400 focus:bg-white"
              }`}
            />
          </div>
        ) : (
          <button
            id={id}
            aria-label={label ?? placeholder}
            aria-expanded={open && !disabled}
            type="button"
            disabled={disabled}
            onClick={() => {
              setMonth(
                new Date(baseDate.getFullYear(), baseDate.getMonth(), 1),
              );
              setOpen((current) => !current);
            }}
            className={`flex min-h-[64px] w-full items-center justify-between rounded-[20px] border border-[#e4ebf4] bg-white px-4 py-2 text-left shadow-[0_8px_20px_rgba(15,23,42,0.06)] transition ${
              disabled
                ? "cursor-not-allowed opacity-60"
                : "hover:border-[#d3ddea]"
            }`}
          >
            <span className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#edf4ff] text-[#2f76ff]">
                <Calendar size={16} />
              </span>
              <span
                className={`pr-2 text-[13px] font-bold leading-5 ${
                  selectedDate ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {selectedDate ? formatShortDate(selectedDate) : placeholder}
              </span>
            </span>
            <ChevronRight
              size={16}
              className={`text-slate-400 transition ${open ? "rotate-90" : ""}`}
            />
          </button>
        )}

        {open && !disabled && (
          <Popover anchorRef={wrapperRef} className="rounded-[22px] border border-[#e6edf5] bg-white p-2.5 shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
            <CalendarView
              month={month}
              selectedDate={selectedDate}
              minDate={minDateValue}
              onMonthChange={setMonth}
              onSelect={(day) => {
                onChange(formatLocalDate(day));
                setOpen(false);
              }}
            />
          </Popover>
        )}
      </div>
    </div>
  );
}
