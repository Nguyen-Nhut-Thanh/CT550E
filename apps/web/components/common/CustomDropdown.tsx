"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

type DropdownOption = {
  label: string;
  value: string;
};

type CustomDropdownProps = {
  label?: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  icon?: LucideIcon;
  className?: string;
  variant?: "default" | "minimal" | "compact";
};

export default function CustomDropdown({
  label,
  placeholder = "Chọn một tùy chọn",
  options,
  selectedValue,
  onSelect,
  icon: Icon,
  className = "",
  variant = "default",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedOption = options.find((option) => option.value === selectedValue);
  const isDefault = variant === "default";
  const isCompact = variant === "compact";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${isDefault ? "space-y-1.5" : ""} ${className}`}>
      {label ? (
        <label
          className={
            isDefault
              ? "text-[14px] font-extrabold uppercase tracking-wider text-slate-600"
              : isCompact
              ? "mr-2 text-[14px] font-medium text-slate-500"
              : "text-[15px] font-semibold text-[#1f1f1f]"
          }
        >
          {label}
        </label>
      ) : null}

      <div className="relative inline-block w-full">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className={`group flex items-center justify-between gap-3 text-left transition-all duration-300 ${
            isCompact
              ? `w-full min-w-[210px] rounded-xl border px-4 py-2 text-[14px] font-medium ${
                  isOpen
                    ? "border-sky-500 bg-white text-sky-800 shadow-md ring-2 ring-sky-100"
                    : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-sky-400 hover:bg-white hover:shadow-sm"
                }`
              : isDefault
              ? `w-full rounded-2xl border-2 py-3.5 pl-4 pr-5 text-[16px] font-semibold ${
                  isOpen
                    ? "border-sky-600 bg-white shadow-lg shadow-sky-100 ring-4 ring-sky-100/50"
                    : "border-slate-200 bg-slate-50/50 hover:border-sky-400 hover:bg-white hover:shadow-md"
                }`
              : "mt-3 flex w-full items-center border-0 bg-transparent px-0 py-0 text-left text-[16px] font-normal text-[#1f1f1f] outline-none focus:ring-0 md:text-[17px]"
          }`}
          aria-expanded={isOpen}
        >
          {Icon ? (
            <Icon
              className={`h-4.5 w-4.5 shrink-0 transition-colors duration-300 ${
                !selectedOption ? "text-slate-400" : "text-sky-700"
              } ${isOpen ? "text-sky-700" : "group-hover:text-sky-600"}`}
            />
          ) : null}
          <div className="relative flex-1 overflow-hidden">
            <span
              className={`block truncate transition-colors duration-300 ${
                !selectedOption && isDefault ? "text-slate-400" : "text-slate-900"
              } ${isOpen ? "text-sky-800" : ""}`}
            >
              {selectedOption?.label ?? placeholder}
            </span>
            {variant === "minimal" && (
              <span
                className={`absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-sky-600 transition-transform duration-300 group-hover:scale-x-100 ${
                  isOpen ? "scale-x-100" : ""
                }`}
              />
            )}
          </div>
          <ChevronDown
            className={`h-4.5 w-4.5 shrink-0 text-slate-400 transition-all duration-300 ${
              isOpen ? "rotate-180 text-sky-700" : "group-hover:text-sky-600"
            }`}
          />
        </button>

        {isOpen ? (
          <div
            className={`absolute z-50 overflow-hidden rounded-[20px] border border-slate-200 bg-white p-2 shadow-2xl ${
              isCompact
                ? "right-0 top-[calc(100%+8px)] min-w-[230px] rounded-[18px] border-slate-100 p-1.5 shadow-xl ring-1 ring-slate-900/5"
                : isDefault
                ? "left-0 right-0 top-[calc(100%+10px)]"
                : "left-0 top-[calc(100%+12px)] min-w-[260px]"
            }`}
          >
            <div className="custom-scrollbar max-h-[300px] overflow-y-auto p-0.5">
              {options.map((option) => {
                const isSelected = option.value === selectedValue;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onSelect(option.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[14px] transition-all duration-200 ${
                      isSelected
                        ? "bg-sky-100/60 font-bold text-sky-800"
                        : "text-slate-600 hover:bg-sky-50 hover:pl-5 hover:text-sky-700"
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-sky-600 shadow-[0_0_8px_rgba(2,132,199,0.5)]" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

