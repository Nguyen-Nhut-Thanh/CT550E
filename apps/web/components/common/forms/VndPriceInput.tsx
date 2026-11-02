"use client";

import { Tag } from "lucide-react";
import type { PriceInputProps } from "shared";
import CustomDropdown from "./CustomDropdown";
import { PriceInput } from "./PriceInput";

/** Ô giá VNĐ dùng chung cho tour và từng lịch khởi hành. */
export function VndPriceInput({ disabled = false, ...props }: Omit<PriceInputProps, "label" | "icon" | "suffix" | "inputClassName">) {
  return <fieldset disabled={disabled} className="flex min-w-0 items-stretch overflow-hidden rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] transition-[border-color,box-shadow] duration-150 focus-within:border-[#79a8f5] focus-within:bg-white focus-within:shadow-[0_0_0_3px_#e8f1ff] disabled:opacity-60">
    <CustomDropdown ariaLabel="Đơn vị tiền tệ" selectedValue="VND" options={[{ value: "VND", label: "VNĐ" }]} onSelect={() => {}} icon={Tag} variant="compact" matchTriggerWidth className="min-w-0 flex-[0_0_116px] border-r border-[#e2e8f2] [&_button[aria-haspopup=listbox]]:h-full [&_button[aria-haspopup=listbox]]:min-h-[46px] [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:gap-[7px] [&_button[aria-haspopup=listbox]]:rounded-none [&_button[aria-haspopup=listbox]]:border-0 [&_button[aria-haspopup=listbox]]:bg-transparent [&_button[aria-haspopup=listbox]]:px-[10px] [&_button[aria-haspopup=listbox]]:py-[11px] [&_button[aria-haspopup=listbox]]:text-[13px] [&_button[aria-haspopup=listbox]]:font-semibold [&_button[aria-haspopup=listbox]]:text-[#334462] [&_button[aria-haspopup=listbox]]:shadow-none" />
    <div className="min-w-0 flex-1">
      <PriceInput {...props} label="" icon={null} suffix="" disabled={disabled} inputClassName="min-h-[46px] w-full min-w-0 border-0 bg-transparent px-3 py-[11px] text-[15px] leading-[1.5] font-bold text-[#153c78] tabular-nums outline-none placeholder:text-[13px] placeholder:font-medium placeholder:text-[#8b96a9] disabled:cursor-not-allowed" />
    </div>
  </fieldset>;
}
