"use client";

import { AdminDatePicker } from "@/components/admin/common/AdminDatePicker";
import { CalendarDays, Clock } from "lucide-react";
import type { VoucherModalProps } from "shared";

export function VoucherTiming({
  form,
  minDate,
  minTime,
  startDateValue,
  startTimeValue,
  onChange,
  onStartDateChange,
  onStartTimeChange,
  disabled,
  idPrefix,
}: Pick<
  VoucherModalProps,
  | "form"
  | "minDate"
  | "minTime"
  | "startDateValue"
  | "startTimeValue"
  | "onChange"
  | "onStartDateChange"
  | "onStartTimeChange"
> & { disabled: boolean; idPrefix: string }) {
  return (
    <section
      className="ui-voucher-modal-panel min-w-0 p-[18px] [border:1px_solid_#e8effa] rounded-[17px] [background:linear-gradient(135deg,_#fff,_#fcfdff)] admin-short-tablet:p-[14px_16px] admin-max-479:p-[14px] ui-voucher-modal-timing [&&]:[background:linear-gradient(135deg,_#f7fbff,_#f0f7ff)]"
      aria-labelledby={`${idPrefix}-timing`}
    >
      <div className="ui-voucher-modal-sectionHeading flex items-center gap-[11px] mb-[22px] [&>span]:grid [&>span]:shrink-0 [&>span]:w-[38px] [&>span]:h-[38px] [&>span]:place-items-center [&>span]:rounded-[12px] [&>span]:[background:#eaf3ff] [&>span]:text-[#1465ff] [&_h3]:text-[16px] [&_h3]:font-[750] [&_h3]:tracking-[-.025em]! [&_h3]:leading-[1.4] [&_p]:mt-[2px] [&_p]:text-[#7a8aaa] [&_p]:text-[11px] [&_p]:leading-[1.5] admin-short-tablet:mb-[14px] admin-max-479:mb-[17px] admin-max-479:[&_h3]:text-[15px] admin-max-479:[&_p]:text-[10px]">
        <span>
          <CalendarDays size={21} />
        </span>
        <div>
          <h3 id={`${idPrefix}-timing`}>Thời gian &amp; số lượng</h3>
          <p>Thiết lập thời gian hiệu lực và số lượng voucher</p>
        </div>
      </div>
      <div className="ui-voucher-modal-fieldGrid grid grid-cols-[repeat(2,_minmax(0,_1fr))] [align-items:start] gap-[14px] admin-max-479:gap-[10px]">
        <div className="ui-voucher-modal-date [&_label]:block [&_label]:m-[0_0_7px] [&_label]:text-[#697e9f] [&_label]:text-[10px] [&_label]:font-[750] [&_label]:tracking-[.065em]! [&_label]:leading-[16px] [&_label]:uppercase [&_label_svg]:hidden [&_button[aria-expanded]]:min-h-[44px] [&_button[aria-expanded]]:h-[44px] [&_button[aria-expanded]]:[border:1px_solid_#dce5f3] [&_button[aria-expanded]]:rounded-[10px] [&_button[aria-expanded]]:p-[6px_9px] [&_button[aria-expanded]]:[box-shadow:none] [&_button[aria-expanded]>span]:gap-[7px] [&_button[aria-expanded]_span]:text-[11px] admin-short-tablet:[&_label]:mb-[5px] admin-short-tablet:[&_button[aria-expanded]]:min-h-[40px] admin-short-tablet:[&_button[aria-expanded]]:h-[40px] admin-max-479:[&_button[aria-expanded]]:px-[6px]">
          <AdminDatePicker
            label="Ngày bắt đầu"
            value={startDateValue}
            minDate={minDate}
            disabled={disabled}
            onChange={onStartDateChange}
          />
        </div>
        <div>
          <label
            htmlFor={`${idPrefix}-time`}
            className="ui-voucher-modal-label block m-[0_0_7px] text-[#697e9f] text-[10px] font-[750] tracking-[.065em]! leading-[16px] uppercase admin-short-tablet:mb-[5px]"
          >
            Giờ bắt đầu
          </label>
          <div className="relative">
            <Clock
              size={16}
              className="ui-voucher-modal-inputIcon absolute left-[11px] top-[14px] text-[#3c7cff] pointer-events-none admin-short-tablet:top-[12px]"
            />
            <input
              id={`${idPrefix}-time`}
              type="time"
              required
              step={60}
              min={startDateValue === minDate ? minTime : undefined}
              value={startTimeValue}
              disabled={disabled}
              onChange={(event) => onStartTimeChange(event.target.value)}
              className="ui-voucher-modal-input block w-full min-w-0 h-[44px] [border:1px_solid_#dce5f3] rounded-[10px] [background:#fff] p-[10px_36px_10px_13px] text-[#172340] text-[13px] font-semibold [outline:none] [transition:border-color_.15s,_box-shadow_.15s] [&:focus]:[border-color:#6c9eff] [&:focus]:[box-shadow:0_0_0_3px_#edf4ff] [&::placeholder]:text-[#a0adc3] [&::placeholder]:font-medium [&:disabled]:cursor-not-allowed [&:disabled]:text-[#667795] [&:disabled]:[background:#f7f9fc] [&[aria-invalid=true]]:[border-color:#f58ca0] admin-short-tablet:min-h-[40px] admin-short-tablet:h-[40px] admin-max-479:pl-[10px] ui-voucher-modal-timeInput [&&]:pl-[34px] [&&]:pr-[7px] [&&]:text-[12px] admin-max-479:[&&]:pl-[31px]"
            />
          </div>
        </div>
      </div>
      <div className="ui-voucher-modal-fieldGrid grid grid-cols-[repeat(2,_minmax(0,_1fr))] [align-items:start] gap-[14px] admin-max-479:gap-[10px] ui-voucher-modal-quantityFields mt-[29px] admin-short-tablet:mt-[24px] admin-max-799:mt-[20px]">
        <div>
          <label
            htmlFor={`${idPrefix}-duration`}
            className="ui-voucher-modal-label block m-[0_0_7px] text-[#697e9f] text-[10px] font-[750] tracking-[.065em]! leading-[16px] uppercase admin-short-tablet:mb-[5px]"
          >
            Hết hạn (giờ)
          </label>
          <input
            id={`${idPrefix}-duration`}
            type="number"
            min={1}
            step={1}
            required
            placeholder="72"
            value={form.duration_hours ? String(form.duration_hours) : ""}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                duration_hours: Number(event.target.value),
              }))
            }
            className="ui-voucher-modal-input block w-full min-w-0 h-[44px] [border:1px_solid_#dce5f3] rounded-[10px] [background:#fff] p-[10px_36px_10px_13px] text-[#172340] text-[13px] font-semibold [outline:none] [transition:border-color_.15s,_box-shadow_.15s] [&:focus]:[border-color:#6c9eff] [&:focus]:[box-shadow:0_0_0_3px_#edf4ff] [&::placeholder]:text-[#a0adc3] [&::placeholder]:font-medium [&:disabled]:cursor-not-allowed [&:disabled]:text-[#667795] [&:disabled]:[background:#f7f9fc] [&[aria-invalid=true]]:[border-color:#f58ca0] admin-short-tablet:min-h-[40px] admin-short-tablet:h-[40px] admin-max-479:pl-[10px]"
          />
          <p className="ui-voucher-modal-hint mt-[7px] text-[#8191ae] text-[10px] leading-[1.6] admin-short-tablet:mt-[4px] admin-short-tablet:leading-[1.4]">
            Thời gian hiệu lực tính từ ngày bắt đầu
          </p>
        </div>
        <div>
          <label
            htmlFor={`${idPrefix}-quantity`}
            className="ui-voucher-modal-label block m-[0_0_7px] text-[#697e9f] text-[10px] font-[750] tracking-[.065em]! leading-[16px] uppercase admin-short-tablet:mb-[5px]"
          >
            Số lượng
          </label>
          <input
            id={`${idPrefix}-quantity`}
            type="number"
            min={1}
            step={1}
            required
            placeholder="100"
            value={form.usage_limit ? String(form.usage_limit) : ""}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                usage_limit: Number(event.target.value),
              }))
            }
            className="ui-voucher-modal-input block w-full min-w-0 h-[44px] [border:1px_solid_#dce5f3] rounded-[10px] [background:#fff] p-[10px_36px_10px_13px] text-[#172340] text-[13px] font-semibold [outline:none] [transition:border-color_.15s,_box-shadow_.15s] [&:focus]:[border-color:#6c9eff] [&:focus]:[box-shadow:0_0_0_3px_#edf4ff] [&::placeholder]:text-[#a0adc3] [&::placeholder]:font-medium [&:disabled]:cursor-not-allowed [&:disabled]:text-[#667795] [&:disabled]:[background:#f7f9fc] [&[aria-invalid=true]]:[border-color:#f58ca0] admin-short-tablet:min-h-[40px] admin-short-tablet:h-[40px] admin-max-479:pl-[10px]"
          />
          <p className="ui-voucher-modal-hint mt-[7px] text-[#8191ae] text-[10px] leading-[1.6] admin-short-tablet:mt-[4px] admin-short-tablet:leading-[1.4]">
            Tổng số voucher phát hành
          </p>
        </div>
      </div>
    </section>
  );
}
