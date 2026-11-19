"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function PostEditorCard({
  id,
  title,
  description,
  icon: Icon,
  headerAction,
  className = "",
  children,
}: {
  id?: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  headerAction?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`min-w-0 rounded-[16px] border border-[#e1eaf7] bg-white shadow-[0_4px_12px_#3869a70a] ${className}`}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-[36px] shrink-0 place-items-center rounded-full border border-[#e3efff] bg-[linear-gradient(135deg,#f1f8ff,#e3efff)] text-blue-600 shadow-2xs">
            <Icon size={18} strokeWidth={2} />
          </span>
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold tracking-tight text-slate-900 leading-snug">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs text-slate-500 leading-normal">
                {description}
              </p>
            )}
          </div>
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>
      <div className="border-t border-[#edf1f8]" />
      <div className="p-5">{children}</div>
    </section>
  );
}

