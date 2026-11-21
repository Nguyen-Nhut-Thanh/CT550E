"use client";

import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useDismiss } from "@/lib/ui/useDismiss";

export type TooltipPlacement = "auto" | "top" | "bottom";
export type TooltipAlign = "auto" | "left" | "right";

/** Shows supporting content on hover/focus and toggles it on touch with smart viewport placement. */
export function Tooltip({
  trigger,
  content,
  className = "",
  contentClassName = "",
  placement = "auto",
  align = "auto",
  portal = false,
}: {
  trigger: ReactElement<any>;
  content: ReactNode;
  className?: string;
  contentClassName?: string;
  placement?: TooltipPlacement;
  align?: TooltipAlign;
  /** Render outside scroll containers so their overflow cannot clip the content. */
  portal?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [computedPlacement, setComputedPlacement] = useState<"top" | "bottom">(
    placement === "top" ? "top" : "bottom",
  );
  const [computedAlign, setComputedAlign] = useState<"left" | "right">(
    align === "right" ? "right" : "left",
  );

  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [portalPosition, setPortalPosition] = useState({ left: 0, top: 0, minWidth: 0 });
  const close = useCallback(() => setOpen(false), []);
  useDismiss(containerRef, !portal && open, close);

  const showPortal = () => {
    clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hidePortal = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) close();
    }, 100);
  };
  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

    if (portal) {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;
      if (rect.right <= 0 || rect.left >= viewportWidth || rect.bottom <= 0 || rect.top >= viewportHeight) {
        close();
        return;
      }
      const width = tooltip.offsetWidth;
      const height = tooltip.offsetHeight;
      const above = placement === "top" || (placement === "auto" && viewportHeight - rect.bottom < height + 8 && rect.top > viewportHeight - rect.bottom);
      const left = align === "right" ? rect.right - width : align === "left" ? rect.left
        : rect.left + width > viewportWidth - 12 ? rect.right - width : rect.left;
      setPortalPosition({
        left: Math.max(12, Math.min(left, viewportWidth - width - 12)),
        top: Math.max(12, Math.min(above ? rect.top - height - 8 : rect.bottom + 8, viewportHeight - height - 12)),
        minWidth: Math.min(rect.width, 352, viewportWidth - 24),
      });
      return;
    }

    // 1. Placement (top vs bottom): Tự động đảo chiều nếu không gian bên dưới chật
    if (placement === "auto") {
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      if (spaceBelow < 200 && spaceAbove > spaceBelow) {
        setComputedPlacement("top");
      } else {
        setComputedPlacement("bottom");
      }
    } else {
      setComputedPlacement(placement);
    }

    // 2. Alignment (left vs right): Tự động căn lề nếu sát mép phải
    if (align === "auto") {
      const spaceRight = viewportWidth - rect.left;
      if (spaceRight < 280 && rect.right > 240) {
        setComputedAlign("right");
      } else {
        setComputedAlign("left");
      }
    } else {
      setComputedAlign(align);
    }
  }, [placement, align, portal, close]);

  useLayoutEffect(() => {
    if (!portal || !open) return;
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    const observer = new ResizeObserver(updatePosition);
    if (tooltipRef.current) observer.observe(tooltipRef.current);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      observer.disconnect();
    };
  }, [portal, open, updatePosition]);

  useEffect(() => {
    if (!portal || !open) return;
    const outside = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node) && !tooltipRef.current?.contains(event.target as Node)) close();
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [portal, open, close]);

  const triggerProps = trigger.props as {
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
    onFocus?: (event: any) => void;
    onBlur?: (event: any) => void;
    [key: string]: unknown;
  };

  const describedBy = [triggerProps["aria-describedby"], id].filter(Boolean).join(" ");
  const enhancedTrigger = cloneElement(trigger, {
    "aria-describedby": describedBy,
    "aria-expanded": open,
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      triggerProps.onMouseEnter?.(event);
      updatePosition();
      if (portal) showPortal();
    },
    onBlur: (event: any) => {
      triggerProps.onBlur?.(event);
      if (portal && !tooltipRef.current?.contains(event.relatedTarget)) close();
    },
    onFocus: (event: any) => {
      triggerProps.onFocus?.(event);
      updatePosition();
      if (portal) showPortal();
    },
    onClick: (event: MouseEvent<HTMLElement>) => {
      triggerProps.onClick?.(event);
      if (!event.defaultPrevented) {
        updatePosition();
        if (portal) showPortal();
        else setOpen((value) => !value);
      }
    },
  });

  const placementClass = computedPlacement === "top" ? "bottom-full mb-2" : "top-full mt-2";
  const alignClass = computedAlign === "right" ? "right-0" : "left-0";

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => { updatePosition(); if (portal) showPortal(); }}
      onMouseLeave={portal ? hidePortal : undefined}
      className={`group/tooltip relative ${open ? "z-30" : ""} ${className}`}
    >
      {enhancedTrigger}
      {portal ? open && createPortal(
        <div
          ref={tooltipRef}
          id={id}
          role="tooltip"
          onMouseEnter={showPortal}
          onMouseLeave={hidePortal}
          style={portalPosition}
          className={`fixed z-[200] w-max max-w-[min(22rem,calc(100vw-24px))] max-h-[calc(100dvh-24px)] overflow-y-auto rounded-xl border border-sky-100 bg-white p-3.5 text-left shadow-xl ${contentClassName}`}
        >
          {content}
        </div>, document.body,
      ) : <div
        id={id}
        role="tooltip"
        className={`absolute ${alignClass} ${placementClass} z-40 hidden w-max min-w-full max-w-[min(22rem,85vw)] rounded-xl border border-sky-100 bg-white p-3.5 text-left shadow-xl group-hover/tooltip:block group-focus-within/tooltip:block ${
          open ? "!block" : ""
        } ${contentClassName}`}
      >
        {content}
      </div>}
    </div>
  );
}
