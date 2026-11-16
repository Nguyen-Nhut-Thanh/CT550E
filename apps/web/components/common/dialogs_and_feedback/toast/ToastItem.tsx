"use client";

import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import type { Toast } from "shared";

/** Hiển thị một thông báo ngắn và nút đóng thông báo. */
export const ToastItem = ({ toast, onClose }: { toast: Toast; onClose: () => void }) => {
  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error: <XCircle className="text-rose-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />,
    warning: <AlertCircle className="text-amber-500" size={20} />,
  };

  const colors = {
    success: "border-emerald-100 bg-white shadow-emerald-100/50",
    error: "border-rose-100 bg-white shadow-rose-100/50",
    info: "border-blue-100 bg-white shadow-blue-100/50",
    warning: "border-amber-100 bg-white shadow-amber-100/50",
  };

  return (
    <div
      role={toast.type === "error" ? "alert" : "status"}
      className={`pointer-events-auto flex min-w-[320px] max-w-md items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300 ${colors[toast.type]}`}
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <p className="flex-1 text-sm font-bold leading-tight text-slate-700">{toast.message}</p>
      <button
        type="button"
        aria-label="Đóng thông báo"
        onClick={onClose}
        className="p-1 text-slate-300 transition-colors hover:text-slate-500"
      >
        <X size={16} />
      </button>
    </div>
  );
};
