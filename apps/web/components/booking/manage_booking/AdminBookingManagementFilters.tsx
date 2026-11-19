"use client";

import { useState } from "react";
import { Filter, RotateCcw, SlidersHorizontal } from "lucide-react";
import { AdminSearchInput } from "@/components/common/admin_shared/tables/AdminSearchInput";
import { AdminDatePicker } from "@/components/common/date_time/AdminDatePicker";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import {
  BOOKING_STATUSES,
  formatBookingDate,
} from "@/lib/booking/admin/management";
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
      className="ui-booking-management-filters rounded-[14px] border border-[#e1edfc] bg-white p-4 shadow-2xs min-w-0 [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:min-h-[40px] [&_button[aria-haspopup=listbox]]:bg-white [&_button[aria-haspopup=listbox]]:rounded-lg [&_button[aria-haspopup=listbox]]:border-slate-200 [&_button[aria-haspopup=listbox]]:text-[12px] admin-max-750:p-3"
      onSubmit={(event) => {
        event.preventDefault();
        onApply();
      }}
    >
      <div className="ui-booking-management-filterRow grid grid-cols-[minmax(220px,_1fr)_minmax(180px,_230px)_auto_auto_auto] gap-2.5 items-center [&>*]:min-w-0 [&_input]:text-[12px] admin-max-1250:grid-cols-[minmax(180px,_1fr)_minmax(155px,_210px)_auto_auto_auto] admin-max-1250:[&>:first-child]:col-span-full admin-max-750:flex admin-max-750:flex-wrap">
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
          className="ui-booking-management-advancedButton inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-[#d3e4ff] bg-white px-3.5 py-2 text-[12px] font-[650] text-[#075bff] transition-colors hover:bg-[#f1f7ff] shrink-0"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal size={16} />
          <span>Lọc nâng cao</span>
        </button>
        <button
          type="submit"
          className="ui-booking-management-primary inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[12px] border border-[#075bff] bg-[#075bff] px-4 py-2 text-[13px] font-[650] text-white shadow-[0_4px_10px_#075bff15] transition-colors hover:bg-[#064ddd] shrink-0"
        >
          <Filter size={16} />
          <span>Lọc</span>
        </button>
        <button
          type="button"
          className="ui-booking-management-reset inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-[#075bff] shrink-0"
          onClick={onReset}
          title="Đặt lại toàn bộ bộ lọc về mặc định"
        >
          <RotateCcw size={14} />
          <span>Đặt lại bộ lọc</span>
        </button>
      </div>

      {dirty && (
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#627fa9]">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>Có thay đổi chưa áp dụng. Bấm <strong>Lọc</strong> hoặc nhấn Enter để xem kết quả.</span>
        </div>
      )}

      {expanded && (
        <div className="ui-booking-management-advanced [&>*]:min-w-0 grid grid-cols-[repeat(6,_minmax(0,_1fr))] gap-[14px] pt-[16px] mt-[14px] border-t border-[#edf2fb] [&>:first-child]:[grid-column:span_3] [&>fieldset]:[grid-column:span_3] [&>fieldset]:m-[0] [&>fieldset]:p-[0] [&>fieldset]:[border:0] [&>:nth-child(n+3)]:[grid-column:span_2] [&_label]:flex [&_label]:items-center [&_label]:gap-[6px] [&_label]:h-[18px] [&_label]:text-[11px] [&_label]:font-medium [&_label]:[text-transform:none] [&_label]:tracking-[normal]! [&_label]:m-[0] [&_label]:text-[#7289af] [&>div]:flex [&>div]:flex-col [&>div]:gap-[7px] [&>fieldset>div]:flex [&>fieldset>div]:flex-col [&>fieldset>div]:gap-[7px] [&>div>*]:my-[0] [&>fieldset>div>*]:my-[0] [&_button[aria-haspopup=listbox]]:h-[40px] [&_input]:min-h-[40px] [&_input]:p-[9px_12px] [&_input]:text-[12px] [&_input]:rounded-[10px] [&_input]:[background:#fff] [&_fieldset:disabled]:opacity-[.55] [&>p]:text-[#d64c62] [&>p]:text-[12px] [&>p_button]:underline admin-max-750:grid-cols-[1fr_1fr] admin-max-750:[&>:first-child]:[grid-column:1/-1] admin-max-750:[&>fieldset]:[grid-column:1/-1] admin-max-750:[&>:nth-child(3)]:[grid-column:1/-1] admin-max-750:[&>:nth-child(4)]:[grid-column:span_1] admin-max-750:[&>:nth-child(5)]:[grid-column:span_1]">
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
    </form>
  );
}
