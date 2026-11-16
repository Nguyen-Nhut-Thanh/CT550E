"use client";

import type { AdminStatusBadgeProps, AdminStatusBadgeTone as Tone } from 'shared';

const toneClassMap: Record<Tone, string> = {
  success: "border-emerald-100 bg-emerald-50 text-emerald-600",
  warning: "border-amber-100 bg-amber-50 text-amber-600",
  muted: "border-slate-200 bg-slate-100 text-slate-500",
};

/** Hiển thị nhãn trạng thái bằng màu sắc và nội dung tương ứng. */
export function AdminStatusBadge({
  tone,
  icon,
  children,
  className = "",
}: AdminStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${toneClassMap[tone]} ${className}`.trim()}
    >
      {icon}
      {children}
    </span>
  );
}
