import type { CalendarDay } from "../common/calendar";
export type BudgetOption = {
    label: string;
    minPrice?: string;
    maxPrice?: string;
};
export type UseSearchBarBudgetOption = {
    label: string;
    min_price?: string;
    max_price?: string;
};
export type UseSearchBarCalendarDay = CalendarDay & {
    isCurrentMonth: boolean;
};
