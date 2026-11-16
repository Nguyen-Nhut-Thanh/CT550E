"use client";

import { useEffect, useId, useRef } from "react";
import type { DateTimeColumnProps } from "shared";

/** Cột chọn thời gian có cuộn, tự đưa giá trị đã chọn vào giữa và hỗ trợ bàn phím. */
export function DateTimeColumn({ label, options, value, onChange, disabled, compact }: DateTimeColumnProps) {
  const id = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const selectedIndex = options.findIndex((option) => option.value === value);

  useEffect(() => {
    const list = listRef.current;
    const option = list?.querySelector<HTMLElement>(`[data-value="${value}"]`);
    if (!list || !option || compact) return;
    const center = () => {
      list.scrollTop = option.offsetTop - (list.clientHeight - option.offsetHeight) / 2;
    };
    center();
    const observer = new ResizeObserver(center);
    observer.observe(list);
    return () => observer.disconnect();
  }, [value, compact]);

  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-[11px] bg-[#f7faff] border border-[var(--dt-border)] border-solid [[data-date-time-density=compact]_&]:rounded-[8px]">
      <span id={`${id}-label`} className="pt-3.5 pb-2.5 text-[var(--dt-muted)] text-[14px] font-[550] text-center px-[3px] [[data-date-time-density=compact]_&]:pt-[9px] [[data-date-time-density=compact]_&]:pb-1.5 [[data-date-time-density=compact]_&]:text-[11px] [[data-date-time-density=compact]_&]:px-0.5">{label}</span>
      <div
        ref={listRef}
        role="listbox"
        aria-labelledby={`${id}-label`}
        aria-activedescendant={selectedIndex >= 0 ? `${id}-${value}` : undefined}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={`[--row-height:52px] relative h-[calc(var(--row-height)_*_5)] overflow-y-auto overscroll-contain [scrollbar-width:none] [scroll-snap-type:y_proximity] [&::-webkit-scrollbar]:hidden focus-visible:[outline:2px_solid_var(--dt-blue)] focus-visible:[outline-offset:3px] @max-[680px]/date-time:[--row-height:44px] [[data-date-time-density=compact]_&]:[--row-height:36px] ${(compact) ? ("flex flex-col justify-center p-[7px] gap-3 [[data-date-time-density=compact]_&]:p-1 [[data-date-time-density=compact]_&]:gap-2") : ("px-[7px] py-[calc(var(--row-height)_*_2)] [[data-date-time-density=compact]_&]:px-1")}`} data-time-period={compact}
        onKeyDown={(event) => {
          if (disabled) return;
          const enabled = options.filter((option) => !option.disabled);
          const index = enabled.findIndex((option) => option.value === value);
          let next: number | undefined;
          if (event.key === "ArrowDown" || event.key === "ArrowRight") next = Math.min(enabled.length - 1, index + 1);
          if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = Math.max(0, index - 1);
          if (event.key === "Home") next = 0;
          if (event.key === "End") next = enabled.length - 1;
          if (next !== undefined) {
            event.preventDefault();
            if (enabled[next]) onChange(enabled[next].value);
          }
        }}
      >
        {options.map((option) => (
          <button
            key={option.value}
            id={`${id}-${option.value}`}
            type="button"
            role="option"
            aria-selected={value === option.value}
            aria-disabled={disabled || option.disabled}
            disabled={disabled || option.disabled}
            tabIndex={-1}
            data-value={option.value}
            className="[&[aria-selected=true]]:[background:var(--dt-blue)] [&[aria-selected=true]]:text-[#fff] [&[aria-selected=true]]:font-bold [&[aria-selected=true]]:shadow-[inset_0_1px_3px_#ffffff22] block w-full h-[var(--row-height)] rounded-[9px] text-[var(--dt-muted)] text-[20px] tabular-nums snap-center [[data-time-period=true]_&]:shrink-0 [[data-date-time-density=compact]_&]:rounded-[6px] [[data-date-time-density=compact]_&]:text-[15px]"
            onClick={() => {
              onChange(option.value);
              listRef.current?.focus({ preventScroll: true });
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
