"use client";

import { useLinkStatus } from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Hiển thị tiến trình khi chuyển trang mất hơn 200ms để tránh nháy ở các lần tải nhanh. */
export function NavigationPending() {
  const { pending } = useLinkStatus();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!pending) { setVisible(false); return; }
    const timer = window.setTimeout(() => setVisible(true), 200);
    return () => window.clearTimeout(timer);
  }, [pending]);
  if (!pending || !visible) return null;

  return createPortal(
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-1 overflow-hidden bg-blue-100">
      <span aria-hidden="true" className="block h-full w-2/3 animate-pulse rounded-r-full bg-blue-600 motion-reduce:animate-none" />
      <span className="sr-only">Đang chuyển trang...</span>
    </div>,
    document.body,
  );
}
