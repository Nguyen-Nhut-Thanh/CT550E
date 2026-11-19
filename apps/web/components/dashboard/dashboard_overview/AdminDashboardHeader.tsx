"use client";

import { Download, RefreshCw } from "lucide-react";
import { useState } from "react";
import { AdminScenicHeaderBackground } from "@/components/common/admin_shared/layout/AdminScenicHeaderBackground";
import type { DashboardHeaderProps, DashboardTimeRange } from "shared";

export function DashboardHeader({
  timeRange,
  onTimeRangeChange,
  onRefresh,
  onExportCsv,
  isRefreshing = false,
}: DashboardHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await onExportCsv();
    } finally {
      setIsExporting(false);
    }
  };

  const rangeOptions: { value: DashboardTimeRange; label: string }[] = [
    { value: "7d", label: "7 ngày qua" },
    { value: "30d", label: "30 ngày qua" },
    { value: "month", label: "Tháng này" },
    { value: "year", label: "Năm nay" },
  ];

  return (
    <header className="relative isolate @container/dashboard-header">
      <AdminScenicHeaderBackground />
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 @max-[760px]/dashboard-header:flex-col @max-[760px]/dashboard-header:items-start @max-[760px]/dashboard-header:gap-2.5">
      <div className="min-w-0">
        <h1 className="text-[24px] font-extrabold leading-[1.25] tracking-[-.6px]! text-[#07123e] @max-[760px]/dashboard-header:text-[22px]">
          {getGreeting()}, Quản trị viên
        </h1>
        <p className="mt-[3px] text-[12px] leading-[1.5] text-[#637da5]">
          Theo dõi tổng quan doanh thu, lịch trình tour và đơn đặt tour trong thời gian thực.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Làm mới dữ liệu"
          aria-label="Làm mới dữ liệu dashboard"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d6e7fb] bg-[#ffffffd9] text-[#5e84b7] hover:bg-[#f3f8ff] disabled:opacity-45"
        >
          <RefreshCw size={17} className={isRefreshing ? "animate-spin text-blue-600" : ""} />
        </button>

        {/* Export CSV button */}
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-[#075bff] bg-[#075bff] px-4 py-[9px] text-[14px] font-[650] text-white shadow-[0_5px_13px_#075bff12] transition-colors duration-180 hover:bg-[#064ddd] disabled:opacity-45 motion-reduce:transition-none @max-[760px]/dashboard-header:px-3 @max-[760px]/dashboard-header:text-[12px]"
        >
          <Download size={18} />
          {isExporting ? "Đang xuất..." : "Xuất báo cáo CSV"}
        </button>
      </div>
      </div>
      <div className="relative z-10 mt-3 flex w-fit max-w-full gap-1 overflow-x-auto rounded-[14px] border border-blue-100/80 bg-white/95 p-1 shadow-[0_3px_14px_#4d9bff05]" role="group" aria-label="Khoảng thời gian thống kê">
        {rangeOptions.map((opt) => (
          <button key={opt.value} type="button" aria-pressed={timeRange === opt.value} onClick={() => onTimeRangeChange(opt.value)} className={`inline-flex min-h-9 shrink-0 items-center whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-[650] transition-colors duration-180 motion-reduce:transition-none ${timeRange === opt.value ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-[0_4px_10px_#075bff20]" : "text-[#5d7299] hover:bg-blue-50 hover:text-blue-600"}`}>
            {opt.label}
          </button>
        ))}
      </div>
    </header>
  );
}
