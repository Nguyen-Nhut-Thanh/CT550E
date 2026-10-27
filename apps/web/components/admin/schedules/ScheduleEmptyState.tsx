"use client";

import { CalendarDays } from "lucide-react";

export function ScheduleEmptyState() {
  return (
    <section className="ui-schedule-overview-schedulePanel min-w-0 [border:1px_solid_#fff] rounded-[20px] [background:#ffffffed] [box-shadow:0_8px_28px_#476dae05] p-[16px] min-h-[420px] min-[901px]:flex min-[901px]:flex-col min-[901px]:[flex:1] min-[901px]:min-h-0 min-[901px]:overflow-hidden admin-max-1100:p-[12px] admin-max-600:p-[12px] admin-max-600:rounded-[16px]">
      <div className="ui-schedule-overview-empty flex items-center justify-center flex-col gap-[12px] p-[64px_20px] text-center text-[#8ca1be] [&_strong]:text-[14px] [&_strong]:text-[#5c769d] [&_p]:text-[12px]">
        <CalendarDays size={38} />
        <strong>Chọn tour để xem lịch khởi hành</strong>
        <p>Các đợt khởi hành và thông tin chỗ đặt sẽ hiển thị tại đây.</p>
      </div>
    </section>
  );
}
