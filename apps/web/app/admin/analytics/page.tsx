"use client";

import { AnalyticsCustomersTab } from "@/components/dashboard/dashboard_analytics/AdminAnalyticsCustomersTab";
import { AnalyticsFinancialsTab } from "@/components/dashboard/dashboard_analytics/AdminAnalyticsFinancialsTab";
import { AnalyticsHeader } from "@/components/dashboard/dashboard_analytics/AdminAnalyticsHeader";
import { AnalyticsKpiCards } from "@/components/dashboard/dashboard_analytics/AdminAnalyticsKpiCards";
import { AnalyticsMarketingTab } from "@/components/dashboard/dashboard_analytics/AdminAnalyticsMarketingTab";
import { AnalyticsToursTab } from "@/components/dashboard/dashboard_analytics/AdminAnalyticsToursTab";
import { AnalyticsWorkforceTab } from "@/components/dashboard/dashboard_analytics/AdminAnalyticsWorkforceTab";
import {
  downloadComprehensiveExcel,
  downloadSectionCsv,
  getComprehensiveAnalytics,
} from "@/lib/dashboard/admin/api";
import { useToast } from "@/lib/notifications/useToast";
import {
  AlertCircle,
  Award,
  ChevronDown,
  Compass,
  DollarSign,
  Gift,
  RefreshCw,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ComprehensiveAnalytics } from "shared";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<ComprehensiveAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<string>("month");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "financials" | "tours" | "workforce" | "customers" | "marketing"
  >("financials");
  const [showKpis, setShowKpis] = useState(true);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingCsv, setExportingCsv] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();

  const fetchData = useCallback(
    async (isRefreshAction = false) => {
      try {
        if (isRefreshAction) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const fromParam = timeRange === "custom" ? startDate : undefined;
        const toParam = timeRange === "custom" ? endDate : undefined;

        const res = await getComprehensiveAnalytics(timeRange, fromParam, toParam);
        setData(res);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Đã xảy ra lỗi khi tải dữ liệu báo cáo thống kê.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [timeRange, startDate, endDate, toast],
  );

  useEffect(() => {
    if (timeRange !== "custom") {
      fetchData();
    }
  }, [timeRange, fetchData]);

  const handleApplyCustomRange = () => {
    if (!startDate || !endDate) {
      toast.warning("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.");
      return;
    }
    fetchData();
  };

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      const fromParam = timeRange === "custom" ? startDate : undefined;
      const toParam = timeRange === "custom" ? endDate : undefined;
      await downloadComprehensiveExcel(timeRange, fromParam, toParam);
      toast.success("Đã xuất file báo cáo Excel toàn diện (.xls) thành công!");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Xuất file báo cáo Excel thất bại.";
      toast.error(msg);
    } finally {
      setExportingExcel(false);
    }
  };

  const handleExportCsv = async (section: string) => {
    try {
      setExportingCsv(section);
      const fromParam = timeRange === "custom" ? startDate : undefined;
      const toParam = timeRange === "custom" ? endDate : undefined;
      await downloadSectionCsv(section, timeRange, fromParam, toParam);
      toast.success(`Đã xuất báo cáo CSV mục ${section} thành công!`);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : `Xuất CSV cho mục ${section} thất bại.`;
      toast.error(msg);
    } finally {
      setExportingCsv(null);
    }
  };

  const tabs = [
    {
      id: "financials",
      label: "Doanh thu & Tài chính",
      icon: DollarSign,
    },
    {
      id: "tours",
      label: "Tour & Điểm đến",
      icon: Compass,
    },
    {
      id: "workforce",
      label: "Nhân sự & Điều hành",
      icon: Award,
    },
    {
      id: "customers",
      label: "Khách hàng & Hội viên",
      icon: Users,
    },
    {
      id: "marketing",
      label: "Khuyến mãi & Đánh giá",
      icon: Gift,
    },
  ];

  if (loading && !data) {
    return (
      <div aria-label="Đang tải báo cáo thống kê" aria-busy="true" className="space-y-3 animate-pulse motion-reduce:animate-none">
        <div className="h-28 rounded-[14px] bg-white" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-[14px] bg-white" />
          ))}
        </div>
        <div className="h-96 rounded-[14px] bg-white" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div role="alert" className="flex min-h-60 flex-col items-center justify-center rounded-[14px] border border-rose-200 bg-rose-50/50 p-6 text-center">
        <AlertCircle className="h-9 w-9 text-rose-500" />
        <h3 className="mt-3 text-[16px] font-[750] text-rose-900">
          Không thể tải dữ liệu thống kê
        </h3>
        <p className="mt-1 text-[13px] text-rose-600 max-w-md">{error}</p>
        <button
          type="button"
          onClick={() => fetchData()}
          className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#075bff] px-3 py-2 text-[12px] font-[650] text-white transition-colors duration-180 hover:bg-[#064ddd] motion-reduce:transition-none"
        >
          <RefreshCw size={14} />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-w-0 space-y-3 font-sans text-sm leading-normal tracking-normal text-[#0b1747] @container/analytics">
      {/* Analytics Header with Range Selector & Excel Export */}
      <AnalyticsHeader
        timeRange={timeRange}
        setTimeRange={setTimeRange}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onApplyCustomRange={handleApplyCustomRange}
        onRefresh={() => fetchData(true)}
        isRefreshing={isRefreshing}
        onExportExcel={handleExportExcel}
        onExportCsv={handleExportCsv}
        exportingExcel={exportingExcel}
        exportingCsv={exportingCsv}
        rightSlot={data ? (
          <button
            type="button"
            aria-expanded={showKpis}
            aria-controls="analytics-kpi-cards"
            onClick={() => setShowKpis((visible) => !visible)}
            className="inline-flex min-h-9 items-center gap-2 whitespace-nowrap rounded-lg border border-[#d3e4ff] bg-white px-3 py-2 text-[12px] font-[650] text-[#075bff] transition-colors duration-180 hover:bg-[#f1f7ff] motion-reduce:transition-none"
          >
            {showKpis ? "Ẩn chỉ số tổng quan" : "Hiện chỉ số tổng quan"}
            <ChevronDown className={`h-4 w-4 transition-transform ${showKpis ? "rotate-180" : ""}`} />
          </button>
        ) : undefined}
      />

      {data && showKpis && <div id="analytics-kpi-cards"><AnalyticsKpiCards data={data} /></div>}

      {/* Nav Tabs */}
      <div className="relative min-w-0">
        <nav className="flex max-w-full gap-1 overflow-x-auto rounded-[14px] border border-blue-100/80 bg-white/95 p-1 shadow-[0_3px_14px_#4d9bff05]" aria-label="Các mục báo cáo" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`analytics-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls="analytics-tab-panel"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`inline-flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-[650] transition-colors duration-180 motion-reduce:transition-none ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-[0_4px_10px_#075bff20]"
                    : "text-[#5d7299] hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Tab View */}
      {data && (
        <div role="tabpanel" id="analytics-tab-panel" aria-labelledby={`analytics-tab-${activeTab}`}>
          {activeTab === "financials" && <AnalyticsFinancialsTab data={data} />}
          {activeTab === "tours" && <AnalyticsToursTab data={data} />}
          {activeTab === "workforce" && <AnalyticsWorkforceTab data={data} />}
          {activeTab === "customers" && <AnalyticsCustomersTab data={data} />}
          {activeTab === "marketing" && <AnalyticsMarketingTab data={data} />}
        </div>
      )}
    </div>
  );
}

