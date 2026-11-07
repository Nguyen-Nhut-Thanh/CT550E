"use client";

import type { VoucherStatusFilter, VoucherStatusFilterTabsProps } from "shared";

const tabs: { value: VoucherStatusFilter; label: string; active: string }[] = [
  { value: "all", label: "Tất cả", active: "bg-slate-900 text-white" },
  { value: "active", label: "Đang hoạt động", active: "bg-emerald-600 text-white" },
  { value: "locked", label: "Tạm khóa", active: "bg-red-600 text-white" },
  { value: "upcoming", label: "Sắp có hiệu lực", active: "bg-blue-600 text-white" },
  { value: "expired", label: "Hết hạn", active: "bg-amber-500 text-white" },
  { value: "exhausted", label: "Hết lượt", active: "bg-amber-500 text-white" },
];

export function VoucherStatusFilterTabs({ value, onChange }: VoucherStatusFilterTabsProps) {
  return <div role="group" aria-label="Lọc trạng thái voucher" className="flex w-fit max-w-full flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">
    {tabs.map(tab => <button key={tab.value} type="button" onClick={() => onChange(tab.value)} aria-pressed={value === tab.value} className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${value === tab.value ? tab.active : "text-slate-500 hover:bg-slate-50"}`}>{tab.label}</button>)}
  </div>;
}
