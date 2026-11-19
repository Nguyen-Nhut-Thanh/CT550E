"use client";

import { CloudRain, ShieldCheck, UserX } from "lucide-react";

export type AdminCancelSourceType = "operator_fault" | "customer_request";

export interface AdminCancelTypeSelectorProps {
  value: AdminCancelSourceType;
  onChange: (val: AdminCancelSourceType) => void;
  disabled?: boolean;
}

export function AdminCancelTypeSelector({
  value,
  onChange,
  disabled = false,
}: AdminCancelTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
        <span>Xác định nguyên nhân hủy tour</span>
        <span className="text-[11px] text-slate-500 font-normal">
          Quyết định chính sách hoàn tiền
        </span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Lựa chọn 1: Do công ty / thiên tai / sự cố */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("operator_fault")}
          className={`flex flex-col text-left p-3 rounded-2xl border transition-colors duration-150 motion-reduce:transition-none cursor-pointer relative ${
            value === "operator_fault"
              ? "border-emerald-500 bg-emerald-50/60 shadow-2xs ring-1 ring-emerald-500/30"
              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
          }`}
        >
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <span
              className={`flex items-center gap-1.5 text-xs font-black ${
                value === "operator_fault"
                  ? "text-emerald-900"
                  : "text-slate-800"
              }`}
            >
              <CloudRain
                size={15}
                className={
                  value === "operator_fault"
                    ? "text-emerald-600"
                    : "text-slate-500"
                }
              />
              Do Công ty / Sự cố / Bão lũ
            </span>
            <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Miễn phí phạt
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Khách không có lỗi. Hoàn 100% tiền hoặc dời lịch khởi hành sang đợt mới.
          </p>
        </button>

        {/* Lựa chọn 2: Theo yêu cầu của khách hàng */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange("customer_request")}
          className={`flex flex-col text-left p-3 rounded-2xl border transition-colors duration-150 motion-reduce:transition-none cursor-pointer relative ${
            value === "customer_request"
              ? "border-amber-500 bg-amber-50/60 shadow-2xs ring-1 ring-amber-500/30"
              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
          }`}
        >
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <span
              className={`flex items-center gap-1.5 text-xs font-black ${
                value === "customer_request"
                  ? "text-amber-950"
                  : "text-slate-800"
              }`}
            >
              <UserX
                size={15}
                className={
                  value === "customer_request"
                    ? "text-amber-600"
                    : "text-slate-500"
                }
              />
              Theo yêu cầu của Khách
            </span>
            <span className="text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
              Trừ phí phạt
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Khách báo hủy vì việc cá nhân. Áp dụng bảng phạt theo số ngày trước ngày đi.
          </p>
        </button>
      </div>
    </div>
  );
}

