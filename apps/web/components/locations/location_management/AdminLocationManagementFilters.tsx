"use client";

import { ArrowDownUp, Filter, Map, RotateCcw } from "lucide-react";
import { AdminSearchInput } from "@/components/common/admin_shared/tables/AdminSearchInput";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { getLocationLevelLabel } from "@/lib/locations/admin/hierarchy";
import {
  DEFAULT_LOCATION_FILTERS,
  type LocationFilters,
} from "@/lib/locations/admin/management";
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
    <section
      aria-label="Bộ lọc địa điểm"
      className="ui-location-management-filters rounded-[14px] border border-[#e1edfc] bg-white p-3.5 shadow-2xs"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(260px,2.2fr)_repeat(3,minmax(160px,1fr))] [&_input]:rounded-lg [&_input]:border-[#e1edfc] [&_input]:text-xs [&_button[aria-haspopup=listbox]]:rounded-lg [&_button[aria-haspopup=listbox]]:border-[#e1edfc] [&_button[aria-haspopup=listbox]]:bg-white [&_button[aria-haspopup=listbox]]:text-xs [&_button[aria-haspopup=listbox]]:min-h-[38px]">
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
        <div className="mt-2.5 flex items-center pt-2 border-t border-[#edf2fb]">
          <button
            type="button"
            className="ui-location-management-reset inline-flex items-center gap-1.5 text-xs text-[#6481ae] hover:text-[#075bff] transition-colors font-medium cursor-pointer"
            onClick={() => onChange({ ...DEFAULT_LOCATION_FILTERS })}
          >
            <RotateCcw size={13} />
            <span>Đặt lại bộ lọc</span>
          </button>
        </div>
      )}
    </section>
  );
}
