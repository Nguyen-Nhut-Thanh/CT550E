"use client";

import {
  BarChart3,
  Calendar,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface AnalyticsHeaderProps {
  timeRange: string;
  setTimeRange: (range: string) => void;
  startDate: string;
  setStartDate: (d: string) => void;
  endDate: string;
  setEndDate: (d: string) => void;
  onApplyCustomRange: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onExportExcel: () => Promise<void>;
  onExportCsv: (section: string) => Promise<void>;
  exportingExcel: boolean;
  exportingCsv: string | null;
}

export function AnalyticsHeader({
  timeRange,
  setTimeRange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onApplyCustomRange,
  onRefresh,
  isRefreshing,
  onExportExcel,
  onExportCsv,
  exportingExcel,
  exportingCsv,
}: AnalyticsHeaderProps) {
  const [showCsvMenu, setShowCsvMenu] = useState(false);
  const csvMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (csvMenuRef.current && !csvMenuRef.current.contains(e.target as Node)) {
        setShowCsvMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const ranges = [
    { key: "7d", label: "7 ngày qua" },
    { key: "30d", label: "30 ngày qua" },
    { key: "month", label: "Tháng này" },
    { key: "year", label: "Năm nay" },
    { key: "custom", label: "Tùy chọn" },
  ];

  const csvSections = [
    { key: "revenue", label: "Doanh thu & Đơn hàng" },
    { key: "tours", label: "Top Tour bán chạy" },
    { key: "workforce", label: "Nhân sự điều hành" },
    { key: "customers", label: "Khách hàng VIP" },
    { key: "marketing", label: "Khuyến mãi & Đánh giá" },
  ];

  return (
    <div className="space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                Báo Cáo & Thống Kê Toàn Diện
              </h1>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Toàn bộ dữ liệu doanh thu, tour, lịch trình, nhân sự điều hành, hội viên VIP và marketing
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons: Refresh, Excel Export, CSV Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-60 transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin text-blue-600" : "text-slate-500"}
            />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          {/* Export Excel (Primary) */}
          <button
            type="button"
            onClick={onExportExcel}
            disabled={exportingExcel}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs shadow-emerald-600/25 hover:bg-emerald-700 disabled:opacity-60 transition-all"
          >
            {exportingExcel ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={15} />
            )}
            <span>Xuất Excel Đa Trang Tính (.xls)</span>
          </button>

          {/* CSV Export Dropdown */}
          <div className="relative" ref={csvMenuRef}>
            <button
              type="button"
              onClick={() => setShowCsvMenu((prev) => !prev)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <Download size={14} className="text-slate-500" />
              <span>Xuất CSV</span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {showCsvMenu && (
              <div className="absolute right-0 top-full mt-1.5 z-30 w-56 rounded-2xl border border-slate-200/80 bg-white p-1.5 shadow-xl">
                <div className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Chọn phân mục CSV
                </div>
                {csvSections.map((sec) => (
                  <button
                    key={sec.key}
                    type="button"
                    onClick={() => {
                      setShowCsvMenu(false);
                      onExportCsv(sec.key);
                    }}
                    disabled={exportingCsv === sec.key}
                    className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-blue-500" />
                      <span>{sec.label}</span>
                    </div>
                    {exportingCsv === sec.key && (
                      <Loader2 size={13} className="animate-spin text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Date Range Selector Pill Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-2 sm:px-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 hidden sm:inline-flex items-center gap-1 text-xs font-bold text-slate-500">
            <Calendar size={13} />
            Kỳ báo cáo:
          </span>
          {ranges.map((r) => {
            const isActive = timeRange === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => setTimeRange(r.key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>

        {/* Custom Date Pickers when 'custom' is active */}
        {timeRange === "custom" && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span>Từ</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <span>Đến</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
            <button
              type="button"
              onClick={onApplyCustomRange}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              Áp dụng
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

