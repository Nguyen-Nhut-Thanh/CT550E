"use client";
import {
  CalendarDays,
  MapPin,
  RotateCcw,
  SlidersHorizontal,
  Tag,
} from "lucide-react";
import CustomDropdown from "@/components/common/forms/CustomDropdown";
import { AdminSearchInput } from "@/components/admin/common/AdminSearchInput";
import type { FlashDealFilters as Filters } from "@/lib/admin/flash-deals/management";

export function FlashDealFilters({
  value,
  onChange,
  onApply,
  onReset,
  destinations,
  count,
  active,
}: {
  value: Filters;
  onChange: (value: Filters) => void;
  onApply: () => void;
  onReset: () => void;
  destinations: { value: string; label: string }[];
  count: number;
  active: boolean;
}) {
  return (
    <form
      className="ui-flash-deal-management-filters [border:1px_solid_#e4edfa] rounded-[15px] [background:#fff] p-[14px_16px] [box-shadow:0_4px_16px_#4684b805] admin-max-650:p-[12px]"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
      aria-label="Bộ lọc flash deal"
    >
      <div className="ui-flash-deal-management-filterRow grid grid-cols-[minmax(230px,_2.1fr)_repeat(3,_minmax(140px,_1fr))_auto] gap-[12px] items-center [&>*]:min-w-0 [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:h-[44px] [&_button[aria-haspopup=listbox]]:text-[12px] [&_button[aria-haspopup=listbox]]:rounded-[10px] [&_button[aria-haspopup=listbox]]:[background:#fff] [&_button[aria-haspopup=listbox]]:[border-color:#e0e9f7] [&_button[aria-haspopup=listbox]]:p-[8px_12px] admin-max-1250:grid-cols-[minmax(0,_1.5fr)_repeat(2,_minmax(0,_1fr))] admin-max-1250:[&>:first-child]:[grid-column:span_2] admin-max-1250:[&>:last-child]:[grid-column:3] admin-max-1250:[&>:last-child]:[grid-row:1] admin-max-650:grid-cols-[repeat(2,_minmax(0,_1fr))] admin-max-650:gap-[9px] admin-max-650:[&>:first-child]:[grid-column:1/-1] admin-max-650:[&>:last-child]:[grid-column:2] admin-max-650:[&>:last-child]:[grid-row:auto] admin-max-650:[&_button[aria-haspopup=listbox]]:text-[11px]">
        <AdminSearchInput
          value={value.search}
          onChange={(search) => onChange({ ...value, search })}
          placeholder="Tìm tên tour hoặc mã tour..."
        />
        <CustomDropdown
          variant="compact"
          matchTriggerWidth
          icon={Tag}
          placeholder="Trạng thái"
          selectedValue={value.status}
          onSelect={(status) => onChange({ ...value, status })}
          options={[
            { value: "all", label: "Tất cả trạng thái" },
            { value: "active", label: "Đang giảm giá" },
            { value: "scheduled", label: "Sắp mở bán" },
            { value: "paused", label: "Tạm ẩn" },
            { value: "soldout", label: "Đã hết chỗ" },
            { value: "expired", label: "Đã kết thúc" },
            { value: "none", label: "Chưa có deal" },
          ]}
        />
        <CustomDropdown
          variant="compact"
          matchTriggerWidth
          icon={CalendarDays}
          placeholder="Ngày khởi hành"
          selectedValue={value.departure}
          onSelect={(departure) => onChange({ ...value, departure })}
          options={[
            { value: "all", label: "Mọi ngày khởi hành" },
            { value: "7", label: "Trong 7 ngày tới" },
            { value: "30", label: "Trong 30 ngày tới" },
            { value: "90", label: "Trong 90 ngày tới" },
          ]}
        />
        <CustomDropdown
          variant="compact"
          matchTriggerWidth
          icon={MapPin}
          placeholder="Điểm đến"
          selectedValue={value.destination}
          onSelect={(destination) => onChange({ ...value, destination })}
          options={[
            { value: "all", label: "Tất cả điểm đến" },
            ...destinations,
          ]}
        />
        <button
          type="submit"
          className="ui-flash-deal-management-filterButton flex items-center justify-center gap-[8px] h-[44px] p-[0_20px] rounded-[10px] [background:#0763ff] text-[#fff] text-[13px] font-[650] whitespace-nowrap [box-shadow:0_4px_10px_#0763ff18] [&:hover]:[background:#0652d8]"
        >
          <SlidersHorizontal size={17} />
          Lọc
        </button>
      </div>
      <div className="ui-flash-deal-management-filterFooter flex items-center justify-between gap-[12px] mt-[10px] text-[#8294b2] text-[11px] admin-max-650:items-start">
        <span>{count} lịch khởi hành phù hợp · Chỉ hiển thị lịch sắp tới</span>
        {active && (
          <button
            type="button"
            onClick={onReset}
            className="ui-flash-deal-management-reset flex items-center gap-[5px] text-[#5279ac] text-[11px] [&:hover]:text-[#0763ff]"
          >
            <RotateCcw size={12} />
            Đặt lại bộ lọc
          </button>
        )}
      </div>
    </form>
  );
}
