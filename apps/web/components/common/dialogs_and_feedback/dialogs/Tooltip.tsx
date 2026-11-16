"use client";

import { cloneElement, useCallback, useId, useRef, useState, type MouseEvent, type ReactElement, type ReactNode } from "react";
import { useDismiss } from "@/lib/ui/useDismiss";

/** Shows supporting content on hover/focus and toggles it on touch. */
export function Tooltip({
  trigger,
  content,
  className = "",
  contentClassName = "",
}: {
  trigger: ReactElement<any>;
  content: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(containerRef, open, close);

  const triggerProps = trigger.props as { onClick?: (event: MouseEvent<HTMLElement>) => void; [key: string]: unknown };
  const describedBy = [triggerProps["aria-describedby"], id].filter(Boolean).join(" ");
  const enhancedTrigger = cloneElement(trigger, {
    "aria-describedby": describedBy,
    "aria-expanded": open,
    onClick: (event: MouseEvent<HTMLElement>) => {
      triggerProps.onClick?.(event);
      if (!event.defaultPrevented) setOpen(value => !value);
    },
  });

  return (
    <div ref={containerRef} className={`group relative ${open ? "z-20" : ""} ${className}`}>
      {enhancedTrigger}
      <div
        id={id}
        role="tooltip"
        className={`absolute left-0 top-full z-30 mt-2 hidden w-max min-w-full max-w-[min(22rem,80vw)] rounded-xl border border-sky-100 bg-white p-4 text-left shadow-xl group-hover:block group-focus-within:block ${open ? "!block" : ""} ${contentClassName}`}
      >
        {content}
      </div>
    </div>
  );
}
