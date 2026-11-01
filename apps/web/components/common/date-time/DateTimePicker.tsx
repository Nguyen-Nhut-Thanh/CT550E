"use client";

import { ChevronDown, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import type { DateTimePickerProps } from "shared";
import { isSameDate, toDateValue } from "@/lib/utils/calendar";
import {
  buildDateTimeDays,
  clampDateTime,
  isDayAvailable,
  isValidDate,
  localDate,
  minuteBounds,
  timeInHour,
} from "@/lib/utils/dateTimePicker";
import { DateTimeColumn } from "./DateTimeColumn";
import styles from "./DateTimePicker.module.css";

const COPY = {
  "vi-VN": {
    picker: "Chọn ngày và giờ", time: "Thời gian", hour: "Giờ", minute: "Phút",
    period: "AM/PM", clear: "Xóa", today: "Hôm nay", year: "Năm",
    previous: "Tháng trước", next: "Tháng sau", chooseMonth: "Chọn tháng và năm",
    weekdays: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
    invalidRange: "Không có thời gian hợp lệ trong giới hạn đã cho.",
  },
  "en-US": {
    picker: "Choose date and time", time: "Time", hour: "Hour", minute: "Minute",
    period: "AM/PM", clear: "Clear", today: "Today", year: "Year",
    previous: "Previous month", next: "Next month", chooseMonth: "Choose month and year",
    weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    invalidRange: "No available time within the supplied limits.",
  },
};

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** Chỉ dựng thời gian cục bộ sau hydration để tránh lệch múi giờ giữa server và trình duyệt. */
export function DateTimePicker(props: DateTimePickerProps) {
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  if (!mounted) {
    return (
      <section
        aria-label={props.ariaLabel ?? COPY[props.locale ?? "vi-VN"].picker}
        aria-busy="true"
        className={`${styles.picker} ${props.className ?? ""}`}
      ><div className={styles.placeholder} /></section>
    );
  }
  return <DateTimePickerPanel {...props} />;
}

/** Bộ chọn ngày–giờ độc lập: lịch 6 tuần, giờ 12 tiếng và giá trị chính xác đến phút. */
function DateTimePickerPanel({
  value, onChange, minDate, maxDate, disabled = false, locale = "vi-VN",
  className = "", ariaLabel,
}: DateTimePickerProps) {
  const copy = COPY[locale];
  const id = useId();
  const [initialDate] = useState(() => new Date());
  const { minimum, maximum } = minuteBounds(minDate, maxDate);
  const invalidRange = minimum > maximum;
  const inactive = disabled || invalidRange;
  const selectedDate = isValidDate(value) ? value : null;
  // Không âm thầm đổi giá trị controlled khi giới hạn của form cha thay đổi.
  const active = selectedDate
    ? clampDateTime(selectedDate, -Infinity, Infinity)
    : clampDateTime(initialDate, invalidRange ? -Infinity : minimum, invalidRange ? Infinity : maximum);
  const selectedKey = selectedDate ? toDateValue(selectedDate) : "";
  const [month, setMonth] = useState(() => localDate(active.getFullYear(), active.getMonth(), 1));
  const [choosingMonth, setChoosingMonth] = useState(false);
  const [focusedDay, setFocusedDay] = useState(() => toDateValue(active));
  const focusRequested = useRef(false);
  const monthToggleRef = useRef<HTMLButtonElement>(null);
  const dayButtons = useRef(new Map<string, HTMLButtonElement>());
  const days = buildDateTimeDays(month);
  const today = new Date();
  const hour = active.getHours();
  const minute = active.getMinutes();
  const period = hour >= 12 ? 1 : 0;
  const displayHour = hour % 12 || 12;
  const fullDate = new Intl.DateTimeFormat(locale, { dateStyle: "full" });
  const monthTitle = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(month);
  const tabStop = days.find((date) => toDateValue(date) === focusedDay && isDayAvailable(date, minimum, maximum))
    ?? days.find((date) => date.getMonth() === month.getMonth() && isDayAvailable(date, minimum, maximum));

  // Chỉ chuyển tháng khi ngày do form cha điều khiển thay đổi, không khi đổi giờ.
  useEffect(() => {
    if (!selectedKey) return;
    const [year, monthNumber, day] = selectedKey.split("-").map(Number);
    setMonth(localDate(year, monthNumber - 1, 1));
    setFocusedDay(toDateValue(localDate(year, monthNumber - 1, day)));
  }, [selectedKey]);

  useEffect(() => {
    if (!focusRequested.current) return;
    dayButtons.current.get(focusedDay)?.focus();
    focusRequested.current = false;
  }, [focusedDay, month]);

  const emit = (date: Date) => {
    if (!inactive) onChange(clampDateTime(date, minimum, maximum));
  };
  const selectDay = (day: Date) => {
    const next = new Date(day);
    next.setHours(hour, minute, 0, 0);
    setMonth(localDate(day.getFullYear(), day.getMonth(), 1));
    setFocusedDay(toDateValue(day));
    emit(next);
  };
  const monthAvailable = (candidate: Date) => {
    const start = localDate(candidate.getFullYear(), candidate.getMonth(), 1);
    const end = localDate(candidate.getFullYear(), candidate.getMonth() + 1, 1);
    return start.getTime() <= maximum && end.getTime() - 1 >= minimum;
  };
  const previousMonth = localDate(month.getFullYear(), month.getMonth() - 1, 1);
  const nextMonth = localDate(month.getFullYear(), month.getMonth() + 1, 1);
  const onDayKeyDown = (event: KeyboardEvent<HTMLButtonElement>, day: Date) => {
    let next: Date;
    const offsets: Record<string, number> = {
      ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7,
      Home: -day.getDay(), End: 6 - day.getDay(),
    };
    if (event.key in offsets) {
      next = localDate(day.getFullYear(), day.getMonth(), day.getDate() + offsets[event.key]);
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      const target = localDate(day.getFullYear(), day.getMonth() + (event.key === "PageUp" ? -1 : 1), 1);
      const last = localDate(target.getFullYear(), target.getMonth() + 1, 0).getDate();
      next = localDate(target.getFullYear(), target.getMonth(), Math.min(day.getDate(), last));
    } else return;
    event.preventDefault();
    if (!isDayAvailable(next, minimum, maximum)) return;
    focusRequested.current = true;
    setMonth(localDate(next.getFullYear(), next.getMonth(), 1));
    setFocusedDay(toDateValue(next));
  };

  return (
    <section
      aria-label={ariaLabel ?? copy.picker}
      aria-describedby={invalidRange ? `${id}-error` : undefined}
      className={`${styles.picker} ${className}`}
      data-disabled={inactive}
      onKeyDown={(event) => {
        if (event.key === "Escape" && choosingMonth) {
          event.stopPropagation();
          setChoosingMonth(false);
          monthToggleRef.current?.focus();
        }
      }}
    >
      {invalidRange && <p id={`${id}-error`} role="status" className="px-5 pt-4 text-sm text-slate-500">{copy.invalidRange}</p>}
      <div className={styles.body}>
        <div className={styles.datePanel}>
          <div className={styles.header}>
            <button
              type="button"
              ref={monthToggleRef}
              className={styles.monthToggle}
              disabled={inactive}
              aria-label={`${copy.chooseMonth}: ${monthTitle}`}
              aria-expanded={choosingMonth}
              aria-controls={`${id}-calendar`}
              onClick={() => setChoosingMonth((current) => !current)}
            >
              <span aria-live="polite">{monthTitle}</span>
              <ChevronDown size={19} className={choosingMonth ? styles.expanded : ""} />
            </button>
            <div className={styles.navigation}>
              <button type="button" aria-label={copy.previous} disabled={inactive || !monthAvailable(previousMonth)} className={styles.iconButton} onClick={() => setMonth(previousMonth)}><ChevronLeft size={23} /></button>
              <button type="button" aria-label={copy.next} disabled={inactive || !monthAvailable(nextMonth)} className={styles.iconButton} onClick={() => setMonth(nextMonth)}><ChevronRight size={23} /></button>
            </div>
          </div>

          <div id={`${id}-calendar`}>
            {choosingMonth ? (
              <div className={styles.monthPicker}>
                <label className={styles.yearField}>
                  {copy.year}
                  <input
                    type="number" min={1} max={9999} value={month.getFullYear()} disabled={inactive}
                    onChange={(event) => {
                      const year = Number(event.target.value);
                      if (Number.isInteger(year) && year >= 1 && year <= 9999) setMonth(localDate(year, month.getMonth(), 1));
                    }}
                  />
                </label>
                <div className={styles.months}>
                  {Array.from({ length: 12 }, (_, index) => {
                    const candidate = localDate(month.getFullYear(), index, 1);
                    return (
                      <button
                        type="button" key={index} className={styles.monthOption}
                        aria-pressed={month.getMonth() === index}
                        disabled={inactive || !monthAvailable(candidate)}
                        onClick={() => { setMonth(candidate); setChoosingMonth(false); monthToggleRef.current?.focus(); }}
                      >
                        {new Intl.DateTimeFormat(locale, { month: "short" }).format(candidate)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className={styles.weekdays} aria-hidden="true">{copy.weekdays.map((day) => <span key={day}>{day}</span>)}</div>
                <div className={styles.days}>
                  {days.map((day) => {
                    const key = toDateValue(day);
                    return (
                      <button
                        key={key} type="button"
                        ref={(element) => { if (element) dayButtons.current.set(key, element); else dayButtons.current.delete(key); }}
                        aria-label={fullDate.format(day)}
                        aria-pressed={Boolean(selectedDate && isSameDate(day, selectedDate))}
                        aria-current={isSameDate(day, today) ? "date" : undefined}
                        disabled={inactive || !isDayAvailable(day, minimum, maximum)}
                        tabIndex={tabStop && isSameDate(day, tabStop) ? 0 : -1}
                        className={`${styles.day} ${day.getMonth() !== month.getMonth() ? styles.outside : ""}`}
                        onFocus={() => setFocusedDay(key)}
                        onKeyDown={(event) => onDayKeyDown(event, day)}
                        onClick={() => selectDay(day)}
                      >{day.getDate()}</button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <div className={styles.dateFooter}>
            <button type="button" className={styles.textButton} disabled={disabled || !selectedDate} onClick={() => onChange(null)}>{copy.clear}</button>
            <button
              type="button" className={styles.textButton}
              disabled={inactive || !isDayAvailable(today, minimum, maximum)}
              onClick={() => { setChoosingMonth(false); selectDay(new Date()); }}
            >{copy.today}</button>
          </div>
        </div>

        <div className={styles.timePanel}>
          <h3 className={styles.timeHeading}>{copy.time}</h3>
          <div className={styles.columns}>
            <DateTimeColumn
              label={copy.hour} value={displayHour} disabled={inactive}
              options={Array.from({ length: 12 }, (_, index) => ({
                value: index + 1, label: String(index + 1).padStart(2, "0"),
                disabled: !timeInHour(active, (index + 1) % 12 + period * 12, minimum, maximum),
              }))}
              onChange={(nextHour) => {
                const next = timeInHour(active, nextHour % 12 + period * 12, minimum, maximum);
                if (next) emit(next);
              }}
            />
            <DateTimeColumn
              label={copy.minute} value={minute} disabled={inactive}
              options={Array.from({ length: 60 }, (_, index) => {
                const candidate = new Date(active);
                candidate.setMinutes(index, 0, 0);
                return { value: index, label: String(index).padStart(2, "0"), disabled: candidate.getTime() < minimum || candidate.getTime() > maximum };
              })}
              onChange={(nextMinute) => { const next = new Date(active); next.setMinutes(nextMinute, 0, 0); emit(next); }}
            />
            <DateTimeColumn
              label={copy.period} value={period} disabled={inactive} compact
              options={[0, 1].map((nextPeriod) => ({
                value: nextPeriod, label: nextPeriod === 0 ? "AM" : "PM",
                disabled: !Array.from({ length: 12 }, (_, index) => timeInHour(active, index + nextPeriod * 12, minimum, maximum)).some(Boolean),
              }))}
              onChange={(nextPeriod) => {
                const preferred = timeInHour(active, hour % 12 + nextPeriod * 12, minimum, maximum);
                const next = preferred ?? Array.from({ length: 12 }, (_, index) => timeInHour(active, index + nextPeriod * 12, minimum, maximum)).find(Boolean);
                if (next) emit(next);
              }}
            />
          </div>
          <output className={styles.summary} aria-live="polite" aria-atomic="true">
            <Clock3 size={29} strokeWidth={1.7} />
            <span>{selectedDate ? `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period ? "PM" : "AM"}` : "--:--"}</span>
          </output>
        </div>
      </div>
    </section>
  );
}
