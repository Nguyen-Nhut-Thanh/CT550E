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
  variant = "default",
  label,
  value,
  minDate,
  disabled = false,
  placeholder = "Chọn ngày",
  allowManualInput = false,
  onChange,
}: AdminDatePickerProps) {
  const compact = variant === "compact";
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
          className={compact ? "block text-[11px] font-medium text-slate-500" : "ml-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500"}
        >
          {!compact && <Calendar size={16} className="text-blue-600" />}
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
            className={`flex w-full items-center justify-between border border-[#e4ebf4] bg-white text-left transition ${compact ? "h-10 rounded-[10px] px-3 py-2" : "min-h-[64px] rounded-[20px] px-4 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.06)]"} ${
              disabled
                ? "cursor-not-allowed opacity-60"
                : "hover:border-[#d3ddea]"
            }`}
          >
            <span className={`flex min-w-0 items-center ${compact ? "gap-2" : "gap-3"}`}>
              <span className={`flex shrink-0 items-center justify-center text-[#2f76ff] ${compact ? "h-5 w-5" : "h-7 w-7 rounded-full bg-[#edf4ff]"}`}>
                <Calendar size={16} />
              </span>
              <span
                className={`truncate pr-2 leading-5 ${compact ? "text-[12px] font-medium" : "text-[13px] font-bold"} ${
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
