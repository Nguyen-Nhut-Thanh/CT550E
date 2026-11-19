"use client";

import { CalendarDays } from "lucide-react";

export function ScheduleEmptyState() {
  return (
    <section className="min-w-0 rounded-[14px] border border-[#e1edfc] bg-white shadow-[0_4px_20px_#476dae06] p-6 flex flex-col h-[calc(100vh-160px)] min-h-[700px] max-h-[940px] admin-max-900:h-[600px] admin-max-900:min-h-0 items-center justify-center text-center">
      <div className="flex items-center justify-center flex-col gap-3 max-w-sm text-[#8ca1be]">
        <span className="grid place-items-center size-14 rounded-2xl bg-blue-50 text-[#075bff] border border-blue-100">
          <CalendarDays size={28} />
        </span>
        <strong className="text-[15px] text-[#0b1747] font-bold mt-1">Chọn tour để xem lịch khởi hành</strong>
        <p className="text-[12.5px] text-[#637da5] leading-normal">Danh sách các đợt khởi hành, tình trạng chỗ và thao tác quản lý sẽ hiển thị tại đây.</p>
      </div>
    </section>
  );
}
