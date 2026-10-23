"use client";

import { formatCurrencyInput, parseCurrencyInput } from "@/lib/utils/currency";
import { Banknote } from "lucide-react";
import { useId } from "react";
import type { PriceInputProps } from 'shared';

/** Hiển thị ô nhập số tiền, định dạng giá và thông báo lỗi. */
export function PriceInput({
  id,
  inputClassName,
  label,
  value,
  onChange,
  placeholder = "Ví dụ: 1.000.000",
  icon: Icon = Banknote,
  suffix = "đ",
  error,
  disabled = false,
}: PriceInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseCurrencyInput(e.target.value));
  };

  const displayValue = formatCurrencyInput(value);

  return (
    <div className="space-y-2">
      {label && <label htmlFor={inputId} className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
        {label}
      </label>}
      <div className="group relative">
        {Icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500">
          <Icon size={18} />
        </div>}
        <input
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClassName ?? `w-full rounded-2xl border bg-slate-50 py-3 ${Icon ? "pl-12" : "pl-4"} pr-12 text-sm font-bold outline-none transition-all ${
            error
              ? "border-rose-500 bg-rose-50"
              : "border-slate-100 focus:border-blue-500 focus:bg-white"
          } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
          {suffix}
        </div>
      </div>
      {error && <p id={`${inputId}-error`} role="alert" className="ml-1 text-[10px] font-bold text-rose-500">{error}</p>}
    </div>
  );
}
