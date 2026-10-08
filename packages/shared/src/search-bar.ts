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
