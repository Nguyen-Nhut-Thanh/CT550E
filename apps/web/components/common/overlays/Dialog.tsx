"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

let openDialogs = 0;
let previousOverflow = "";

/** Hiển thị popup và giữ thao tác bàn phím trong popup; đóng bằng Escape hoặc bấm nền. */
export function Dialog({
  children,
  onClose,
  labelledBy,
  describedBy,
  overlayClassName = "bg-slate-900/40",
}: {
  children: ReactNode;
  onClose: () => void;
  labelledBy: string;
  describedBy?: string;
  overlayClassName?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const dialog = ref.current;
    if (!dialog) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    if (openDialogs === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    openDialogs += 1;
    const focusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]',
        ),
      ).filter((element) => element.getClientRects().length > 0);
    if (!dialog.contains(document.activeElement))
      (focusable()[0] ?? dialog).focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      const dialogs = document.querySelectorAll("[data-ui-dialog]");
      if (dialogs[dialogs.length - 1] !== dialog) return;
      if (event.key === "Escape") {
        // Let an open calendar/dropdown consume Escape before closing its dialog.
        queueMicrotask(() => {
          if (!event.defaultPrevented) closeRef.current();
        });
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first) {
        event.preventDefault();
        dialog.focus();
      } else if (
        event.shiftKey &&
        (document.activeElement === first ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (document.activeElement === last ||
          !dialog.contains(document.activeElement))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      openDialogs -= 1;
      if (openDialogs === 0) document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      data-ui-dialog
      tabIndex={-1}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{ zIndex: 9999 }}
      className={`fixed inset-0 z-[9999] overflow-y-auto p-3 sm:p-4 md:p-6 backdrop-blur-sm ${overlayClassName}`}
    >
      <div
        className="flex min-h-full w-full items-center justify-center py-2 sm:py-4"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
