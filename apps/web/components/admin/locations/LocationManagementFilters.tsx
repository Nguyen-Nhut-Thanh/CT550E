"use client";

import { ArrowDownUp, Filter, Map, RotateCcw } from "lucide-react";
import { AdminSearchInput } from "@/components/common/AdminSearchInput";
import CustomDropdown from "@/components/common/CustomDropdown";
import { getLocationLevelLabel } from "@/lib/admin/locations/hierarchy";
import {
  DEFAULT_LOCATION_FILTERS,
  type LocationFilters,
} from "@/lib/admin/locations/management";
import type { LocationItem, LocationLevel } from "shared";

export function LocationManagementFilters({
  value,
  onChange,
  levels,
  regions,
}: {
  value: LocationFilters;
  onChange: (value: LocationFilters) => void;
  levels: LocationLevel[];
  regions: LocationItem[];
}) {
  const update = (key: keyof LocationFilters, next: string) =>
    onChange({ ...value, [key]: next });
  const active = Object.entries(value).some(
    ([key, next]) =>
      next !== DEFAULT_LOCATION_FILTERS[key as keyof LocationFilters],
  );
  return (
    <section aria-label="Bộ lọc địa điểm">
      <div className="ui-location-management-filters grid grid-cols-[minmax(250px,2.6fr)_repeat(3,minmax(150px,1fr))] gap-[12px] [&>*]:min-w-0 [&_input]:text-[12px] [&_input]:[border-color:#e2eaf7] [&_input]:rounded-[10px] [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:text-[12px] [&_button[aria-haspopup=listbox]]:[background:white] [&_button[aria-haspopup=listbox]]:[border-color:#e2eaf7] [&_button[aria-haspopup=listbox]]:rounded-[10px] [&_button[aria-haspopup=listbox]]:min-h-[40px] admin-max-1250:grid-cols-[repeat(3,minmax(0,1fr))] admin-max-1250:[&>:first-child]:[grid-column:1/-1] admin-max-750:grid-cols-[repeat(2,minmax(0,1fr))] admin-max-750:gap-[10px] admin-max-750:[&>:last-child]:[grid-column:1/-1] admin-max-750:[&_button[aria-haspopup=listbox]]:text-[11px]">
        <AdminSearchInput
          value={value.search}
          onChange={(next) => update("search", next)}
          placeholder="Tìm theo tên địa điểm, slug hoặc mô tả..."
        />
        <CustomDropdown
          variant="compact"
          matchTriggerWidth
          icon={Filter}
          selectedValue={value.level}
          onSelect={(next) => update("level", next)}
          options={[
            { value: "all", label: "Tất cả cấp độ" },
            ...levels.map((level) => ({
              value: String(level.level_id),
              label: getLocationLevelLabel(level.level_id, level.name),
            })),
          ]}
        />
        <CustomDropdown
          variant="compact"
          matchTriggerWidth
          icon={Map}
          selectedValue={value.region}
          onSelect={(next) => update("region", next)}
          options={[
            { value: "all", label: "Tất cả vùng miền" },
            ...regions.map((region) => ({
              value: String(region.location_id),
              label: region.name,
            })),
          ]}
        />
        <CustomDropdown
          variant="compact"
          matchTriggerWidth
          icon={ArrowDownUp}
          selectedValue={value.sort}
          onSelect={(next) => update("sort", next)}
          options={[
            { value: "updated", label: "Mới cập nhật" },
            { value: "oldest", label: "Cập nhật lâu nhất" },
            { value: "name", label: "Tên A–Z" },
            { value: "nameDesc", label: "Tên Z–A" },
          ]}
        />
      </div>
      {active && (
        <button
          type="button"
          className="ui-location-management-reset flex items-center gap-[6px] mt-[8px] text-[#6481ae] text-[11px] p-[3px] [&:hover]:text-[#075bff]"
          onClick={() => onChange({ ...DEFAULT_LOCATION_FILTERS })}
        >
          <RotateCcw size={13} />
          Đặt lại bộ lọc
        </button>
      )}
    </section>
  );
}
