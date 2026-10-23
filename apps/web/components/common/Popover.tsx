"use client";

import { useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";

/** Hiển thị nội dung nổi cạnh ô nhập, tránh bị cắt bởi popup hoặc vùng có thanh cuộn. */
export function Popover({ anchorRef, children, className = "", matchAnchorWidth = false, width = 260, align = "start" }: {
  anchorRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  className?: string;
  matchAnchorWidth?: boolean;
  width?: number;
  align?: "start" | "end";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const panel = ref.current;
    if (!panel) return;
    // Native popovers stay in the top layer, including when opened inside a dialog.
    panel.showPopover();
    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const box = anchor.getBoundingClientRect();
      const padding = 8;
      const panelWidth = Math.min(matchAnchorWidth ? box.width : width, window.innerWidth - padding * 2);
      panel.style.width = `${Math.max(0, panelWidth)}px`;
      const below = window.innerHeight - box.bottom - padding * 2;
      const above = box.top - padding * 2;
      const useBelow = below >= panel.scrollHeight || below >= above;
      const available = Math.max(0, useBelow ? below : above);
      panel.style.maxHeight = `${available}px`;
      const height = Math.min(panel.scrollHeight, available);
      const left = align === "end" ? box.right - panelWidth : box.left;
      panel.style.left = `${Math.max(padding, Math.min(left, window.innerWidth - panelWidth - padding))}px`;
      panel.style.top = `${useBelow ? box.bottom + padding : Math.max(padding, box.top - height - padding)}px`;
      panel.style.opacity = "1";
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(panel);
    if (anchorRef.current) observer.observe(anchorRef.current);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      panel.hidePopover();
    };
  }, [anchorRef, matchAnchorWidth, width, align]);

  return <div ref={ref} popover="manual" className={`fixed m-0 overflow-y-auto ${className}`} style={{ opacity: 0, inset: "auto" }}>{children}</div>;
}
