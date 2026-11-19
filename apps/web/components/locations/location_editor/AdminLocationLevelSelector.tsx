"use client";

import { LOCATION_LEVEL_LABELS } from "@/lib/locations/admin/hierarchy";
import { Building2, Flag, Globe2, Layers, Map, Mountain } from "lucide-react";
import type { LocationLevelSelectorProps } from "shared";

const levels = [
  { value: 1, icon: Globe2, hint: "Cấp độ cao nhất" },
  { value: 2, icon: Layers, hint: "Ví dụ: Châu Á" },
  { value: 3, icon: Flag, hint: "Ví dụ: Việt Nam" },
  { value: 4, icon: Map, hint: "Ví dụ: Miền Nam" },
  { value: 5, icon: Building2, hint: "Ví dụ: An Giang" },
  { value: 6, icon: Mountain, hint: "Danh lam, thắng cảnh" },
];

export function LocationLevelSelector({ form, onLevelChange, disabled = false }: LocationLevelSelectorProps & { disabled?: boolean }) {
  return (
    <div role="radiogroup" aria-label="Phân loại địa điểm" className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6">
      {levels.map(({ value, icon: Icon, hint }) => {
        const selected = form.level_id === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled || value < 3}
            onClick={() => { if (!selected) onLevelChange(value); }}
            onKeyDown={event => {
              if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
              event.preventDefault();
              const choices = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []);
              const direction = event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
              const next = choices[(choices.indexOf(event.currentTarget) + direction + choices.length) % choices.length];
              next?.focus();
              next?.click();
            }}
            className={`flex min-w-0 flex-col items-center gap-2 rounded-xl border px-2 py-3 text-center transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:opacity-45 ${
              selected
                ? "border-[#075bff] bg-blue-50/70 text-[#075bff] shadow-2xs ring-1 ring-[#075bff]/20"
                : "border-[#e1edfc] bg-white text-[#536583] hover:border-blue-200 hover:bg-blue-50/30"
            }`}
          >
            <span className={`grid size-4 place-items-center rounded-full border transition-colors ${selected ? "border-[#075bff] bg-[#075bff]" : "border-[#93a3bf]"}`}>
              {selected && <span className="size-1.5 rounded-full bg-white" />}
            </span>
            <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
            <span className={`text-xs leading-4 font-bold ${selected ? "text-[#07123e]" : "text-[#536583]"}`}>{LOCATION_LEVEL_LABELS[value]}</span>
            <span className="text-[10px] leading-tight text-[#7187a9]">{hint}</span>
          </button>
        );
      })}
    </div>
  );
}
