"use client";

import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { Loader2 } from "lucide-react";
import type { AdminLocationItem } from "shared";

export function LocationSelectField({ label, value, options, disabled, loading, placeholder, onChange }: {
  label: string;
  value: string;
  options: AdminLocationItem[];
  disabled?: boolean;
  loading?: boolean;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <fieldset disabled={disabled || loading} className="min-w-0 disabled:opacity-55">
      <legend className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#07123e]">
        {label}{loading && <Loader2 size={12} className="animate-spin text-[#075bff]" />}
      </legend>
      <CustomDropdown ariaLabel={label} selectedValue={value} placeholder={loading ? "Đang tải..." : placeholder}
        options={options.map(item => ({ value: String(item.location_id), label: item.name }))}
        onSelect={next => { if (!disabled && !loading) onChange(next); }} variant="compact" matchTriggerWidth
        className="min-w-0 [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:rounded-lg [&_button[aria-haspopup=listbox]]:border-[#e1edfc] [&_button[aria-haspopup=listbox]]:bg-white [&_button[aria-haspopup=listbox]]:px-3 [&_button[aria-haspopup=listbox]]:py-2 [&_button[aria-haspopup=listbox]]:text-xs [&_button[aria-haspopup=listbox]]:font-medium [&_button[aria-haspopup=listbox]]:shadow-none" />
    </fieldset>
  );
}
