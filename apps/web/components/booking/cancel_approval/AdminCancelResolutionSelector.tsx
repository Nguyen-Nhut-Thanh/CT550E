"use client";

import { CalendarSync, CircleDollarSign } from "lucide-react";

export type AdminCancelResolution = "full_refund" | "reschedule";

export interface AdminCancelResolutionSelectorProps {
  value: AdminCancelResolution;
  onChange: (val: AdminCancelResolution) => void;
  disabled?: boolean;
}

export function AdminCancelResolutionSelector({
  value,
  onChange,
  disabled = false,
}: AdminCancelResolutionSelectorProps) {
  return (
    <div className="space-y-2 rounded-2xl border border-emerald-200/90 bg-emerald-50/40 p-3.5">
      <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider block">
        Phương án giải quyết cho khách hàng
      </span>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* Phương án 1: Hoàn tiền 100% */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("full_refund")}
          className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition cursor-pointer ${
            value === "full_refund"
              ? "border-emerald-500 bg-white shadow-2xs ring-1 ring-emerald-500/20"
              : "border-slate-200/80 bg-white/70 hover:bg-white text-slate-700"
          }`}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              value === "full_refund"
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <CircleDollarSign size={16} />
          </span>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-slate-900 leading-tight">
              Hoàn tiền 100%
            </span>
            <span className="block text-[10.5px] text-slate-500 mt-0.5 leading-snug">
              Hoàn đủ 100% số tiền khách đã đóng, không trừ phí.
            </span>
          </div>
        </button>

        {/* Phương án 2: Dời sang lịch khác */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("reschedule")}
          className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition cursor-pointer ${
            value === "reschedule"
              ? "border-blue-500 bg-white shadow-2xs ring-1 ring-blue-500/20"
              : "border-slate-200/80 bg-white/70 hover:bg-white text-slate-700"
          }`}
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              value === "reschedule"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <CalendarSync size={16} />
          </span>
          <div className="min-w-0">
            <span className="block text-xs font-bold text-slate-900 leading-tight">
              Dời sang đợt khác
            </span>
            <span className="block text-[10.5px] text-slate-500 mt-0.5 leading-snug">
              Chuyển booking sang ngày khởi hành mới còn chỗ.
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}

