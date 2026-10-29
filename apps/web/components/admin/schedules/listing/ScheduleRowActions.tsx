"use client";

import { useRef, useState } from "react";
import { Eye, EyeOff, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Popover } from "@/components/common/overlays/Popover";
import { useDismiss } from "@/lib/ui/useDismiss";
import { getScheduleBookedCount } from "@/lib/admin/schedules/status";
import type { AdminSchedule, ScheduleTablePanelProps } from "shared";

export function ScheduleRowActions({
  schedule,
  busy,
  onEdit,
  onDelete,
  onToggleStatus,
}: Pick<ScheduleTablePanelProps, "onEdit" | "onDelete" | "onToggleStatus"> & {
  schedule: AdminSchedule;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLButtonElement>(null);
  useDismiss(wrapper, open, () => setOpen(false));
  return (
    <div ref={wrapper}>
      <button
        ref={anchor}
        type="button"
        disabled={busy}
        className="ui-schedule-overview-actionsTrigger inline-grid place-items-center w-[30px] h-[32px] rounded-[8px] text-[#5075ab] [&:hover]:[background:#e9f2ff] [&:hover]:text-[#075bff] [&:disabled]:opacity-[.4] [&:disabled]:cursor-wait"
        aria-label={`Thao tác lịch khởi hành ${schedule.tour_schedule_id}`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <MoreHorizontal size={22} />
      </button>
      {open && (
        <Popover
          anchorRef={anchor}
          align="end"
          width={208}
          className="ui-schedule-overview-menu p-[6px] [border:1px_solid_#e1eaf8] rounded-[12px] [background:white] [box-shadow:0_10px_32px_#263d6826] [&>div]:flex [&>div]:flex-col [&_button]:flex [&_button]:items-center [&_button]:gap-[9px] [&_button]:rounded-[7px] [&_button]:p-[10px] [&_button]:text-[12px] [&_button]:text-left [&_button]:text-[#4a648c] [&_button:hover]:[background:#edf5ff] [&_button:hover]:text-[#075bff] [&_.ui-schedule-overview-danger]:text-[#dc3653] [&_.ui-schedule-overview-danger:hover]:text-[#c72544] [&_.ui-schedule-overview-danger:hover]:[background:#fff0f3]"
        >
          <div aria-label="Thao tác lịch khởi hành">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit(schedule.tour_schedule_id);
              }}
            >
              <Pencil size={16} />
              Chỉnh sửa lịch
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                anchor.current?.focus();
                onToggleStatus(
                  schedule.tour_schedule_id,
                  schedule.status,
                  getScheduleBookedCount(schedule),
                );
              }}
            >
              {schedule.status === 1 ? <EyeOff size={16} /> : <Eye size={16} />}
              {schedule.status === 1 ? "Tạm khóa lịch" : "Mở lại lịch"}
            </button>
            <button
              type="button"
              className="ui-schedule-overview-danger"
              onClick={() => {
                setOpen(false);
                onDelete(schedule.tour_schedule_id);
              }}
            >
              <Trash2 size={16} />
              Xóa lịch khởi hành
            </button>
          </div>
        </Popover>
      )}
    </div>
  );
}
