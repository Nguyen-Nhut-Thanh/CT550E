"use client";

import { pushToast } from "@/lib/notifications/toast-store";
import { ToastContext } from "@/lib/notifications/useToast";
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import type { ToastContextType, ToastType } from "shared";
import { ToastViewport } from "./ToastViewport";

/** Cung cấp chức năng tạo thông báo ngắn cho toàn bộ ứng dụng. */
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    if (!mountedRef.current || typeof window === "undefined") {
      return;
    }

    pushToast(message, type);
  }, []);

  const contextValue = useMemo<ToastContextType>(
    () => ({
      showToast,
      success: (message: string) => showToast(message, "success"),
      error: (message: string) => showToast(message, "error"),
      info: (message: string) => showToast(message, "info"),
      warning: (message: string) => showToast(message, "warning"),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
};

