"use client";

import { removeToast, subscribeToasts } from "@/lib/notifications/toast-store";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Toast } from "shared";
import { ToastItem } from "@/components/common/dialogs_and_feedback/toast/ToastItem";

/** Hiển thị danh sách các thông báo ngắn đang còn hiệu lực. */
export function ToastViewport() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return subscribeToasts(setToasts);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      style={{ zIndex: 99999 }}
      className="pointer-events-none fixed bottom-6 right-6 z-[99999] flex flex-col gap-3"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>,
    document.body,
  );
}

