"use client";

import { CalendarClock, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { DateTimeInputProps } from "shared";
import { Popover } from "@/components/common/overlays/Popover";
import { useDismiss } from "@/lib/ui/useDismiss";
import { isValidDate } from "@/lib/utils/dateTimePicker";
import { DateTimePicker } from "./DateTimePicker";
import styles from "./DateTimePicker.module.css";

/** Ô ngày–giờ mở DateTimePicker trong popover, dùng được trong form và dialog. */
export function DateTimeInput({
  label, placeholder, error, value, onChange, minDate, maxDate,
  disabled = false, locale = "vi-VN", className = "", ariaLabel,
}: DateTimeInputProps) {
  const id = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const english = locale === "en-US";
  const selected = isValidDate(value) ? value : null;

  useDismiss(wrapperRef, open && !disabled, () => setOpen(false));
  useEffect(() => {
    if (!open || disabled) return;
    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      const target = panel?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]:not(:disabled)')
        ?? panel?.querySelector<HTMLButtonElement>('button:not(:disabled)');
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [open, disabled]);

  return (
    <div ref={wrapperRef} className={`min-w-0 ${className}`}>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      <button
        id={id} ref={triggerRef} type="button" disabled={disabled}
        aria-label={ariaLabel ?? label}
        aria-haspopup="dialog" aria-expanded={open && !disabled}
        aria-controls={open && !disabled ? `${id}-panel` : undefined}
        aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
        onClick={() => setOpen((current) => !current)}
        className={`flex min-h-11 w-full items-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-left text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50 ${error ? "border-rose-400" : open ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200 hover:border-blue-400"}`}
      >
        <CalendarClock size={17} className="shrink-0 text-blue-600" />
        <span className={`min-w-0 flex-1 truncate ${selected ? "text-slate-900" : "text-slate-400"}`}>
          {selected ? new Intl.DateTimeFormat(locale, {
            day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
          }).format(selected) : placeholder ?? (english ? "Choose date and time" : "Chọn ngày và giờ")}
        </span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-rose-600">{error}</p>}
      {open && !disabled && (
        <Popover anchorRef={triggerRef} width={560} fitViewport className="rounded-2xl border-0 bg-white p-0 shadow-xl">
          <div ref={panelRef} id={`${id}-panel`} role="dialog" aria-label={label}>
            <DateTimePicker value={selected} onChange={onChange} minDate={minDate} maxDate={maxDate} locale={locale} ariaLabel={ariaLabel ?? label} className={styles.compact} />
            <div className="flex justify-end border-t border-slate-100 px-3 py-2">
              <button type="button" onClick={() => { setOpen(false); triggerRef.current?.focus(); }} className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                {english ? "Done" : "Xong"}
              </button>
            </div>
          </div>
        </Popover>
      )}
    </div>
  );
}
