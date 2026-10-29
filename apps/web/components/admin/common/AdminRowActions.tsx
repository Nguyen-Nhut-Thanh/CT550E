"use client";

import Link from "next/link";
import { MoreVertical } from "lucide-react";
import { useId, useRef, useState, type ReactNode } from "react";
import { useDismiss } from "@/lib/ui/useDismiss";
import { Popover } from "@/components/common/overlays/Popover";

export type AdminRowAction = {
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
};

/** Hiển thị nút ba chấm để mở các lựa chọn thao tác trên một dòng dữ liệu quản trị. */
export function AdminRowActions({
  label,
  actions,
  disabled = false,
}: {
  label: string;
  actions: AdminRowAction[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const anchor = useRef<HTMLButtonElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useDismiss(wrapper, open, () => setOpen(false));
  const focus = (index: number) => {
    const items = panel.current?.querySelectorAll<HTMLElement>("a,button");
    if (items?.length) items[(index + items.length) % items.length].focus();
  };
  return (
    <div ref={wrapper}>
      <button
        type="button"
        ref={anchor}
        disabled={disabled}
        className="ui-admin-row-actions-trigger inline-grid place-items-center w-[34px] h-[36px] [border:1px_solid_#e1eaf7] rounded-[9px] text-[#496ba4] [background:white] [&:hover]:[background:#edf4ff] [&:hover]:[border-color:#b0ceff] [&:disabled]:opacity-[.45] [&:disabled]:cursor-wait [&:focus-visible]:[outline:2px_solid_#3b82f6] [&:focus-visible]:outline-offset-[2px]"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() =>
              focus(event.key === "ArrowUp" ? actions.length - 1 : 0),
            );
          }
        }}
      >
        <MoreVertical size={19} />
      </button>
      {open && (
        <Popover
          anchorRef={anchor}
          align="end"
          width={224}
          className="ui-admin-row-actions-menu [&_:is(a,button):focus-visible]:[outline:2px_solid_#3b82f6] [&_:is(a,button):focus-visible]:outline-offset-[2px] p-[6px] [border:1px_solid_#e0e9f8] rounded-[12px] [background:white] [box-shadow:0_12px_40px_#1d3e6822] [&>div]:flex [&>div]:flex-col [&_a]:flex [&_a]:items-center [&_a]:gap-[10px] [&_a]:text-left [&_a]:rounded-[7px] [&_a]:p-[10px] [&_a]:text-[13px] [&_a]:text-[#49658e] [&_button]:flex [&_button]:items-center [&_button]:gap-[10px] [&_button]:text-left [&_button]:rounded-[7px] [&_button]:p-[10px] [&_button]:text-[13px] [&_button]:text-[#49658e] [&_svg]:shrink-0 [&_a:hover]:[background:#eef5ff] [&_a:hover]:text-[#075bff] [&_button:hover]:[background:#eef5ff] [&_button:hover]:text-[#075bff] [&_.ui-admin-row-actions-danger]:text-[#e3485d] [&_.ui-admin-row-actions-danger:hover]:text-[#cb2642] [&_.ui-admin-row-actions-danger:hover]:[background:#fff0f3]"
        >
          <div
            id={id}
            ref={panel}
            aria-label={label}
            onKeyDown={(event) => {
              const items = Array.from(
                panel.current?.querySelectorAll("a,button") ?? [],
              );
              const index = items.indexOf(document.activeElement as Element);
              const target =
                event.key === "ArrowDown"
                  ? index + 1
                  : event.key === "ArrowUp"
                    ? index - 1
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? actions.length - 1
                        : null;
              if (target !== null) {
                event.preventDefault();
                focus(target);
              }
              if (event.key === "Tab") setOpen(false);
            }}
          >
            {actions.map((action) =>
              action.href ? (
                <Link
                  key={action.label}
                  href={action.href}
                  className={
                    action.danger ? "ui-admin-row-actions-danger" : undefined
                  }
                  onClick={() => setOpen(false)}
                >
                  {action.icon}
                  {action.label}
                </Link>
              ) : (
                <button
                  type="button"
                  key={action.label}
                  className={
                    action.danger ? "ui-admin-row-actions-danger" : undefined
                  }
                  onClick={() => {
                    setOpen(false);
                    anchor.current?.focus();
                    action.onClick?.();
                  }}
                >
                  {action.icon}
                  {action.label}
                </button>
              ),
            )}
          </div>
        </Popover>
      )}
    </div>
  );
}
