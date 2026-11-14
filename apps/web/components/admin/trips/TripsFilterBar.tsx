"use client";

import CustomDropdown from "@/components/common/forms/CustomDropdown";
import { BriefcaseBusiness, CalendarDays } from "lucide-react";
import { WORKFORCE_REGIONS } from "shared";

export interface TripsFilterBarProps {
  isManager: boolean;
  mode: "all" | "mine";
  region: string;
  myTripsCount: number;
  totalTripsCount: number;
  onModeChange: (mode: "all" | "mine") => void;
  onRegionChange: (region: string) => void;
}

export function TripsFilterBar({
  isManager,
  mode,
  region,
  myTripsCount,
  totalTripsCount,
  onModeChange,
  onRegionChange,
}: TripsFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      {isManager ? (
        <div
          className="flex max-w-full gap-1 overflow-x-auto rounded-[14px] border border-blue-100/80 bg-white/95 p-1 shadow-xs"
          role="tablist"
          aria-label="Chế độ xem điều hành"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "all"}
            onClick={() => onModeChange("all")}
            className={`inline-flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-bold transition cursor-pointer ${
              mode === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <BriefcaseBusiness size={16} />
            <span>Tất cả chuyến điều hành ({totalTripsCount})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "mine"}
            onClick={() => onModeChange("mine")}
            className={`inline-flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-[13px] font-bold transition cursor-pointer ${
              mode === "mine"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <CalendarDays size={16} />
            <span>Chuyến của tôi ({myTripsCount})</span>
          </button>
        </div>
      ) : (
        <div className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-800">
          <BriefcaseBusiness size={16} className="text-blue-600" />
          <span>Chuyến được phân công cho bạn ({totalTripsCount})</span>
        </div>
      )}

      {isManager && mode === "all" && (
        <CustomDropdown
          ariaLabel="Lọc theo miền điều hành"
          variant="compact"
          matchTriggerWidth
          className="w-full sm:w-64 [&_button[aria-haspopup]]:min-w-0"
          selectedValue={region}
          onSelect={(val) => onRegionChange(val)}
          placeholder="Tất cả miền vận hành"
          options={[
            { value: "", label: "Tất cả miền vận hành" },
            ...Object.entries(WORKFORCE_REGIONS).map(([code, name]) => ({
              value: code,
              label: `${name} (${code})`,
            })),
          ]}
        />
      )}
    </div>
  );
}
