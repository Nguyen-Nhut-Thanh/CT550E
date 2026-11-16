"use client";

import { Building2, Car, Hotel } from "lucide-react";

export type ServicesTab = "hotels" | "transports" | "providers";

export interface ServicesTabSwitcherProps {
  activeTab: ServicesTab;
  onChangeTab: (tab: ServicesTab) => void;
  counts: {
    hotels: number;
    transports: number;
    providers: number;
  };
}

export function ServicesTabSwitcher({
  activeTab,
  onChangeTab,
  counts,
}: ServicesTabSwitcherProps) {
  return (
    <div className="flex border-b border-slate-200">
      <button
        type="button"
        onClick={() => onChangeTab("hotels")}
        className={`relative flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold transition cursor-pointer ${
          activeTab === "hotels"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Hotel size={18} />
        <span>Khách sạn &amp; Chỗ nghỉ</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
          {counts.hotels}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChangeTab("transports")}
        className={`relative flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold transition cursor-pointer ${
          activeTab === "transports"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Car size={18} />
        <span>Phương tiện di chuyển</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
          {counts.transports}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChangeTab("providers")}
        className={`relative flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold transition cursor-pointer ${
          activeTab === "providers"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        <Building2 size={18} />
        <span>Nhà cung cấp / Đối tác</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
          {counts.providers}
        </span>
      </button>
    </div>
  );
}

