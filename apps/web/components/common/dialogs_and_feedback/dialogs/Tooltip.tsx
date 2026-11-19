"use client";

import {
  cloneElement,
  useCallback,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
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
}: {
  trigger: ReactElement<any>;
  content: ReactNode;
  className?: string;
  contentClassName?: string;
  placement?: TooltipPlacement;
  align?: TooltipAlign;
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
  const close = useCallback(() => setOpen(false), []);
  useDismiss(containerRef, open, close);

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

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
  }, [placement, align]);

  const triggerProps = trigger.props as {
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
    onFocus?: (event: any) => void;
    [key: string]: unknown;
  };

  const describedBy = [triggerProps["aria-describedby"], id].filter(Boolean).join(" ");
  const enhancedTrigger = cloneElement(trigger, {
    "aria-describedby": describedBy,
    "aria-expanded": open,
    onMouseEnter: (event: MouseEvent<HTMLElement>) => {
      triggerProps.onMouseEnter?.(event);
      updatePosition();
    },
    onFocus: (event: any) => {
      triggerProps.onFocus?.(event);
      updatePosition();
    },
    onClick: (event: MouseEvent<HTMLElement>) => {
      triggerProps.onClick?.(event);
      if (!event.defaultPrevented) {
        updatePosition();
        setOpen((value) => !value);
      }
    },
  });

  const placementClass = computedPlacement === "top" ? "bottom-full mb-2" : "top-full mt-2";
  const alignClass = computedAlign === "right" ? "right-0" : "left-0";

  return (
    <div
      ref={containerRef}
      onMouseEnter={updatePosition}
      className={`group relative ${open ? "z-30" : ""} ${className}`}
    >
      {enhancedTrigger}
      <div
        id={id}
        role="tooltip"
        className={`absolute ${alignClass} ${placementClass} z-40 hidden w-max min-w-full max-w-[min(22rem,85vw)] rounded-xl border border-sky-100 bg-white p-3.5 text-left shadow-xl group-hover:block group-focus-within:block ${
          open ? "!block" : ""
        } ${contentClassName}`}
      >
        {content}
      </div>
    </div>
  );
}
