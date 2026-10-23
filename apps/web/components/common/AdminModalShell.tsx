"use client";

import { X } from "lucide-react";
import { useId } from "react";
import type { AdminModalShellProps } from 'shared';
import { Dialog } from "./Dialog";

/** Hiển thị popup biểu mẫu với tiêu đề, nội dung và vùng nút thao tác. */
export function AdminModalShell({
  title,
  icon,
  onClose,
  children,
  footer,
  maxWidthClassName = "max-w-2xl",
}: AdminModalShellProps) {
  const titleId = useId();
  return (
    <Dialog onClose={onClose} labelledBy={titleId}>
      <div
        className={`my-auto max-h-full w-full overflow-y-auto rounded-3xl border border-slate-100 bg-white shadow-2xl ${maxWidthClassName}`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-white p-6">
          <h3 id={titleId} className="flex items-center gap-3 text-lg font-bold text-slate-900">
            {icon ? <div className="rounded-xl bg-blue-50 p-2 text-blue-600">{icon}</div> : null}
            {title}
          </h3>
          <button
            type="button"
            aria-label="Đóng popup"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-all hover:bg-slate-50"
          >
            <X size={20} />
          </button>
        </div>

        <div>{children}</div>

        {footer ? (
          <div className="flex gap-4 border-t border-slate-100 bg-slate-50/50 p-8">
            {footer}
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
