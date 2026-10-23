import type { BudgetOption } from "shared";

export const BUDGET_OPTIONS: BudgetOption[] = [
  { label: "Chọn mức giá" },
  { label: "Dưới 5 triệu", maxPrice: "5000000" },
  { label: "Từ 5 - 10 triệu", minPrice: "5000000", maxPrice: "10000000" },
  { label: "Từ 10 - 20 triệu", minPrice: "10000000", maxPrice: "20000000" },
  { label: "Trên 20 triệu", minPrice: "20000000" },
] as const;
