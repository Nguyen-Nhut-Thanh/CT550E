"use client";

import { useState } from "react";
import { Filter, RotateCcw, SlidersHorizontal } from "lucide-react";
import { AdminSearchInput } from "@/components/admin/common/AdminSearchInput";
import { AdminDatePicker } from "@/components/admin/common/AdminDatePicker";
import CustomDropdown from "@/components/common/forms/CustomDropdown";
import {
  BOOKING_STATUSES,
  formatBookingDate,
} from "@/lib/admin/bookings/management";
import type { AdminBookingFilters, AdminSchedule, ToursPageTour } from "shared";

export function BookingManagementFilters({
  value,
  onChange,
  onApply,
  tours,
  schedules,
  loadingSchedules,
  scheduleError,
  onRetrySchedules,
  onReset,
  dirty = false,
}: {
  value: Required<AdminBookingFilters>;
  onChange: (value: Required<AdminBookingFilters>) => void;
  onApply: () => void;
  tours: ToursPageTour[];
  schedules: AdminSchedule[];
  loadingSchedules: boolean;
  scheduleError: boolean;
  onRetrySchedules: () => void;
  onReset: () => void;
  dirty?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const update = (key: keyof AdminBookingFilters, next: string) =>
    onChange({
      ...value,
      [key]: next,
      ...(key === "tourId" ? { scheduleId: "all" } : {}),
    });
  return (
    <form
      className="ui-booking-management-filters p-[14px_16px] [background:white] [border:1px_solid_#e3ecf8] rounded-[16px] min-w-0 [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:min-h-[40px] [&_button[aria-haspopup=listbox]]:[background:white] [&_button[aria-haspopup=listbox]]:rounded-[10px] [&_button[aria-haspopup=listbox]]:[border-color:#e0e9f7] [&_button[aria-haspopup=listbox]]:text-[12px] admin-max-750:p-[12px]"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <div className="ui-booking-management-filterRow grid grid-cols-[minmax(230px,_1fr)_minmax(180px,_240px)_auto_auto] gap-[12px] items-center [&>*]:min-w-0 [&_input]:text-[12px] [&_input]:[border-color:#e0e9f7] admin-max-1250:grid-cols-[minmax(180px,_1fr)_minmax(155px,_210px)_auto] admin-max-1250:[&>:first-child]:[grid-column:1/-1] admin-max-750:grid-cols-[1fr_auto] admin-max-750:gap-[10px] admin-max-750:[&>:nth-child(2)]:[grid-column:1/-1]">
        <AdminSearchInput
          value={value.search}
          onChange={(next) => update("search", next)}
          placeholder="Tìm theo tên khách, SĐT, mã tour, mã booking..."
        />
        <CustomDropdown
          variant="compact"
          matchTriggerWidth
          selectedValue={value.status}
          onSelect={(next) => update("status", next)}
          options={BOOKING_STATUSES}
        />
        <button
          type="button"
          className="ui-booking-management-advancedButton flex items-center justify-center gap-[8px] [background:#eff5ff] text-[#3568b5] rounded-[10px] p-[11px_13px] text-[12px] whitespace-nowrap [&:hover]:[background:#e0edff] admin-max-750:text-[11px]"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal size={17} />
          Lọc nâng cao
        </button>
        <button type="submit" className="ui-booking-management-primary inline-flex items-center justify-center gap-[8px] [background:#075bff] text-[white] rounded-[10px] p-[11px_17px] text-[12px] font-[650] [&:hover]:[background:#0646ce]">
          <Filter size={17} />
          Lọc
        </button>
      </div>
      {expanded && (
        <div className="ui-booking-management-advanced [&>*]:min-w-0 grid grid-cols-[repeat(6,_minmax(0,_1fr))] gap-[14px] pt-[16px] mt-[14px] [border-top:1px_solid_#edf2f9] [&>:first-child]:[grid-column:span_3] [&>fieldset]:[grid-column:span_3] [&>fieldset]:m-[0] [&>fieldset]:p-[0] [&>fieldset]:[border:0] [&>:nth-child(n+3)]:[grid-column:span_2] [&_label]:flex [&_label]:items-center [&_label]:gap-[6px] [&_label]:h-[18px] [&_label]:text-[11px] [&_label]:font-medium [&_label]:[text-transform:none] [&_label]:tracking-[normal]! [&_label]:m-[0] [&_label]:text-[#7289af] [&>div]:flex [&>div]:flex-col [&>div]:gap-[7px] [&>fieldset>div]:flex [&>fieldset>div]:flex-col [&>fieldset>div]:gap-[7px] [&>div>*]:my-[0] [&>fieldset>div>*]:my-[0] [&_button[aria-haspopup=listbox]]:h-[40px] [&_input]:min-h-[40px] [&_input]:p-[9px_12px] [&_input]:text-[12px] [&_input]:rounded-[10px] [&_input]:[background:#fff] [&_fieldset:disabled]:opacity-[.55] [&>p]:text-[#d64c62] [&>p]:text-[12px] [&>p_button]:underline admin-max-750:grid-cols-[1fr_1fr] admin-max-750:[&>:first-child]:[grid-column:1/-1] admin-max-750:[&>fieldset]:[grid-column:1/-1] admin-max-750:[&>:nth-child(3)]:[grid-column:1/-1] admin-max-750:[&>:nth-child(4)]:[grid-column:span_1] admin-max-750:[&>:nth-child(5)]:[grid-column:span_1]">
          <CustomDropdown
            label="Tour"
            variant="compact"
            matchTriggerWidth
            selectedValue={value.tourId}
            onSelect={(next) => update("tourId", next)}
            options={[
              { value: "all", label: "Tất cả tour" },
              ...tours.map((tour) => ({
                value: String(tour.tour_id),
                label: `${tour.code} · ${tour.name}`,
              })),
            ]}
          />
          <fieldset
            disabled={
              value.tourId === "all" || loadingSchedules || scheduleError
            }
          >
            <CustomDropdown
              label="Đợt khởi hành"
              variant="compact"
              matchTriggerWidth
              selectedValue={value.scheduleId}
              onSelect={(next) => update("scheduleId", next)}
              options={[
                {
                  value: "all",
                  label: loadingSchedules
                    ? "Đang tải lịch..."
                    : value.tourId === "all"
                      ? "Chọn tour trước"
                      : "Tất cả đợt khởi hành",
                },
                ...schedules.map((schedule) => ({
                  value: String(schedule.tour_schedule_id),
                  label: `#${schedule.tour_schedule_id} · ${formatBookingDate(schedule.start_date)} · ${formatBookingDate(schedule.start_date, true)}`,
                })),
              ]}
            />
          </fieldset>
          <CustomDropdown
            label="Lọc theo ngày"
            variant="compact"
            matchTriggerWidth
            selectedValue={value.dateField}
            onSelect={(next) => update("dateField", next)}
            options={[
              { value: "created", label: "Ngày đặt booking" },
              { value: "departure", label: "Ngày khởi hành" },
            ]}
          />
          <AdminDatePicker
            variant="compact"
            label="Từ ngày"
            placeholder="Chọn ngày bắt đầu"
            value={value.dateFrom}
            minDate=""
            onChange={(next) => update("dateFrom", next)}
          />
          <AdminDatePicker
            variant="compact"
            label="Đến ngày"
            placeholder="Chọn ngày kết thúc"
            value={value.dateTo}
            minDate={value.dateFrom}
            onChange={(next) => update("dateTo", next)}
          />
          {scheduleError && (
            <p role="alert">
              Không thể tải lịch.{" "}
              <button type="button" onClick={onRetrySchedules}>
                Thử lại
              </button>
            </p>
          )}
        </div>
      )}
      <div className="ui-booking-management-filterFoot flex items-center justify-end gap-[12px] mt-[12px] admin-max-750:flex-wrap admin-max-750:[&>.ui-booking-management-reset]:ml-[auto]">
        {dirty && (
          <span role="status" className="ui-booking-management-pendingFilters mr-[auto] text-[#627fa9] text-[11px] admin-max-750:w-full admin-max-750:leading-[1.5]">
            Có thay đổi chưa áp dụng. Bấm Lọc hoặc Enter để xem kết quả.
          </span>
        )}
        <button type="button" className="ui-booking-management-reset flex items-center gap-[5px] text-[11px] text-[#8094b4] [&:hover]:text-[#075bff]" onClick={onReset}>
          <RotateCcw size={13} />
          Đặt lại bộ lọc
        </button>
      </div>
    </form>
  );
}
