"use client";

import { useState } from "react";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import CustomDropdown from "@/components/common/CustomDropdown";
import { AdminSearchInput } from "@/components/common/AdminSearchInput";
import {
  TOUR_STATUS_OPTIONS,
  TOUR_TYPE_OPTIONS,
} from "@/lib/admin/tours/filters";
import {
  DEFAULT_TOUR_FILTERS,
  type TourManagementFilters as Filters,
} from "@/lib/admin/tours/management";

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
      className="ui-tour-management-filters [background:#ffffffdf] [border:1px_solid_#fff] rounded-[16px] p-[12px] [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:min-h-[42px] [&_button[aria-haspopup=listbox]]:[background:white] [&_button[aria-haspopup=listbox]]:[border-color:#e0e9f7] [&_button[aria-haspopup=listbox]]:rounded-[10px] [&_button[aria-haspopup=listbox]]:text-[13px] [&_button[aria-haspopup=listbox]]:p-[9px_12px]"
      aria-label="Bộ lọc tour"
    >
      <div className="ui-tour-management-filterRow grid grid-cols-[minmax(220px,_2.2fr)_repeat(3,_minmax(140px,_1fr))_auto] gap-[12px] items-center [&>*]:min-w-0 admin-max-1250:grid-cols-[repeat(3,_minmax(0,_1fr))] admin-max-1250:[&>:first-child]:[grid-column:span_2] admin-max-750:grid-cols-[repeat(2,_minmax(0,_1fr))] admin-max-750:gap-[10px] admin-max-750:[&>:first-child]:[grid-column:1/-1]">
        <AdminSearchInput
          value={value.search}
          onChange={(next) => update("search", next)}
          placeholder="Tìm theo tên tour, mã tour hoặc từ khóa..."
        />
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
        <button
          type="button"
          className="ui-tour-management-filterButton flex items-center justify-center gap-[8px] rounded-[10px] p-[12px] text-[#075bff] [background:#eaf3ff] text-[12px] font-semibold whitespace-nowrap [&:hover]:[background:#dceaff] admin-max-1250:[grid-column:3] admin-max-1250:[grid-row:1] admin-max-750:[grid-column:auto] admin-max-750:[grid-row:auto] admin-max-750:text-[11px]"
          aria-expanded={expanded}
          aria-controls="tour-advanced-filters"
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal size={18} /> Bộ lọc nâng cao
          {(value.duration !== "all" || value.sort !== "default") && (
            <span className="ui-tour-management-dot w-[6px] h-[6px] rounded-[50%] [background:#075bff]" />
          )}
        </button>
      </div>
      {expanded && (
        <div
          id="tour-advanced-filters"
          className="ui-tour-management-advanced [&>*]:min-w-0 grid grid-cols-[repeat(2,_minmax(0,_240px))] gap-[16px] p-[16px_0_3px] [border-top:1px_solid_#edf2f9] mt-[12px] [&_label]:block [&_label]:mb-[7px] [&_label]:text-[12px] admin-max-750:grid-cols-[1fr]"
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
      {active && (
        <button
          type="button"
          className="ui-tour-management-reset flex items-center gap-[6px] text-[#58749b] text-[12px] mt-[12px] p-[3px] [&:hover]:text-[#075bff]"
          onClick={() => onChange({ ...DEFAULT_TOUR_FILTERS })}
        >
          <RotateCcw size={14} /> Đặt lại bộ lọc
        </button>
      )}
    </section>
  );
}
