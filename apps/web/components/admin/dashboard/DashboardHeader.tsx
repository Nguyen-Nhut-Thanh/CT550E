"use client";

import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import type { DashboardTimeRange } from "@/lib/admin/dashboardApi";

interface DashboardHeaderProps {
  timeRange: DashboardTimeRange;
  onTimeRangeChange: (range: DashboardTimeRange) => void;
  onRefresh: () => void;
  onExportCsv: () => Promise<void>;
  isRefreshing?: boolean;
}

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
    <div className="dashboard-welcome relative isolate flex min-h-36 flex-col gap-5 overflow-hidden rounded-2xl border border-blue-100 p-5 shadow-sm 2xl:flex-row 2xl:items-start 2xl:justify-between">
      <div>
        <div className="hidden">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Hệ thống ổn định
          </span>
          <span className="text-xs font-medium text-slate-400">
            Cập nhật lúc: {new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
          {getGreeting()}, <span className="text-blue-600">Quản trị viên</span> <span className="inline-block text-2xl">👋</span>
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Theo dõi tổng quan doanh thu, lịch trình tour và đơn đặt tour trong thời gian thực.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Time range selector pills */}
        <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {rangeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onTimeRangeChange(opt.value)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                timeRange === opt.value
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Làm mới dữ liệu"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={17} className={isRefreshing ? "animate-spin text-blue-600" : ""} />
        </button>

        {/* Export CSV button */}
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50/80 px-4 py-2 text-xs font-bold text-blue-700 shadow-sm transition-all hover:bg-blue-100 hover:text-blue-800 active:scale-95 disabled:opacity-50"
        >
          <Download size={15} className={isExporting ? "animate-bounce" : ""} />
          {isExporting ? "Đang xuất..." : "Xuất báo cáo CSV"}
        </button>
      </div>
    </div>
  );
}
