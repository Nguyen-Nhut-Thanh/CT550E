"use client";

import { ChevronDown, ChevronLeft, ChevronRight, Clock3 } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from "react";
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

const COPY = {
  "vi-VN": {
    picker: "Chọn ngày và giờ",
    time: "Thời gian",
    hour: "Giờ",
    minute: "Phút",
    period: "AM/PM",
    clear: "Xóa",
    today: "Hôm nay",
    year: "Năm",
    previous: "Tháng trước",
    next: "Tháng sau",
    chooseMonth: "Chọn tháng và năm",
    weekdays: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
    invalidRange: "Không có thời gian hợp lệ trong giới hạn đã cho.",
  },
  "en-US": {
    picker: "Choose date and time",
    time: "Time",
    hour: "Hour",
    minute: "Minute",
    period: "AM/PM",
    clear: "Clear",
    today: "Today",
    year: "Year",
    previous: "Previous month",
    next: "Next month",
    chooseMonth: "Choose month and year",
    weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    invalidRange: "No available time within the supplied limits.",
  },
};

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** Chỉ dựng thời gian cục bộ sau hydration để tránh lệch múi giờ giữa server và trình duyệt. */
export function DateTimePicker(props: DateTimePickerProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  );
  if (!mounted) {
    return (
      <section
        aria-label={props.ariaLabel ?? COPY[props.locale ?? "vi-VN"].picker}
        aria-busy="true"
        className={`[--dt-blue:#126dff] [--dt-border:#dce7f8] [--dt-muted:#536788] @container/date-time w-full max-w-220 rounded-[16px] bg-[#fff] text-[#0c1b3c] shadow-[0_18px_48px_#1c427315] text-[15px] border border-[#cedced] border-solid [&_button]:cursor-pointer [&_button]:[transition:background-color_150ms,_color_150ms] [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-[.35] [&[data-disabled=true]]:opacity-[.6] [&_button:focus-visible]:[outline:2px_solid_var(--dt-blue)] [&_button:focus-visible]:[outline-offset:3px] [@media(hover:hover)]:[&_button:hover:not(:disabled):not([aria-pressed=true]):not([aria-selected=true])]:bg-[#edf4ff] [@media(hover:hover)]:[&_button:hover:not(:disabled):not([aria-pressed=true]):not([aria-selected=true])]:text-[var(--dt-blue)] [[data-date-time-density=compact]_&]:rounded-[12px] [[data-date-time-density=compact]_&]:text-[13px] [[data-date-time-density=compact]_&]:shadow-none  ${props.className ?? ""}`}
      >
        <div className="h-127.5 rounded-[inherit] bg-[#f7faff] @max-[680px]/date-time:h-217.5 [[data-date-time-density=compact]_&]:h-80 @max-[500px]/date-time:[[data-date-time-density=compact]_&]:h-150" />
      </section>
    );
  }
  return <DateTimePickerPanel {...props} />;
}

