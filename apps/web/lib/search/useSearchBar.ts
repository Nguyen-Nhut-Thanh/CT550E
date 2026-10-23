"use client";

import { BUDGET_OPTIONS } from "@/lib/search/budgets";
import { fromDateValue, startOfDay, toDateValue } from "@/lib/utils/calendar";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
  const budget = BUDGET_OPTIONS[budgetIndex];
  const isValid = keyword.trim().length > 0 && budgetIndex > 0;

  const selectDate = (date: Date) => {
    if(startOfDay(date) < today) return;
    setDateValue(toDateValue(date));
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setIsCalendarOpen(false);
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if(!isValid) return;

    const params = new URLSearchParams({
      destination: keyword.trim(),
      date_from: dateValue,
    });
    if(budget.minPrice) params.set("min_price", budget.minPrice);
    if(budget.maxPrice) params.set("max_price", budget.maxPrice);
    router.push(`/tours?${params.toString()}`);
  };

  const selectBudget = (label: string) => {
    const nextIndex = BUDGET_OPTIONS.findIndex(
      (option) => option.label === label,
    );
    if(nextIndex >= 0) setBudgetIndex(nextIndex);
  };

  return {
    state: {
      keyword,
      selectedDate,
      calendarMonth,
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
