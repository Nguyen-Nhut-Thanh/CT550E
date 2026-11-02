"use client";

import { Clock3 } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { TimeInputProps } from "shared";
import { Popover } from "@/components/common/overlays/Popover";
import { useDismiss } from "@/lib/ui/useDismiss";
import { formatTimeLabel } from "@/lib/utils/timePicker";
import { TimePicker } from "./TimePicker";

/** Ô giờ mở bộ chọn giờ/phút/AM–PM, trả về HH:mm theo định dạng 24 giờ. */
export function TimeInput({ id, label, value, onChange, disabled = false, locale = "vi-VN", ariaLabel, placeholder, error, className = "" }: TimeInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const expanded = open && !disabled;
  const english = locale === "en-US";
  const name = ariaLabel ?? label ?? (english ? "Choose time" : "Chọn giờ");
  const display = formatTimeLabel(value);
  useDismiss(wrapperRef, expanded, () => setOpen(false));
  useEffect(() => {
    if (!expanded) return;
    const frame = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('[role="listbox"]')?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [expanded]);
  return <div ref={wrapperRef} className={`min-w-0 ${className}`} onBlur={event => {
    if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    {label && <label htmlFor={inputId} className="mb-2 block text-[13px] font-semibold text-[#26324e]">{label}</label>}
    <button id={inputId} ref={triggerRef} type="button" disabled={disabled} aria-label={name} aria-haspopup="dialog" aria-expanded={expanded} aria-controls={expanded ? `${inputId}-panel` : undefined} aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : undefined} onClick={() => setOpen(current => !current)} className={`flex min-h-[48px] w-full items-center justify-between gap-2 rounded-[11px] border bg-[#f8faff] px-4 py-3 text-left text-[14px] font-bold shadow-[0_3px_8px_#308ac80a] outline-none transition focus-visible:ring-2 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 ${error ? "border-rose-400" : expanded ? "border-[#79a8f5] ring-2 ring-blue-100" : "border-[#dfe6f1] hover:border-[#79a8f5]"}`}>
      <span className={`min-w-0 truncate tabular-nums ${display ? "text-[#0868f9]" : "font-normal text-[#94a0b4]"}`}>{display || placeholder || (english ? "Choose time" : "Chọn giờ")}</span><Clock3 size={18} className="shrink-0 text-[#7e8da5]" />
    </button>
    {error && <p id={`${inputId}-error`} role="alert" className="mt-1 text-xs text-rose-600">{error}</p>}
    {expanded && <Popover anchorRef={triggerRef} width={300} fitViewport className="rounded-[18px] border border-[#dfe6f1] bg-white p-0 shadow-[0_12px_36px_#224d7c25]">
      <div ref={panelRef} id={`${inputId}-panel`} role="dialog" aria-label={name}>
        <TimePicker value={value} onChange={onChange} locale={locale} ariaLabel={name} />
        <div className="flex justify-end border-t border-[#edf1f8] px-3 py-2.5"><button type="button" onClick={() => { setOpen(false); triggerRef.current?.focus(); }} className="rounded-lg bg-[#0868f9] px-4 py-2 text-[12px] font-bold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">{english ? "Done" : "Xong"}</button></div>
      </div>
    </Popover>}
  </div>;
}
