"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export function BookingGenderSelect({
  value,
  onChange,
  label,
}: {
  value: "male" | "female";
  onChange: (value: "male" | "female") => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    options.current[value === "male" ? 0 : 1]?.focus();
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, value]);
  return (
    <div
      ref={root}
      className="relative min-w-0"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
        }}
        className={`flex min-h-[46px] w-full items-center justify-between rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-blue-100 ${open ? "border-blue-400 bg-white" : "border-slate-200 bg-slate-50"}`}
      >
        {value === "male" ? "Nam" : "Nữ"}
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          id={id}
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 rounded-xl border border-blue-100 bg-white p-1.5 shadow-lg"
        >
          {(
            [
              ["male", "Nam"],
              ["female", "Nữ"],
            ] as const
          ).map(([gender, text], index) => (
            <button
              key={gender}
              ref={(element) => {
                options.current[index] = element;
              }}
              type="button"
              role="option"
              aria-selected={value === gender}
              onClick={() => {
                onChange(gender);
                setOpen(false);
                trigger.current?.focus();
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  setOpen(false);
                  trigger.current?.focus();
                }
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault();
                  options.current[1 - index]?.focus();
                }
                if (event.key === "Home" || event.key === "End") {
                  event.preventDefault();
                  options.current[event.key === "Home" ? 0 : 1]?.focus();
                }
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm outline-none hover:bg-blue-50 focus:bg-blue-50 ${value === gender ? "bg-blue-50 font-semibold text-blue-700" : "text-slate-600"}`}
            >
              {text}
              {value === gender && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
