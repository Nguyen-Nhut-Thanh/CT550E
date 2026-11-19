"use client";

import type { VoucherStatusFilter, VoucherStatusFilterTabsProps } from "shared";

const tabs: { value: VoucherStatusFilter; label: string; active: string }[] = [
  { value: "all", label: "Tất cả", active: "bg-slate-900 text-white shadow-xs" },
  { value: "active", label: "Đang hoạt động", active: "bg-emerald-600 text-white shadow-xs" },
  { value: "locked", label: "Tạm khóa", active: "bg-red-600 text-white shadow-xs" },
  { value: "upcoming", label: "Sắp có hiệu lực", active: "bg-blue-600 text-white shadow-xs" },
  { value: "expired", label: "Hết hạn", active: "bg-amber-500 text-white shadow-xs" },
  { value: "exhausted", label: "Hết lượt", active: "bg-amber-500 text-white shadow-xs" },
];

export function VoucherStatusFilterTabs({ value, onChange }: VoucherStatusFilterTabsProps) {
  return (
    <div
      role="group"
      aria-label="Lọc trạng thái voucher"
      className="flex w-fit max-w-full flex-wrap items-center gap-1 sm:gap-1.5 rounded-xl border border-[#e1edfc] bg-white p-1 shadow-2xs"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          aria-pressed={value === tab.value}
          className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
            value === tab.value
              ? tab.active
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
