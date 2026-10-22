import type * as ReactTypes from 'react';

export type BudgetOption = {
  label: string;
  minPrice?: string;
  maxPrice?: string;
};

export type CalendarDay = {
  key: string;
  date: Date | null;
  dayNumber: number | null;
};

export type SearchBarCalendarProps = {
  selectedDate: Date;
  calendarMonth: Date;
  calendarDays: CalendarDay[];
  today: Date;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
};

export type UseSearchBarBudgetOption = {
  label: string;
  min_price?: string;
  max_price?: string;
};

export type UseSearchBarCalendarDay = {
  key: string;
  date: Date | null;
  dayNumber: number | null;
  isCurrentMonth: boolean;
};

export interface UseSearchBarProps {
  budgetDropdownRef: ReactTypes.RefObject<HTMLDivElement | null>;
  calendarDropdownRef: ReactTypes.RefObject<HTMLDivElement | null>;
}
