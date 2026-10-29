"use client";

import CustomDropdown from "@/components/common/forms/CustomDropdown";
import { PriceInput } from "@/components/common/forms/PriceInput";
import { Tag } from "lucide-react";
import type { VoucherModalProps } from "shared";

export function VoucherInformation({
  form,
  onChange,
  disabled,
  idPrefix,
}: Pick<VoucherModalProps, "form" | "onChange"> & {
  disabled: boolean;
  idPrefix: string;
}) {
  const percentage = form.discount_type === "percentage";
  const invalidDiscount = percentage && form.discount_value > 100;

  return (
    <section
      className="ui-voucher-modal-panel min-w-0 p-[18px] [border:1px_solid_#e8effa] rounded-[17px] [background:linear-gradient(135deg,_#fff,_#fcfdff)] admin-short-tablet:p-[14px_16px] admin-max-479:p-[14px]"
      aria-labelledby={`${idPrefix}-information`}
    >
      <div className="ui-voucher-modal-sectionHeading flex items-center gap-[11px] mb-[22px] [&>span]:grid [&>span]:shrink-0 [&>span]:w-[38px] [&>span]:h-[38px] [&>span]:place-items-center [&>span]:rounded-[12px] [&>span]:[background:#eaf3ff] [&>span]:text-[#1465ff] [&_h3]:text-[16px] [&_h3]:font-[750] [&_h3]:tracking-[-.025em]! [&_h3]:leading-[1.4] [&_p]:mt-[2px] [&_p]:text-[#7a8aaa] [&_p]:text-[11px] [&_p]:leading-[1.5] admin-short-tablet:mb-[14px] admin-max-479:mb-[17px] admin-max-479:[&_h3]:text-[15px] admin-max-479:[&_p]:text-[10px]">
        <span>
          <Tag size={21} />
        </span>
        <div>
          <h3 id={`${idPrefix}-information`}>Thông tin voucher</h3>
          <p>Thiết lập mã, loại ưu đãi và điều kiện áp dụng</p>
        </div>
      </div>
      <div className="ui-voucher-modal-fieldGrid grid grid-cols-[repeat(2,_minmax(0,_1fr))] [align-items:start] gap-[14px] admin-max-479:gap-[10px]">
        <div>
          <label
            htmlFor={`${idPrefix}-code`}
            className="ui-voucher-modal-label block m-[0_0_7px] text-[#697e9f] text-[10px] font-[750] tracking-[.065em]! leading-[16px] uppercase admin-short-tablet:mb-[5px]"
          >
            Mã voucher
          </label>
          <input
            id={`${idPrefix}-code`}
            type="text"
            required
            autoComplete="off"
            placeholder="VD: GIAMHE20"
            value={form.code}
            onChange={(event) =>
              onChange((current) => ({
                ...current,
                code: event.target.value.toUpperCase(),
              }))
            }
            className="ui-voucher-modal-input block w-full min-w-0 h-[44px] [border:1px_solid_#dce5f3] rounded-[10px] [background:#fff] p-[10px_36px_10px_13px] text-[#172340] text-[13px] font-semibold [outline:none] [transition:border-color_.15s,_box-shadow_.15s] [&:focus]:[border-color:#6c9eff] [&:focus]:[box-shadow:0_0_0_3px_#edf4ff] [&::placeholder]:text-[#a0adc3] [&::placeholder]:font-medium [&:disabled]:cursor-not-allowed [&:disabled]:text-[#667795] [&:disabled]:[background:#f7f9fc] [&[aria-invalid=true]]:[border-color:#f58ca0] admin-short-tablet:min-h-[40px] admin-short-tablet:h-[40px] admin-max-479:pl-[10px] uppercase"
          />
        </div>
        <CustomDropdown
          label="Trạng thái"
          variant="compact"
          matchTriggerWidth
          className="ui-voucher-modal-status [&_label]:block [&_label]:m-[0_0_7px] [&_label]:text-[#697e9f] [&_label]:text-[10px] [&_label]:font-[750] [&_label]:tracking-[.065em]! [&_label]:leading-[16px] [&_label]:uppercase min-w-0 [&_button[aria-haspopup]]:w-full [&_button[aria-haspopup]]:min-w-0 [&_button[aria-haspopup]]:min-h-[44px] [&_button[aria-haspopup]]:h-[44px] [&_button[aria-haspopup]]:[border:1px_solid_#dce5f3] [&_button[aria-haspopup]]:rounded-[10px] [&_button[aria-haspopup]]:[background:#fff] [&_button[aria-haspopup]]:p-[10px_12px] [&_button[aria-haspopup]]:text-[13px] [&_button[aria-haspopup]]:[box-shadow:none] [&_button:disabled]:cursor-not-allowed [&_button:disabled]:[background:#f7f9fc] admin-short-tablet:[&_label]:mb-[5px] admin-short-tablet:[&_button[aria-haspopup]]:min-h-[40px] admin-short-tablet:[&_button[aria-haspopup]]:h-[40px]"
          selectedValue={String(form.status)}
          options={[
            { value: "1", label: "Hoạt động" },
            { value: "0", label: "Tạm dừng" },
          ]}
          onSelect={(value) =>
            onChange((current) => ({ ...current, status: Number(value) }))
          }
        />
      </div>

      <div className="ui-voucher-modal-discountType my-[19px] admin-short-tablet:my-[13px]">
        <span
          className="ui-voucher-modal-label block m-[0_0_7px] text-[#697e9f] text-[10px] font-[750] tracking-[.065em]! leading-[16px] uppercase admin-short-tablet:mb-[5px]"
          id={`${idPrefix}-type`}
        >
          Loại ưu đãi
        </span>
        <div
          role="group"
          aria-labelledby={`${idPrefix}-type`}
          className="ui-voucher-modal-segmented grid grid-cols-[repeat(2,_minmax(0,_1fr))] gap-[4px] [border:1px_solid_#e5edf9] rounded-[13px] [background:#f5f8fe] p-[4px] [&_button]:min-h-[38px] [&_button]:[border:1px_solid_transparent] [&_button]:rounded-[10px] [&_button]:p-[6px] [&_button]:text-[#7486a5] [&_button]:text-[12px] [&_button]:font-bold [&_button]:[transition:background_.15s,_border-color_.15s] [&_button[aria-pressed=true]]:[border-color:#a9c5ff] [&_button[aria-pressed=true]]:[background:#fff] [&_button[aria-pressed=true]]:text-[#095dff] [&_button[aria-pressed=true]]:[box-shadow:0_2px_6px_#387cff0a] [&_button:disabled]:cursor-not-allowed admin-short-tablet:[&_button]:min-h-[34px]"
        >
          <button
            type="button"
            aria-pressed={percentage}
            onClick={() =>
              onChange((current) => ({
                ...current,
                discount_type: "percentage",
              }))
            }
          >
            Phần trăm (%)
          </button>
          <button
            type="button"
            aria-pressed={!percentage}
            onClick={() =>
              onChange((current) => ({
                ...current,
                discount_type: "fixed_amount",
              }))
            }
          >
            Số tiền (VND)
          </button>
        </div>
      </div>

      <div className="ui-voucher-modal-fieldGrid grid grid-cols-[repeat(2,_minmax(0,_1fr))] [align-items:start] gap-[14px] admin-max-479:gap-[10px]">
        <div>
          <label
            htmlFor={`${idPrefix}-discount`}
            className="ui-voucher-modal-label block m-[0_0_7px] text-[#697e9f] text-[10px] font-[750] tracking-[.065em]! leading-[16px] uppercase admin-short-tablet:mb-[5px]"
          >
            {percentage ? "Mức giảm (%)" : "Mức giảm (VND)"}
          </label>
          <PriceInput
            id={`${idPrefix}-discount`}
            label=""
            icon={null}
            suffix={percentage ? "%" : "đ"}
            value={form.discount_value}
            disabled={disabled}
            placeholder={percentage ? "10" : "50.000"}
            inputClassName="ui-voucher-modal-input block w-full min-w-0 h-[44px] [border:1px_solid_#dce5f3] rounded-[10px] [background:#fff] p-[10px_36px_10px_13px] text-[#172340] text-[13px] font-semibold [outline:none] [transition:border-color_.15s,_box-shadow_.15s] [&:focus]:[border-color:#6c9eff] [&:focus]:[box-shadow:0_0_0_3px_#edf4ff] [&::placeholder]:text-[#a0adc3] [&::placeholder]:font-medium [&:disabled]:cursor-not-allowed [&:disabled]:text-[#667795] [&:disabled]:[background:#f7f9fc] [&[aria-invalid=true]]:[border-color:#f58ca0] admin-short-tablet:min-h-[40px] admin-short-tablet:h-[40px] admin-max-479:pl-[10px]"
            error={invalidDiscount ? "Mức giảm tối đa là 100%." : undefined}
            onChange={(value) =>
              onChange((current) => ({ ...current, discount_value: value }))
            }
          />
          <p className="ui-voucher-modal-hint mt-[7px] text-[#8191ae] text-[10px] leading-[1.6] admin-short-tablet:mt-[4px] admin-short-tablet:leading-[1.4]">
            {percentage
              ? "Mức giảm theo phần trăm (1 - 100)"
              : "Số tiền giảm cho mỗi đơn hàng"}
          </p>
        </div>
        <div>
          <label
            htmlFor={`${idPrefix}-minimum`}
            className="ui-voucher-modal-label block m-[0_0_7px] text-[#697e9f] text-[10px] font-[750] tracking-[.065em]! leading-[16px] uppercase admin-short-tablet:mb-[5px]"
          >
            Đơn tối thiểu
          </label>
          <PriceInput
            id={`${idPrefix}-minimum`}
            label=""
            icon={null}
            value={form.min_order_value}
            disabled={disabled}
            placeholder="0"
            inputClassName="ui-voucher-modal-input block w-full min-w-0 h-[44px] [border:1px_solid_#dce5f3] rounded-[10px] [background:#fff] p-[10px_36px_10px_13px] text-[#172340] text-[13px] font-semibold [outline:none] [transition:border-color_.15s,_box-shadow_.15s] [&:focus]:[border-color:#6c9eff] [&:focus]:[box-shadow:0_0_0_3px_#edf4ff] [&::placeholder]:text-[#a0adc3] [&::placeholder]:font-medium [&:disabled]:cursor-not-allowed [&:disabled]:text-[#667795] [&:disabled]:[background:#f7f9fc] [&[aria-invalid=true]]:[border-color:#f58ca0] admin-short-tablet:min-h-[40px] admin-short-tablet:h-[40px] admin-max-479:pl-[10px]"
            onChange={(value) =>
              onChange((current) => ({ ...current, min_order_value: value }))
            }
          />
          <p className="ui-voucher-modal-hint mt-[7px] text-[#8191ae] text-[10px] leading-[1.6] admin-short-tablet:mt-[4px] admin-short-tablet:leading-[1.4]">
            Giá trị đơn hàng tối thiểu để áp dụng
          </p>
        </div>
      </div>
    </section>
  );
}
