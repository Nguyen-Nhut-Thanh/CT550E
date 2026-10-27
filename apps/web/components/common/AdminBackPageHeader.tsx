"use client";

import { ArrowLeft } from "lucide-react";
import type { AdminBackPageHeaderProps } from 'shared';

/** Hiển thị tiêu đề trang quản trị kèm nút quay lại. */
export function AdminBackPageHeader({
  title,
  description,
  onBack,
  meta,
  actions,
}: AdminBackPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Quay lại"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition-all hover:bg-slate-50"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">{title}</h1>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed font-medium text-slate-500">{description}</p>
          ) : null}
          {meta}
        </div>
      </div>
      {actions}
    </div>
  );
}
