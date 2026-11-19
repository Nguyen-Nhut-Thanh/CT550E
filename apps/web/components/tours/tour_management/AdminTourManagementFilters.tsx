"use client";

import { useState } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { AdminSearchInput } from "@/components/common/admin_shared/tables/AdminSearchInput";
import {
  TOUR_STATUS_OPTIONS,
  TOUR_TYPE_OPTIONS,
} from "@/lib/tours/admin/filters";
import {
  DEFAULT_TOUR_FILTERS,
  type TourManagementFilters as Filters,
} from "@/lib/tours/admin/management";

export function TourManagementFilters({
  value,
  onChange,
  countries,
}: {
  value: Filters;
  onChange: (value: Filters) => void;
  countries: { location_id: number; name: string }[];
}) {
  const [expanded, setExpanded] = useState(false);
  const update = (key: keyof Filters, next: string) =>
    onChange({ ...value, [key]: next });
  const active = Object.entries(value).some(
    ([key, next]) => next !== DEFAULT_TOUR_FILTERS[key as keyof Filters],
  );
  return (
    <section
      className="ui-tour-management-filters rounded-[14px] border border-[#e1edfc] bg-white p-4 shadow-2xs"
      aria-label="Bộ lọc tour"
    >
      <div className="ui-tour-management-filterRow flex flex-wrap items-center gap-3">
        <div className="min-w-[260px] flex-1">
          <AdminSearchInput
            value={value.search}
            onChange={(next) => update("search", next)}
            placeholder="Tìm theo tên tour, mã tour hoặc từ khóa..."
          />
        </div>
        <div className="min-w-[150px] w-auto">
          <CustomDropdown
            variant="compact"
            matchTriggerWidth
            selectedValue={value.type}
            onSelect={(next) => update("type", next)}
            options={TOUR_TYPE_OPTIONS.map((option) => ({
              value: option.id,
              label: option.id === "all" ? "Tất cả loại tour" : option.label,
            }))}
          />
        </div>
        <div className="min-w-[150px] w-auto">
          <CustomDropdown
            variant="compact"
            matchTriggerWidth
            selectedValue={value.country}
            onSelect={(next) => update("country", next)}
            options={[
              { value: "all", label: "Tất cả quốc gia" },
              ...countries.map((country) => ({
                value: String(country.location_id),
                label: country.name,
              })),
            ]}
          />
        </div>
        <div className="min-w-[140px] w-auto">
          <CustomDropdown
            variant="compact"
            matchTriggerWidth
            selectedValue={value.status}
            onSelect={(next) => update("status", next)}
            options={TOUR_STATUS_OPTIONS.map((option) => ({
              value: option.id,
              label: option.label,
            }))}
          />
        </div>
        <button
          type="button"
          className="ui-tour-management-filterButton inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-[650] text-slate-700 transition cursor-pointer whitespace-nowrap shadow-2xs"
          aria-expanded={expanded}
          aria-controls="tour-advanced-filters"
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal size={15} className="text-slate-500" />
          <span>Bộ lọc nâng cao</span>
          {(value.duration !== "all" || value.sort !== "default") && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#075bff]" />
          )}
        </button>
        {active && (
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-2.5 text-xs font-[650] text-[#7387aa] hover:text-[#075bff] transition cursor-pointer whitespace-nowrap shadow-2xs"
            onClick={() => onChange({ ...DEFAULT_TOUR_FILTERS })}
          >
            <RotateCcw size={14} />
            <span>Đặt lại</span>
          </button>
        )}
      </div>
      {expanded && (
        <div
          id="tour-advanced-filters"
          className="ui-tour-management-advanced grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#edf2fb] mt-3"
        >
          <CustomDropdown
            label="Thời gian tour"
            variant="compact"
            matchTriggerWidth
            selectedValue={value.duration}
            onSelect={(next) => update("duration", next)}
            options={[
              { value: "all", label: "Tất cả thời gian" },
              { value: "short", label: "Tối đa 2 ngày" },
              { value: "medium", label: "Từ 3 đến 5 ngày" },
              { value: "long", label: "Trên 5 ngày" },
            ]}
          />
          <CustomDropdown
            label="Sắp xếp"
            variant="compact"
            matchTriggerWidth
            selectedValue={value.sort}
            onSelect={(next) => update("sort", next)}
            options={[
              { value: "default", label: "Cập nhật gần nhất" },
              { value: "priceAsc", label: "Giá tăng dần" },
              { value: "priceDesc", label: "Giá giảm dần" },
              { value: "name", label: "Tên tour A–Z" },
            ]}
          />
        </div>
      )}
    </section>
  );
}
