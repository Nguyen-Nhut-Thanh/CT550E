"use client";

import {
  displayBirthday,
  getAgeCutoffs,
  getTravelerAgeRequirementText,
  isDayDisabled,
  isMonthDisabled,
  isYearDisabled,
} from "@/lib/booking/client/birthday";
import { CalendarDays, RotateCcw, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { TravelerType } from "shared";

interface ThreeColumnDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  id?: string;
  travelerType: TravelerType;
  departureDate?: string | Date | null;
  hasError?: boolean;
}

export function ThreeColumnDatePicker({
  value,
  onChange,
  label = "Ngày sinh",
  id,
  travelerType,
  departureDate,
  hasError = false,
}: ThreeColumnDatePickerProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const dayColRef = useRef<HTMLDivElement>(null);
  const monthColRef = useRef<HTMLDivElement>(null);
  const yearColRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<"bottom" | "top">("bottom");
  const [alignRight, setAlignRight] = useState(false);

  const cutoffs = useMemo(
    () => getAgeCutoffs(departureDate),
    [departureDate],
  );

  // Parse current value into day, month, year
  const parsed = useMemo(() => {
    if (!value || !value.trim()) return null;
    const disp = displayBirthday(value);
    const parts = disp.split("/");
    if (parts.length === 3) {
      const d = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const y = parseInt(parts[2], 10);
      if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
        return { day: d, month: m, year: y };
      }
    }
    return null;
  }, [value]);

  // Default selection state for the picker
  const defaultYear = useMemo(() => {
    if (parsed) return parsed.year;
    if (travelerType === "adult") return cutoffs.maxAdultBirthDate.getFullYear();
    if (travelerType === "child") {
      return Math.round(
        (cutoffs.minChildBirthDate.getFullYear() +
          cutoffs.maxChildBirthDate.getFullYear()) /
          2,
      );
    }
    return cutoffs.maxInfantBirthDate.getFullYear();
  }, [parsed, travelerType, cutoffs]);

  const defaultMonth = useMemo(() => {
    if (parsed) return parsed.month;
    if (travelerType === "adult") return cutoffs.maxAdultBirthDate.getMonth() + 1;
    return 1;
  }, [parsed, travelerType, cutoffs]);

  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(defaultMonth);
  const [selectedDay, setSelectedDay] = useState<number | null>(parsed?.day ?? null);

  // Sync internal state when external value changes
  useEffect(() => {
    if (parsed) {
      setSelectedYear(parsed.year);
      setSelectedMonth(parsed.month);
      setSelectedDay(parsed.day);
    } else {
      setSelectedDay(null);
    }
  }, [parsed]);

  // Dynamic positioning: check if there's enough space below or if we should open upwards
  const handleToggle = () => {
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const popupHeight = 360;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // If space below is not enough to fit popup (< 360px) and there's more space above, open upwards
      if (spaceBelow < popupHeight && spaceAbove > spaceBelow) {
        setPlacement("top");
      } else {
        setPlacement("bottom");
      }

      // Check horizontal overflow
      if (rect.left + 330 > window.innerWidth && rect.right >= 320) {
        setAlignRight(true);
      } else {
        setAlignRight(false);
      }
    }
    setIsOpen((prev) => !prev);
  };

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  // Smooth local container scroll (without using scrollIntoView which jerks the entire browser window)
  useEffect(() => {
    if (!isOpen) return;

    const scrollColumnToValue = (
      container: HTMLElement | null,
      val: number | null,
    ) => {
      if (!container || val === null) return;
      const target = container.querySelector<HTMLElement>(
        `[data-value="${val}"]`,
      );
      if (!target) return;
      const targetTop = target.offsetTop;
      const targetHeight = target.offsetHeight;
      const containerHeight = container.clientHeight;
      container.scrollTop = targetTop - containerHeight / 2 + targetHeight / 2;
    };

    const timer = setTimeout(() => {
      scrollColumnToValue(yearColRef.current, selectedYear);
      scrollColumnToValue(monthColRef.current, selectedMonth);
      scrollColumnToValue(dayColRef.current, selectedDay);
    }, 15);

    return () => clearTimeout(timer);
  }, [isOpen, selectedYear, selectedMonth, selectedDay]);

  // List of years to display: from currentYear down to 1920
  const yearList = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const minYear = 1920;
    const years: number[] = [];
    for (let y = currentYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, []);

  // Number of days in currently selected year & month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  const handleSelectYear = (year: number) => {
    if (isYearDisabled(year, travelerType, cutoffs)) return;
    setSelectedYear(year);

    // If current month is now disabled in the new year, pick first valid month
    if (isMonthDisabled(year, selectedMonth, travelerType, cutoffs)) {
      for (let m = 1; m <= 12; m++) {
        if (!isMonthDisabled(year, m, travelerType, cutoffs)) {
          setSelectedMonth(m);
          break;
        }
      }
    }

    // If day is now invalid or disabled, clear day
    if (
      selectedDay !== null &&
      (selectedDay > new Date(year, selectedMonth, 0).getDate() ||
        isDayDisabled(year, selectedMonth, selectedDay, travelerType, cutoffs))
    ) {
      setSelectedDay(null);
    }
  };

  const handleSelectMonth = (month: number) => {
    if (isMonthDisabled(selectedYear, month, travelerType, cutoffs)) return;
    setSelectedMonth(month);

    // Check if current day is still valid
    const maxDays = new Date(selectedYear, month, 0).getDate();
    if (
      selectedDay !== null &&
      (selectedDay > maxDays ||
        isDayDisabled(selectedYear, month, selectedDay, travelerType, cutoffs))
    ) {
      setSelectedDay(null);
    }
  };

  const handleSelectDay = (day: number) => {
    if (isDayDisabled(selectedYear, selectedMonth, day, travelerType, cutoffs))
      return;
    setSelectedDay(day);

    const dd = String(day).padStart(2, "0");
    const mm = String(selectedMonth).padStart(2, "0");
    const yyyy = String(selectedYear);
    const dateFormatted = `${dd}/${mm}/${yyyy}`;

    onChange(dateFormatted);
    setIsOpen(false);
  };

  const handleReset = () => {
    setSelectedDay(null);
    setSelectedYear(defaultYear);
    setSelectedMonth(defaultMonth);
    onChange("");
  };

  const requirementText = getTravelerAgeRequirementText(
    travelerType,
    departureDate,
  );

  return (
    <div ref={containerRef} className="relative min-w-0">
      {/* Input Trigger Button (Matches the Vietravel reference design) */}
      <div
        id={inputId}
        role="button"
        tabIndex={0}
        aria-label={`${label}, chọn ngày sinh`}
        aria-expanded={isOpen}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={`group flex min-h-[46px] w-full cursor-pointer items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition outline-none select-none ${
          hasError
            ? "border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-100"
            : isOpen
              ? "border-blue-500 bg-white shadow-sm ring-2 ring-blue-100"
              : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/60 focus:border-blue-400 focus:bg-white"
        }`}
      >
        <div className="flex items-center gap-2 font-medium tracking-wide">
          <span
            className={`transition-colors ${
              selectedDay ? "font-bold text-slate-900" : "text-slate-400"
            }`}
          >
            {selectedDay ? String(selectedDay).padStart(2, "0") : "dd"}
          </span>
          <span className="text-slate-300 font-normal">/</span>
          <span
            className={`transition-colors ${
              selectedDay || parsed?.month
                ? "font-bold text-slate-900"
                : "text-slate-400"
            }`}
          >
            {selectedDay || parsed?.month
              ? String(selectedMonth).padStart(2, "0")
              : "mm"}
          </span>
          <span className="text-slate-300 font-normal">/</span>
          <span
            className={`transition-colors ${
              selectedDay || parsed?.year
                ? "font-bold text-slate-900"
                : "text-slate-400"
            }`}
          >
            {selectedDay || parsed?.year ? String(selectedYear) : "yyyy"}
          </span>
        </div>

        <CalendarDays className="h-4 w-4 text-slate-400 transition-colors group-hover:text-blue-600 shrink-0" />
      </div>

      {/* 3-Column Dropdown Picker Popup */}
      {isOpen && (
        <div
          className={`absolute z-50 w-[305px] sm:w-[330px] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_16px_40px_rgba(15,23,42,0.16)] animate-in fade-in zoom-in-95 duration-100 ${
            placement === "top" ? "bottom-full mb-2" : "top-full mt-2"
          } ${alignRight ? "right-0" : "left-0"}`}
        >
          {/* Header Note: Requirements */}
          <div className="mb-2.5 flex items-center justify-between gap-1.5 rounded-lg bg-blue-50/90 border border-blue-200/60 px-2.5 py-1.5 text-[11px] font-semibold text-blue-800">
            <span className="truncate">ℹ️ {requirementText}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 rounded p-0.5"
              aria-label="Đóng bảng chọn ngày"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 3 Columns Side-by-Side */}
          <div className="grid grid-cols-3 gap-1.5 text-center">
            {/* Column 1: Ngày (Day) */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <div className="bg-slate-50 border-b border-slate-100 py-1 text-[11px] font-bold text-slate-500">
                Ngày
              </div>
              <div
                ref={dayColRef}
                className="h-56 overflow-y-auto p-1 divide-y divide-slate-50 scrollbar-thin scrollbar-thumb-slate-200"
              >
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                  (day) => {
                    const disabled = isDayDisabled(
                      selectedYear,
                      selectedMonth,
                      day,
                      travelerType,
                      cutoffs,
                    );
                    const isSelected = selectedDay === day;

                    return (
                      <button
                        key={`day-${day}`}
                        type="button"
                        data-value={day}
                        disabled={disabled}
                        title={
                          disabled
                            ? "Ngày sinh không phù hợp với độ tuổi quy định"
                            : `Ngày ${day}`
                        }
                        onClick={() => handleSelectDay(day)}
                        className={`w-full py-1.5 text-xs font-semibold transition-all rounded-lg my-0.5 ${
                          disabled
                            ? "cursor-not-allowed text-slate-300 bg-slate-50/40 opacity-40 hover:bg-slate-50 select-none"
                            : isSelected
                              ? "bg-blue-50 text-blue-700 font-extrabold border border-blue-200/80 shadow-2xs"
                              : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {/* Column 2: Tháng (Month) */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <div className="bg-slate-50 border-b border-slate-100 py-1 text-[11px] font-bold text-slate-500">
                Tháng
              </div>
              <div
                ref={monthColRef}
                className="h-56 overflow-y-auto p-1 divide-y divide-slate-50 scrollbar-thin scrollbar-thumb-slate-200"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                  const disabled = isMonthDisabled(
                    selectedYear,
                    month,
                    travelerType,
                    cutoffs,
                  );
                  const isSelected = selectedMonth === month;

                  return (
                    <button
                      key={`month-${month}`}
                      type="button"
                      data-value={month}
                      disabled={disabled}
                      title={
                        disabled
                          ? "Tháng sinh không phù hợp với độ tuổi quy định"
                          : `Tháng ${month}`
                      }
                      onClick={() => handleSelectMonth(month)}
                      className={`w-full py-1.5 text-xs font-semibold transition-all rounded-lg my-0.5 ${
                        disabled
                          ? "cursor-not-allowed text-slate-300 bg-slate-50/40 opacity-40 hover:bg-slate-50 select-none"
                          : isSelected
                            ? "bg-blue-50 text-blue-700 font-extrabold border border-blue-200/80 shadow-2xs"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                      }`}
                    >
                      Thg {month}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Năm (Year) */}
            <div className="flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
              <div className="bg-slate-50 border-b border-slate-100 py-1 text-[11px] font-bold text-slate-500">
                Năm
              </div>
              <div
                ref={yearColRef}
                className="h-56 overflow-y-auto p-1 divide-y divide-slate-50 scrollbar-thin scrollbar-thumb-slate-200"
              >
                {yearList.map((year) => {
                  const disabled = isYearDisabled(
                    year,
                    travelerType,
                    cutoffs,
                  );
                  const isSelected = selectedYear === year;

                  return (
                    <button
                      key={`year-${year}`}
                      type="button"
                      data-value={year}
                      disabled={disabled}
                      title={
                        disabled
                          ? "Năm sinh không phù hợp với độ tuổi quy định"
                          : `Năm ${year}`
                      }
                      onClick={() => handleSelectYear(year)}
                      className={`w-full py-1.5 text-xs font-semibold transition-all rounded-lg my-0.5 ${
                        disabled
                          ? "cursor-not-allowed text-slate-300 bg-slate-50/40 opacity-40 hover:bg-slate-50 select-none"
                          : isSelected
                            ? "bg-blue-50 text-blue-700 font-extrabold border border-blue-200/80 shadow-2xs"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                      }`}
                    >
                      {year}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer: Reset & Close */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Đặt lại</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-blue-600 px-3.5 py-1 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
