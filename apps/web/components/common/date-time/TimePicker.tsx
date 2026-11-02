"use client";

import { Clock3 } from "lucide-react";
import type { TimePickerProps } from "shared";
import { changeTimePart, formatTimeLabel, parseTimeValue } from "@/lib/utils/timePicker";
import { DateTimeColumn } from "./DateTimeColumn";

/** Bộ chọn giờ độc lập, dùng chung các cột cuộn của DateTimePicker. */
export function TimePicker({ value, onChange, disabled = false, locale = "vi-VN", ariaLabel, className = "" }: TimePickerProps) {
  const active = parseTimeValue(value) ? value : "08:00";
  const time = parseTimeValue(active)!;
  const english = locale === "en-US";
  const select = (part: "hour" | "minute" | "period", next: number) => {
    if (!disabled) onChange(changeTimePart(active, part, next));
  };
  return <section aria-label={ariaLabel ?? (english ? "Choose time" : "Chọn giờ")} aria-disabled={disabled} data-date-time-density="compact" className={`[--dt-blue:#0868f9] [--dt-border:#dfe6f1] [--dt-muted:#7183a0] w-full p-3 text-[#233455] [&_button]:cursor-pointer [&_button]:transition-colors [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-35 [&_button:hover:not(:disabled):not([aria-selected=true])]:bg-[#edf4ff] [&_button:hover:not(:disabled):not([aria-selected=true])]:text-[#0868f9] ${className}`}>
    <div className="mb-3 flex items-center justify-between gap-3 px-1">
      <h3 className="flex items-center gap-2 text-[13px] font-bold"><Clock3 size={17} className="text-[#0868f9]" />{english ? "Choose time" : "Chọn giờ"}</h3>
      <output aria-live="polite" aria-atomic="true" className="text-[13px] font-bold text-[#0868f9] tabular-nums">{formatTimeLabel(active)}</output>
    </div>
    <div className="grid grid-cols-3 gap-2">
      <DateTimeColumn label={english ? "Hour" : "Giờ"} value={time.hour % 12 || 12} disabled={disabled} options={Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: String(index + 1).padStart(2, "0") }))} onChange={hour => select("hour", hour)} />
      <DateTimeColumn label={english ? "Minute" : "Phút"} value={time.minute} disabled={disabled} options={Array.from({ length: 60 }, (_, minute) => ({ value: minute, label: String(minute).padStart(2, "0") }))} onChange={minute => select("minute", minute)} />
      <DateTimeColumn label="AM/PM" value={time.hour >= 12 ? 1 : 0} disabled={disabled} compact options={[{ value: 0, label: "AM" }, { value: 1, label: "PM" }]} onChange={period => select("period", period)} />
    </div>
  </section>;
}
