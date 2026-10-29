"use client";

import { ChevronRight, Loader2 } from "lucide-react";
import type { AdminLocationItem } from "shared";

export function LocationSelectField({
  label,
  value,
  options,
  disabled,
  loading,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: AdminLocationItem[];
  disabled?: boolean;
  loading?: boolean;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative">
        <select
          disabled={disabled}
          className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold shadow-sm outline-none transition-all focus:border-blue-500 focus:bg-white disabled:opacity-40"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((item) => (
            <option key={item.location_id} value={item.location_id}>
              {item.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 size={16} className="animate-spin text-blue-500" />
          ) : (
            <ChevronRight size={16} className="rotate-90 text-slate-400" />
          )}
        </div>
      </div>
    </div>
  );
}
