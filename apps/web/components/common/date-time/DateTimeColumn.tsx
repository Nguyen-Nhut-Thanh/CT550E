"use client";

import { useEffect, useId, useRef } from "react";
import type { DateTimeColumnProps } from "shared";
import styles from "./DateTimePicker.module.css";

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
    <div className={styles.timeColumn}>
      <span id={`${id}-label`} className={styles.columnLabel}>{label}</span>
      <div
        ref={listRef}
        role="listbox"
        aria-labelledby={`${id}-label`}
        aria-activedescendant={selectedIndex >= 0 ? `${id}-${value}` : undefined}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={`${styles.timeList} ${compact ? styles.periodList : ""}`}
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
            className={styles.timeOption}
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
