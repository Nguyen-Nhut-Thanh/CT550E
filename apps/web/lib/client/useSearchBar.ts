"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BUDGET_OPTIONS,
  buildCalendarDays,
  fromDateValue,
  startOfDay,
  toDateValue,
} from "./searchBar.utils";

export function useSearchBar() {
  const router = useRouter();
  const today = useMemo(() => startOfDay(new Date()), []);
  const defaultDate = useMemo(() => {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }, [today]);

  const [keyword, setKeyword] = useState("");
  const [dateValue, setDateValue] = useState(toDateValue(defaultDate));
  const [budgetIndex, setBudgetIndex] = useState(0);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(defaultDate.getFullYear(), defaultDate.getMonth(), 1),
  );

  const selectedDate = fromDateValue(dateValue);
  const calendarDays = useMemo(
    () => buildCalendarDays(calendarMonth),
    [calendarMonth],
  );
  const budget = BUDGET_OPTIONS[budgetIndex];
  const isValid = keyword.trim().length > 0 && budgetIndex > 0;

  useEffect(() => {
    const closeCalendar = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-search-calendar]")) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", closeCalendar);
    return () => document.removeEventListener("mousedown", closeCalendar);
  }, []);

  const selectDate = (date: Date) => {
    if (startOfDay(date) < today) return;
    setDateValue(toDateValue(date));
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setIsCalendarOpen(false);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    const params = new URLSearchParams({
      destination: keyword.trim(),
      date_from: dateValue,
    });
    if (budget.minPrice) params.set("min_price", budget.minPrice);
    if (budget.maxPrice) params.set("max_price", budget.maxPrice);
    router.push(`/tours?${params.toString()}`);
  };

  const selectBudget = (label: string) => {
    const nextIndex = BUDGET_OPTIONS.findIndex(
      (option) => option.label === label,
    );
    if (nextIndex >= 0) setBudgetIndex(nextIndex);
  };

  return {
    state: {
      keyword,
      selectedDate,
      calendarMonth,
      calendarDays,
      budgetIndex,
      budget,
      isCalendarOpen,
      isValid,
      today,
    },
    actions: {
      setKeyword,
      setBudgetIndex,
      setCalendarMonth,
      setIsCalendarOpen,
      selectBudget,
      selectDate,
      submit,
    },
  };
}
