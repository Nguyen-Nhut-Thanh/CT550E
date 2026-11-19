"use client";

import { CalendarSync, Check, CircleDollarSign } from "lucide-react";

export type AdminCancelResolution = "full_refund" | "reschedule";

export interface AdminCancelResolutionSelectorProps {
  allowedOptions: AdminCancelResolution[];
  onChange: (options: AdminCancelResolution[]) => void;
  disabled?: boolean;
}

export function AdminCancelResolutionSelector({
  allowedOptions = ["full_refund"],
  onChange,
  disabled = false,
}: AdminCancelResolutionSelectorProps) {
  const isRefundSelected = allowedOptions.includes("full_refund");
  const isRescheduleSelected = allowedOptions.includes("reschedule");

  const toggleOption = (option: AdminCancelResolution) => {
    if (disabled) return;
    const isSelected = allowedOptions.includes(option);

    if (isSelected) {
      // Nếu chỉ còn 1 lựa chọn duy nhất thì không cho bỏ chọn hết
      if (allowedOptions.length === 1) return;
      onChange(allowedOptions.filter((item) => item !== option));
    } else {
      onChange([...allowedOptions, option]);
    }
  };

  return (
    <div className="space-y-2.5 rounded-2xl border border-emerald-200/90 bg-emerald-50/40 p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider block">
          Phương án đề xuất cho khách hàng
        </span>
        <span className="text-[10.5px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
          {allowedOptions.length === 2
            ? "Đề xuất cả 2 phương án"
            : isRefundSelected
              ? "Chỉ đề xuất hoàn tiền 100%"
              : "Chỉ đề xuất dời lịch"}
        </span>
      </div>

      <p className="text-[11.5px] text-slate-600 leading-snug">
        Tích chọn 1 hoặc cả 2 phương án bên dưới để gửi đến khách hàng. Khách hàng sẽ xem và xác nhận phương án mong muốn trên giao diện của mình.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
        {/* Phương án 1: Hoàn tiền 100% */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => toggleOption("full_refund")}
          className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-colors duration-150 motion-reduce:transition-none cursor-pointer relative ${
            isRefundSelected
              ? "border-emerald-500 bg-white shadow-2xs ring-1 ring-emerald-500/25"
              : "border-slate-200/80 bg-white/70 hover:bg-white text-slate-700 opacity-70"
          }`}
        >
          <div className="pt-0.5">
            <span
              className={`flex h-4.5 w-4.5 items-center justify-center rounded-md border transition-colors duration-150 ${
                isRefundSelected
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-300 bg-white text-transparent"
              }`}
            >
              <Check size={12} strokeWidth={3} />
            </span>
          </div>

          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 ${
              isRefundSelected
                ? "bg-emerald-600 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <CircleDollarSign size={16} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="block text-xs font-bold text-slate-900 leading-tight">
                Hoàn tiền 100%
              </span>
            </div>
            <span className="block text-[10.5px] text-slate-500 mt-0.5 leading-snug">
              Hoàn đủ 100% số tiền đã đóng, khách điền tài khoản ngân hàng nhận lại tiền.
            </span>
          </div>
        </button>

        {/* Phương án 2: Dời sang lịch khác */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => toggleOption("reschedule")}
          className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-colors duration-150 motion-reduce:transition-none cursor-pointer relative ${
            isRescheduleSelected
              ? "border-blue-500 bg-white shadow-2xs ring-1 ring-blue-500/25"
              : "border-slate-200/80 bg-white/70 hover:bg-white text-slate-700 opacity-70"
          }`}
        >
          <div className="pt-0.5">
            <span
              className={`flex h-4.5 w-4.5 items-center justify-center rounded-md border transition-colors duration-150 ${
                isRescheduleSelected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-slate-300 bg-white text-transparent"
              }`}
            >
              <Check size={12} strokeWidth={3} />
            </span>
          </div>

          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 ${
              isRescheduleSelected
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <CalendarSync size={16} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="block text-xs font-bold text-slate-900 leading-tight">
                Dời sang đợt khác
              </span>
            </div>
            <span className="block text-[10.5px] text-slate-500 mt-0.5 leading-snug">
              Đề xuất đợt khởi hành mới còn chỗ để khách hàng xem xét xác nhận.
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
