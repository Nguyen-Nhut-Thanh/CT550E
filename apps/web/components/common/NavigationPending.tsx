"use client";

import { useLinkStatus } from "next/link";
import { createPortal } from "react-dom";

/** Hiển thị thanh tiến trình ngay khi người dùng bấm liên kết và đang chờ chuyển trang. */
export function NavigationPending() {
  const { pending } = useLinkStatus();
  if (!pending) return null;

  return createPortal(
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-1 overflow-hidden bg-blue-100">
      <span aria-hidden="true" className="block h-full w-2/3 animate-pulse rounded-r-full bg-blue-600 motion-reduce:animate-none" />
      <span className="sr-only">Đang chuyển trang...</span>
    </div>,
    document.body,
  );
}
