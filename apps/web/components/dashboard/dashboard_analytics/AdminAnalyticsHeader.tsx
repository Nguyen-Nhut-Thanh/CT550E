"use client";

import {
  Calendar,
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { AdminDatePicker } from "@/components/common/date_time/AdminDatePicker";
import { AdminScenicHeaderBackground } from "@/components/common/admin_shared/layout/AdminScenicHeaderBackground";
import type { ReactNode } from "react";

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
  rightSlot?: ReactNode;
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
  rightSlot,
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
    <header className="relative isolate @container/analytics-header">
      <AdminScenicHeaderBackground />
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 @max-[760px]/analytics-header:flex-col @max-[760px]/analytics-header:items-start @max-[760px]/analytics-header:gap-2.5">
        <div className="min-w-0">
          <h1 className="text-[24px] font-extrabold leading-[1.25] tracking-[-.6px]! text-[#07123e] @max-[760px]/analytics-header:text-[22px]">Báo cáo & Thống kê toàn diện</h1>
          <p className="mt-[3px] text-[12px] leading-[1.5] text-[#637da5]">Theo dõi doanh thu, tour, nhân sự điều hành, khách hàng và hiệu quả marketing.</p>
        </div>

        {/* Action Buttons: Refresh, Excel Export, CSV Dropdown */}
        <div className="relative flex max-w-full flex-wrap items-center gap-2" ref={csvMenuRef}>
          {/* Refresh Button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#d6e7fb] bg-[#ffffffd9] text-[#5e84b7] hover:bg-[#f3f8ff] disabled:opacity-45"
            title="Làm mới dữ liệu"
            aria-label="Làm mới dữ liệu báo cáo"
          >
            <RefreshCw
              size={17}
              className={isRefreshing ? "animate-spin text-blue-600" : "text-[#7387aa]"}
            />
          </button>

          {/* Export Excel (Primary) */}
          <button
            type="button"
            onClick={onExportExcel}
            disabled={exportingExcel}
            className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-[#075bff] bg-[#075bff] px-4 py-[9px] text-[14px] font-[650] text-white shadow-[0_5px_13px_#075bff12] transition-colors duration-180 hover:bg-[#064ddd] disabled:opacity-45 motion-reduce:transition-none @max-[760px]/analytics-header:px-3 @max-[760px]/analytics-header:text-[12px]"
          >
            {exportingExcel ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={18} />
            )}
            <span>{exportingExcel ? "Đang xuất…" : "Xuất Excel (.xls)"}</span>
          </button>

          {/* CSV Export Dropdown */}
          <div>
            <button
              type="button"
              onClick={() => setShowCsvMenu((prev) => !prev)}
              aria-expanded={showCsvMenu}
              aria-controls="analytics-csv-options"
              className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-[#c4ddff] bg-[#ffffffed] px-4 py-[9px] text-[14px] font-[650] text-[#075bff] transition-colors duration-180 hover:bg-[#f3f8ff] motion-reduce:transition-none @max-[760px]/analytics-header:px-3 @max-[760px]/analytics-header:text-[12px]"
            >
              <Download size={18} className="text-[#7387aa]" />
              <span>Xuất CSV</span>
              <ChevronDown size={13} className="text-[#7387aa]" />
            </button>

            {showCsvMenu && (
              <div id="analytics-csv-options" className="absolute right-0 top-full mt-1.5 z-30 w-64 max-w-full rounded-[12px] border border-[#e1edfc] bg-white p-1.5 shadow-lg">
                <div className="px-2.5 py-1 text-[11px] font-[650] text-[#7387aa]">
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
                    className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-[12px] font-[650] text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
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
      <div className={rightSlot ? "mt-4 flex min-w-0 flex-col gap-2 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(190px,1fr)] lg:items-stretch lg:gap-3" : "mt-4"}>
      <div className="min-h-[52px] rounded-2xl border border-slate-200/80 bg-slate-50/70 p-1.5 sm:px-3 lg:flex lg:min-w-0 lg:items-center lg:justify-between">
        <div className="flex w-full min-w-0 flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span className="mr-1 hidden sm:inline-flex items-center gap-1 text-xs font-bold text-slate-500">
            <Calendar size={13} />
            Kỳ báo cáo:
          </span>
          <CustomDropdown
            ariaLabel="Chọn kỳ báo cáo"
            variant="compact"
            selectedValue={timeRange === "custom" ? "month" : timeRange}
            onSelect={setTimeRange}
            options={ranges.filter((range) => range.key !== "custom").map(({ key, label }) => ({ value: key, label }))}
            className="w-[155px] [&_button]:!h-8 [&_button]:!min-h-0 [&_button]:!min-w-0 [&_button]:!rounded-xl [&_button]:!px-3 [&_button]:!py-1 [&_button]:!text-xs"
          />
          <button
            type="button"
            onClick={() => setTimeRange("custom")}
            aria-pressed={timeRange === "custom"}
            className={`ml-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors duration-150 ${timeRange === "custom" ? "border-blue-600 bg-blue-600 text-white shadow-xs" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}
          >
            Tùy chọn
          </button>
        </div>

        {/* Custom Date Pickers when 'custom' is active */}
        <div
          aria-hidden={timeRange !== "custom"}
          inert={timeRange !== "custom"}
          className={`grid min-w-0 overflow-hidden transition-[grid-template-rows,opacity,margin,width] duration-200 ease-out ${timeRange === "custom" ? "mt-1 w-full grid-rows-[1fr] opacity-100 lg:ml-auto lg:mt-0 lg:w-[470px] lg:shrink-0" : "mt-0 w-0 grid-rows-[0fr] opacity-0"}`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex w-max flex-nowrap items-center gap-2">
              <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-600">
                <span>Từ</span>
                <div className="w-[150px] [&_button]:!h-8 [&_button]:!min-h-8 [&_button]:!py-1">
                <AdminDatePicker
                  variant="compact"
                  placeholder="Từ ngày"
                  value={startDate}
                  onChange={setStartDate}
                />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-600">
                <span>Đến</span>
                <div className="w-[150px] [&_button]:!h-8 [&_button]:!min-h-8 [&_button]:!py-1">
                <AdminDatePicker
                  variant="compact"
                  placeholder="Đến ngày"
                  value={endDate}
                  minDate={startDate}
                  onChange={setEndDate}
                />
                </div>
              </div>
              <button
                type="button"
                onClick={onApplyCustomRange}
                tabIndex={timeRange === "custom" ? 0 : -1}
                className="h-8 shrink-0 whitespace-nowrap rounded-lg bg-blue-600 px-3 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
      {rightSlot && <div className="flex justify-end lg:items-center lg:justify-end">{rightSlot}</div>}
      </div>
    </header>
  );
}

