"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import type { MembershipTier, MembershipTierId } from "shared";
import { formatVND } from "@/lib/utils/currency";
import { tierStyles } from "./MembershipTierPreview";

type Field = "threshold" | "tourDiscountPercent" | "pointMultiplier" | "birthdayVoucherAmount" | "serviceDiscountPercent";
const fields: { key: Field; label: string; suffix: string; max: number; decimal?: boolean }[] = [
  { key: "threshold", label: "Chi tiêu tối thiểu", suffix: "đ", max: 1_000_000_000_000 },
  { key: "tourDiscountPercent", label: "Giảm giá tour", suffix: "%", max: 100 },
  { key: "pointMultiplier", label: "Hệ số tích điểm", suffix: "×", max: 10, decimal: true },
  { key: "birthdayVoucherAmount", label: "Voucher sinh nhật", suffix: "đ", max: 1_000_000_000 },
  { key: "serviceDiscountPercent", label: "Giảm dịch vụ đi kèm", suffix: "%", max: 100 },
];

export function MembershipTierSettings({ tiers, disabled, onSelect, onChange }: {
  tiers: MembershipTier[]; disabled: boolean;
  onSelect: (id: MembershipTierId) => void;
  onChange: (id: MembershipTierId, field: Field | "priorityReservation", value: number | boolean) => void;
}) {
  const [expanded, setExpanded] = useState<MembershipTierId | null>(null);
  const member = tiers.find(tier => tier.id === "bronze");

  function toggle(id: MembershipTierId) {
    setExpanded(current => current === id ? null : id);
    onSelect(id);
  }

  function renderFields(tier: MembershipTier) {
    return <div className="grid gap-3 sm:grid-cols-2 min-[1450px]:grid-cols-3">
      {fields.map(field => <label key={field.key} className="block text-[11px] font-medium text-slate-500">
        {field.label}
        <div className="relative mt-1.5">
          <input
            type={field.suffix === "đ" ? "text" : "number"}
            inputMode={field.decimal ? "decimal" : "numeric"}
            min={field.decimal ? 1 : 0}
            max={field.max}
            step={field.decimal ? 0.1 : 1}
            disabled={disabled || (tier.id === "bronze" && field.key === "threshold")}
            required
            aria-label={`${field.label} hạng ${tier.name}`}
            value={field.suffix === "đ" ? tier[field.key].toLocaleString("vi-VN") : tier[field.key]}
            onChange={event => {
              const value = field.suffix === "đ" ? Number(event.target.value.replace(/\D/g, "")) : Number(event.target.value);
              if (Number.isFinite(value) && value >= 0 && value <= field.max) onChange(tier.id, field.key, value);
            }}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-50 disabled:opacity-50"
          />
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">{field.suffix}</span>
        </div>
      </label>)}
      <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 sm:self-end">
        <input type="checkbox" disabled={disabled} checked={tier.priorityReservation} onChange={event => onChange(tier.id, "priorityReservation", event.target.checked)} className="size-4 accent-cyan-600" />
        <span>Ưu tiên xử lý giữ chỗ<span className="mt-0.5 block text-[10px] font-normal text-slate-400">Đánh dấu cho nhân viên hỗ trợ</span></span>
      </label>
    </div>;
  }

  return <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/20 sm:p-5">
    <header className="border-b border-slate-100 pb-4">
      <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900"><SlidersHorizontal size={17} className="text-cyan-600" />Quy tắc thăng hạng & quyền lợi</h2>
      <p className="mt-1.5 text-xs leading-5 text-slate-500">Chọn một hạng để xem và chỉnh sửa quyền lợi.</p>
    </header>
    <div className="mt-4 space-y-3">
      {tiers.filter(tier => tier.id !== "bronze").map(tier => {
        const open = expanded === tier.id;
        return <article key={tier.id} className={`overflow-hidden rounded-xl border transition-colors ${open ? "border-cyan-200 bg-cyan-50/35" : "border-slate-200 bg-white"}`}>
          <h3>
            <button type="button" id={`tier-trigger-${tier.id}`} aria-expanded={open} aria-controls={`tier-panel-${tier.id}`} onClick={() => toggle(tier.id)} className="flex w-full items-center justify-between gap-3 p-4 text-left outline-none hover:bg-slate-50/70 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-400">
              <span className="flex min-w-0 items-center gap-3">
                <span className={`size-2.5 shrink-0 rounded-full ${tierStyles[tier.id].dot}`} />
                <span><span className="block text-sm font-bold text-slate-900">{tier.name}</span><span className="mt-1 block text-[11px] font-normal text-slate-400">Từ {formatVND(tier.threshold)} / kỳ</span></span>
              </span>
              <span className="flex shrink-0 items-center gap-3"><span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${tierStyles[tier.id].badge}`}>{tierStyles[tier.id].english}</span><ChevronDown size={17} aria-hidden className={`text-slate-400 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} /></span>
            </button>
          </h3>
          <div id={`tier-panel-${tier.id}`} role="region" aria-labelledby={`tier-trigger-${tier.id}`} hidden={!open}>
            {open && <div className="border-t border-cyan-100 p-4">{renderFields(tier)}</div>}
          </div>
        </article>;
      })}
    </div>
    {member && <div className="mt-4 border-t border-slate-100 pt-3">
      <button type="button" id="tier-trigger-bronze" aria-expanded={expanded === "bronze"} aria-controls="tier-panel-bronze" onClick={() => toggle("bronze")} className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-2 text-left text-xs font-medium text-slate-500 hover:text-cyan-700 focus-visible:outline-2 focus-visible:outline-cyan-400">
        Quyền lợi Member cơ bản<ChevronDown size={15} aria-hidden className={`transition-transform motion-reduce:transition-none ${expanded === "bronze" ? "rotate-180" : ""}`} />
      </button>
      <div id="tier-panel-bronze" role="region" aria-labelledby="tier-trigger-bronze" hidden={expanded !== "bronze"}>
        {expanded === "bronze" && <div className="pt-3">{renderFields(member)}</div>}
      </div>
    </div>}
  </section>;
}
