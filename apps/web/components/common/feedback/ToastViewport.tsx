"use client";

import { removeToast, subscribeToasts } from "@/lib/notifications/toast-store";
import { useEffect, useState } from "react";
import type { Toast } from "shared";
import { ToastItem } from "./ToastItem";

/** Hiển thị danh sách các thông báo ngắn đang còn hiệu lực. */
export function ToastViewport() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