/** Bộ chọn ngày–giờ độc lập: lịch theo số tuần của tháng, giờ chính xác đến phút. */
function DateTimePickerPanel({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  locale = "vi-VN",
  className = "",
  ariaLabel,
  showSummary = true,
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
    : clampDateTime(
        initialDate,
        invalidRange ? -Infinity : minimum,
        invalidRange ? Infinity : maximum,
      );
  const selectedKey = selectedDate ? toDateValue(selectedDate) : "";
  const [month, setMonth] = useState(() =>
    localDate(active.getFullYear(), active.getMonth(), 1),
  );
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
  const monthTitle = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(month);
  const tabStop =
    days.find(
      (date) =>
        toDateValue(date) === focusedDay &&
        isDayAvailable(date, minimum, maximum),
    ) ??
    days.find(
      (date) =>
        date.getMonth() === month.getMonth() &&
        isDayAvailable(date, minimum, maximum),
    );

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
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -day.getDay(),
      End: 6 - day.getDay(),
    };
    if (event.key in offsets) {
      next = localDate(
        day.getFullYear(),
        day.getMonth(),
        day.getDate() + offsets[event.key],
      );
    } else if (event.key === "PageUp" || event.key === "PageDown") {
      const target = localDate(
        day.getFullYear(),
        day.getMonth() + (event.key === "PageUp" ? -1 : 1),
        1,
      );
      const last = localDate(
        target.getFullYear(),
        target.getMonth() + 1,
        0,
      ).getDate();
      next = localDate(
        target.getFullYear(),
        target.getMonth(),
        Math.min(day.getDate(), last),
      );
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
      className={`[--dt-blue:#126dff] [--dt-border:#dce7f8] [--dt-muted:#536788] @container/date-time w-full max-w-220 rounded-[16px] bg-[#fff] text-[#0c1b3c] shadow-[0_18px_48px_#1c427315] text-[15px] border border-[#cedced] border-solid [&_button]:cursor-pointer [&_button]:[transition:background-color_150ms,_color_150ms] [&_button:disabled]:cursor-not-allowed [&_button:disabled]:opacity-[.35] [&[data-disabled=true]]:opacity-[.6] [&_button:focus-visible]:[outline:2px_solid_var(--dt-blue)] [&_button:focus-visible]:[outline-offset:3px] [@media(hover:hover)]:[&_button:hover:not(:disabled):not([aria-pressed=true]):not([aria-selected=true])]:bg-[#edf4ff] [@media(hover:hover)]:[&_button:hover:not(:disabled):not([aria-pressed=true]):not([aria-selected=true])]:text-[var(--dt-blue)] [[data-date-time-density=compact]_&]:rounded-[12px] [[data-date-time-density=compact]_&]:text-[13px] [[data-date-time-density=compact]_&]:shadow-none  ${className}`}
      data-disabled={inactive}
      onKeyDown={(event) => {
        if (event.key === "Escape" && choosingMonth) {
          event.stopPropagation();
          setChoosingMonth(false);
          monthToggleRef.current?.focus();
        }
      }}
    >
      {invalidRange && (
        <p
          id={`${id}-error`}
          role="status"
          className="px-5 pt-4 text-sm text-slate-500"
        >
          {copy.invalidRange}
        </p>
      )}
      <div className="grid grid-cols-[1.35fr_1fr] px-5 py-5.5 @max-[680px]/date-time:grid-cols-[1fr] @max-[680px]/date-time:p-4.5 [[data-date-time-density=compact]_&]:grid-cols-[1.35fr_1fr] [[data-date-time-density=compact]_&]:p-3 @max-[500px]/date-time:[[data-date-time-density=compact]_&]:grid-cols-[1fr]">
        <div className="min-w-0 pr-7 @max-[680px]/date-time:pr-0 [[data-date-time-density=compact]_&]:pr-3 @max-[500px]/date-time:[[data-date-time-density=compact]_&]:pr-0">
          <div className="flex min-h-12 items-center justify-between mb-4.5 gap-3 @max-[680px]/date-time:gap-1.5 [[data-date-time-density=compact]_&]:min-h-7.5 [[data-date-time-density=compact]_&]:mb-2.5 [[data-date-time-density=compact]_&]:gap-1.5">
            <button
              type="button"
              ref={monthToggleRef}
              className="inline-flex items-center min-w-0 rounded-[8px] text-[23px] font-[750] text-left px-2 py-1.5 gap-2.5 [&_svg]:shrink-0 [&_svg]:[transition:transform_150ms] @max-[680px]/date-time:text-[20px] @max-[680px]/date-time:gap-1.5 [[data-date-time-density=compact]_&]:text-[14px] [[data-date-time-density=compact]_&]:p-1 [[data-date-time-density=compact]_&]:gap-[5px] [[data-date-time-density=compact]_&_svg]:w-3.5 [[data-date-time-density=compact]_&_svg]:h-3.5"
              disabled={inactive}
              aria-label={`${copy.chooseMonth}: ${monthTitle}`}
              aria-expanded={choosingMonth}
              aria-controls={`${id}-calendar`}
              onClick={() => setChoosingMonth((current) => !current)}
            >
              <span aria-live="polite">{monthTitle}</span>
              <ChevronDown
                size={19}
                className={` ${(choosingMonth) ? ("[transform:rotate(180deg)]") : ("")}`}
              />
            </button>
            <div className="flex gap-2.5 @max-[680px]/date-time:gap-1.5 [[data-date-time-density=compact]_&]:shrink-0 [[data-date-time-density=compact]_&]:gap-[5px]">
              <button
                type="button"
                aria-label={copy.previous}
                disabled={inactive || !monthAvailable(previousMonth)}
                className="grid w-11.5 h-11.5 place-items-center rounded-[10px] bg-[#fff] border border-[var(--dt-border)] border-solid @max-[680px]/date-time:w-9 @max-[680px]/date-time:h-9.5 [[data-date-time-density=compact]_&]:w-7 [[data-date-time-density=compact]_&]:h-7 [[data-date-time-density=compact]_&]:rounded-[7px] [[data-date-time-density=compact]_&_svg]:w-4 [[data-date-time-density=compact]_&_svg]:h-4"
                onClick={() => setMonth(previousMonth)}
              >
                <ChevronLeft size={23} />
              </button>
              <button
                type="button"
                aria-label={copy.next}
                disabled={inactive || !monthAvailable(nextMonth)}
                className="grid w-11.5 h-11.5 place-items-center rounded-[10px] bg-[#fff] border border-[var(--dt-border)] border-solid @max-[680px]/date-time:w-9 @max-[680px]/date-time:h-9.5 [[data-date-time-density=compact]_&]:w-7 [[data-date-time-density=compact]_&]:h-7 [[data-date-time-density=compact]_&]:rounded-[7px] [[data-date-time-density=compact]_&_svg]:w-4 [[data-date-time-density=compact]_&_svg]:h-4"
                onClick={() => setMonth(nextMonth)}
              >
                <ChevronRight size={23} />
              </button>
            </div>
          </div>

          <div id={`${id}-calendar`}>
            {choosingMonth ? (
              <div className="flex min-h-91 flex-col justify-center gap-5 @max-[680px]/date-time:min-h-80 [[data-date-time-density=compact]_&]:min-h-[223px] [[data-date-time-density=compact]_&]:gap-3">
                <label className="flex items-center justify-center text-[var(--dt-muted)] gap-3 [&_input]:w-27.5 [&_input]:rounded-[8px] [&_input]:bg-[#f7faff] [&_input]:text-[#0c1b3c] [&_input]:border [&_input]:border-[var(--dt-border)] [&_input]:border-solid [&_input]:px-2.5 [&_input]:py-[9px] [&_input:focus-visible]:[outline:2px_solid_var(--dt-blue)] [&_input:focus-visible]:[outline-offset:3px] [[data-date-time-density=compact]_&]:gap-2 [[data-date-time-density=compact]_&_input]:w-22.5 [[data-date-time-density=compact]_&_input]:px-2 [[data-date-time-density=compact]_&_input]:py-1.5">
                  {copy.year}
                  <input
                    type="number"
                    min={1}
                    max={9999}
                    value={month.getFullYear()}
                    disabled={inactive}
                    onChange={(event) => {
                      const year = Number(event.target.value);
                      if (Number.isInteger(year) && year >= 1 && year <= 9999)
                        setMonth(localDate(year, month.getMonth(), 1));
                    }}
                  />
                </label>
                <div className="grid grid-cols-3 gap-2 [[data-date-time-density=compact]_&]:gap-[5px]">
                  {Array.from({ length: 12 }, (_, index) => {
                    const candidate = localDate(month.getFullYear(), index, 1);
                    return (
                      <button
                        type="button"
                        key={index}
                        className="rounded-[8px] text-[14px] px-1 py-3 [&[aria-pressed=true]]:bg-[#eaf2ff] [&[aria-pressed=true]]:text-[var(--dt-blue)] [&[aria-pressed=true]]:font-bold [[data-date-time-density=compact]_&]:text-[12px] [[data-date-time-density=compact]_&]:px-[3px] [[data-date-time-density=compact]_&]:py-2"
                        aria-pressed={month.getMonth() === index}
                        disabled={inactive || !monthAvailable(candidate)}
                        onClick={() => {
                          setMonth(candidate);
                          setChoosingMonth(false);
                          monthToggleRef.current?.focus();
                        }}
                      >
                        {new Intl.DateTimeFormat(locale, {
                          month: "short",
                        }).format(candidate)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-7 text-center mb-2 rounded-[8px] bg-[#eaf2ff] text-[#1d4ed8] shadow-[inset_0_-1px_0_#d6e4fb] font-bold [&_span]:px-0 [&_span]:py-2 [[data-date-time-density=compact]_&]:mb-1 [[data-date-time-density=compact]_&]:rounded-[6px] [[data-date-time-density=compact]_&]:text-[12px] [[data-date-time-density=compact]_&_span]:px-0 [[data-date-time-density=compact]_&_span]:py-1" aria-hidden="true">
                  {copy.weekdays.map((day) => (
                    <span key={day} className={day === copy.weekdays[0] ? "text-red-500" : undefined}>{day}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 text-center">
                  {days.map((day) => {
                    const key = toDateValue(day);
                    return (
                      <button
                        key={key}
                        type="button"
                        ref={(element) => {
                          if (element) dayButtons.current.set(key, element);
                          else dayButtons.current.delete(key);
                        }}
                        aria-label={fullDate.format(day)}
                        aria-pressed={Boolean(
                          selectedDate && isSameDate(day, selectedDate),
                        )}
                        aria-current={
                          isSameDate(day, today) ? "date" : undefined
                        }
                        disabled={
                          inactive || !isDayAvailable(day, minimum, maximum)
                        }
                        tabIndex={tabStop && isSameDate(day, tabStop) ? 0 : -1}
                        className={`grid w-full max-w-12 aspect-square place-items-center justify-self-center rounded-[10px] text-[18px] tabular-nums mx-0 my-0.5 [&[aria-current=date]:not([aria-pressed=true])]:shadow-[inset_0_0_0_1px_var(--dt-blue)] [&[aria-current=date]:not([aria-pressed=true])]:text-[var(--dt-blue)] [&[aria-pressed=true]]:[background:var(--dt-blue)] [&[aria-pressed=true]]:text-[#fff] [&[aria-pressed=true]]:font-bold [&[aria-pressed=true]]:shadow-[inset_0_1px_3px_#ffffff22] @max-[680px]/date-time:max-w-11 @max-[680px]/date-time:text-[16px] [[data-date-time-density=compact]_&]:max-w-7.5 [[data-date-time-density=compact]_&]:rounded-[7px] [[data-date-time-density=compact]_&]:text-[13px] [[data-date-time-density=compact]_&]:mx-0 [[data-date-time-density=compact]_&]:my-px ${(day.getMonth() !== month.getMonth()) ? ("text-[#98a6be]") : ("")}`}
                        onFocus={() => setFocusedDay(key)}
                        onKeyDown={(event) => onDayKeyDown(event, day)}
                        onClick={() => selectDay(day)}
                      >
                        {day.getDate()}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          <div className="flex justify-between mt-4.5 [[data-date-time-density=compact]_&]:mt-2">
            <button
              type="button"
              className="rounded-[8px] text-[var(--dt-blue)] text-[17px] font-[550] px-2 py-1.5 [[data-date-time-density=compact]_&]:text-[13px] [[data-date-time-density=compact]_&]:p-1"
              disabled={disabled || !selectedDate}
              onClick={() => onChange(null)}
            >
              {copy.clear}
            </button>
            <button
              type="button"
              className="rounded-[8px] text-[var(--dt-blue)] text-[17px] font-[550] px-2 py-1.5 [[data-date-time-density=compact]_&]:text-[13px] [[data-date-time-density=compact]_&]:p-1"
              disabled={inactive || !isDayAvailable(today, minimum, maximum)}
              onClick={() => {
                setChoosingMonth(false);
                selectDay(new Date());
              }}
            >
              {copy.today}
            </button>
          </div>
        </div>

        <div className="flex min-w-0 flex-col pl-7 border-l [border-left-style:solid] border-l-[var(--dt-border)] @max-[680px]/date-time:mt-4.5 @max-[680px]/date-time:pt-4.5 @max-[680px]/date-time:pb-0 @max-[680px]/date-time:border-t @max-[680px]/date-time:[border-top-style:solid] @max-[680px]/date-time:border-t-[var(--dt-border)] @max-[680px]/date-time:border-l-0 @max-[680px]/date-time:[border-left-style:none] @max-[680px]/date-time:border-l-[currentColor] @max-[680px]/date-time:px-0 [[data-date-time-density=compact]_&]:mt-0 [[data-date-time-density=compact]_&]:pr-0 [[data-date-time-density=compact]_&]:pl-3 [[data-date-time-density=compact]_&]:border-t-0 [[data-date-time-density=compact]_&]:[border-top-style:none] [[data-date-time-density=compact]_&]:border-t-[currentColor] [[data-date-time-density=compact]_&]:border-l [[data-date-time-density=compact]_&]:[border-left-style:solid] [[data-date-time-density=compact]_&]:border-l-[var(--dt-border)] [[data-date-time-density=compact]_&]:py-0 @max-[500px]/date-time:[[data-date-time-density=compact]_&]:mt-3 @max-[500px]/date-time:[[data-date-time-density=compact]_&]:pt-3 @max-[500px]/date-time:[[data-date-time-density=compact]_&]:pb-0 @max-[500px]/date-time:[[data-date-time-density=compact]_&]:border-t @max-[500px]/date-time:[[data-date-time-density=compact]_&]:[border-top-style:solid] @max-[500px]/date-time:[[data-date-time-density=compact]_&]:border-t-[var(--dt-border)] @max-[500px]/date-time:[[data-date-time-density=compact]_&]:border-l-0 @max-[500px]/date-time:[[data-date-time-density=compact]_&]:[border-left-style:none] @max-[500px]/date-time:[[data-date-time-density=compact]_&]:border-l-[currentColor] @max-[500px]/date-time:[[data-date-time-density=compact]_&]:px-0">
          <h3 className="flex items-center min-h-12 mt-0 mb-4.5 text-[24px] font-[750] mx-0 @max-[680px]/date-time:min-h-auto @max-[680px]/date-time:mb-3.5 @max-[680px]/date-time:text-[21px] [[data-date-time-density=compact]_&]:min-h-7.5 [[data-date-time-density=compact]_&]:mb-2.5 [[data-date-time-density=compact]_&]:text-[16px]">{copy.time}</h3>
          <div className="grid grid-cols-3 flex-1 gap-2.5 [[data-date-time-density=compact]_&]:gap-1.5">
            <DateTimeColumn
              label={copy.hour}
              value={displayHour}
              disabled={inactive}
              options={Array.from({ length: 12 }, (_, index) => ({
                value: index + 1,
                label: String(index + 1).padStart(2, "0"),
                disabled: !timeInHour(
                  active,
                  ((index + 1) % 12) + period * 12,
                  minimum,
                  maximum,
                ),
              }))}
              onChange={(nextHour) => {
                const next = timeInHour(
                  active,
                  (nextHour % 12) + period * 12,
                  minimum,
                  maximum,
                );
                if (next) emit(next);
              }}
            />
            <DateTimeColumn
              label={copy.minute}
              value={minute}
              disabled={inactive}
              options={Array.from({ length: 60 }, (_, index) => {
                const candidate = new Date(active);
                candidate.setMinutes(index, 0, 0);
                return {
                  value: index,
                  label: String(index).padStart(2, "0"),
                  disabled:
                    candidate.getTime() < minimum ||
                    candidate.getTime() > maximum,
                };
              })}
              onChange={(nextMinute) => {
                const next = new Date(active);
                next.setMinutes(nextMinute, 0, 0);
                emit(next);
              }}
            />
            <DateTimeColumn
              label={copy.period}
              value={period}
              disabled={inactive}
              compact
              options={[0, 1].map((nextPeriod) => ({
                value: nextPeriod,
                label: nextPeriod === 0 ? "AM" : "PM",
                disabled: !Array.from({ length: 12 }, (_, index) =>
                  timeInHour(active, index + nextPeriod * 12, minimum, maximum),
                ).some(Boolean),
              }))}
              onChange={(nextPeriod) => {
                const preferred = timeInHour(
                  active,
                  (hour % 12) + nextPeriod * 12,
                  minimum,
                  maximum,
                );
                const next =
                  preferred ??
                  Array.from({ length: 12 }, (_, index) =>
                    timeInHour(
                      active,
                      index + nextPeriod * 12,
                      minimum,
                      maximum,
                    ),
                  ).find(Boolean);
                if (next) emit(next);
              }}
            />
          </div>
          {showSummary && <output
            className="flex items-center min-h-15.5 mt-5 pt-4.5 border-t [border-top-style:solid] border-t-[var(--dt-border)] text-[23px] font-semibold tabular-nums gap-3.5 [&_svg]:shrink-0 [&_svg]:text-[var(--dt-blue)] @max-[680px]/date-time:mt-4 @max-[680px]/date-time:text-[21px] [[data-date-time-density=compact]_&]:min-h-8.5 [[data-date-time-density=compact]_&]:mt-3 [[data-date-time-density=compact]_&]:pt-2.5 [[data-date-time-density=compact]_&]:text-[17px] [[data-date-time-density=compact]_&]:gap-2 [[data-date-time-density=compact]_&_svg]:w-[21px] [[data-date-time-density=compact]_&_svg]:h-[21px]"
            aria-live="polite"
            aria-atomic="true"
          >
            <Clock3 size={29} strokeWidth={1.7} />
            <span>
              {selectedDate
                ? `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period ? "PM" : "AM"}`
                : "--:--"}
            </span>
          </output>}
        </div>
      </div>
    </section>
  );
}
