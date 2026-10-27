"use client";

import { useEffect, useRef, type ReactNode } from "react";

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
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
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
  }, []);

  return (
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
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 backdrop-blur-sm ${overlayClassName}`}
    >
      {children}
    </div>
  );
}
