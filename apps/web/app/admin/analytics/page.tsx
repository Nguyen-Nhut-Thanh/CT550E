"use client";

import { AnalyticsCustomersTab } from "@/components/admin/analytics/AnalyticsCustomersTab";
import { AnalyticsFinancialsTab } from "@/components/admin/analytics/AnalyticsFinancialsTab";
import { AnalyticsHeader } from "@/components/admin/analytics/AnalyticsHeader";
import { AnalyticsKpiCards } from "@/components/admin/analytics/AnalyticsKpiCards";
import { AnalyticsMarketingTab } from "@/components/admin/analytics/AnalyticsMarketingTab";
import { AnalyticsToursTab } from "@/components/admin/analytics/AnalyticsToursTab";
import { AnalyticsWorkforceTab } from "@/components/admin/analytics/AnalyticsWorkforceTab";
import {
  downloadComprehensiveExcel,
  downloadSectionCsv,
  getComprehensiveAnalytics,
} from "@/lib/admin/dashboard/api";
import { useToast } from "@/lib/notifications/useToast";
import {
  AlertCircle,
  Award,
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
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-3xl bg-slate-200/70" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/70" />
          ))}
        </div>
        <div className="h-96 rounded-2xl bg-slate-200/70" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h3 className="mt-3 text-lg font-bold text-rose-900">
          Không thể tải dữ liệu thống kê
        </h3>
        <p className="mt-1 text-sm text-rose-600 max-w-md">{error}</p>
        <button
          type="button"
          onClick={() => fetchData()}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition-colors"
        >
          <RefreshCw size={14} />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
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
      />

      {/* KPI Cards Strip */}
      {data && <AnalyticsKpiCards data={data} />}

      {/* Nav Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 overflow-x-auto pb-1" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-2.5 text-xs font-bold transition-colors ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Tab View */}
      {data && (
        <div>
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

