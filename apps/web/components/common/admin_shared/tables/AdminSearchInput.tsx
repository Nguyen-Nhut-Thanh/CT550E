"use client";

import { Search } from "lucide-react";
import type { AdminSearchInputProps } from 'shared';

/** Hiển thị ô nhập từ khóa tìm kiếm có biểu tượng. */
export function AdminSearchInput({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  roundedClassName = "rounded-xl",
  className = "",
}: AdminSearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
      <input
        type="text"
        placeholder={placeholder}
        className={`w-full border border-[#e1edfc] bg-white py-2 pl-9 pr-4 text-xs sm:text-sm font-medium outline-none transition-all focus:border-[#075bff] focus:ring-2 focus:ring-blue-100 ${roundedClassName}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
