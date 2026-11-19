"use client";

import { X } from "lucide-react";
import { useId } from "react";
import type { AdminModalShellProps } from 'shared';
import { Dialog } from "@/components/common/dialogs_and_feedback/dialogs/Dialog";

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
        className={`my-auto max-h-full w-full overflow-y-auto rounded-[20px] border border-[#e1edfc] bg-white shadow-2xl ${maxWidthClassName}`}
      >
        <div className="flex items-center justify-between border-b border-[#e1edfc] bg-white px-6 py-4.5">
          <h3 id={titleId} className="flex items-center gap-3 text-lg font-extrabold text-[#07123e]">
            {icon ? <div className="rounded-xl bg-blue-50 p-2 text-[#075bff] shadow-2xs">{icon}</div> : null}
            {title}
          </h3>
          <button
            type="button"
            aria-label="Đóng popup"
            onClick={onClose}
            className="flex h-8.5 w-8.5 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div>{children}</div>

        {footer ? (
          <div className="flex items-center justify-end gap-3 border-t border-[#e1edfc] bg-slate-50/50 px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </Dialog>
  );
}
