"use client";

import { DashboardAnalyticsChart } from "@/components/dashboard/dashboard_overview/AdminDashboardAnalyticsChart";
import { DashboardHeader } from "@/components/dashboard/dashboard_overview/AdminDashboardHeader";
import { DashboardKpiCards } from "@/components/dashboard/dashboard_overview/AdminDashboardKpiCards";
import { DashboardRecentBookings } from "@/components/dashboard/dashboard_overview/AdminDashboardRecentBookings";
import { AdminModalShell } from "@/components/common/admin_shared/layout/AdminModalShell";
import { DashboardStatusBreakdown } from "@/components/dashboard/dashboard_overview/AdminDashboardStatusBreakdown";
import { DashboardTopTours } from "@/components/dashboard/dashboard_overview/AdminDashboardTopTours";
import { downloadDashboardCsvReport, getDashboardStats } from "@/lib/dashboard/admin/api";
import { useToast } from "@/lib/notifications/useToast";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { DashboardStats, DashboardTimeRange } from "shared";

export default function AdminDashboardPage() {
  const [showStatus, setShowStatus] = useState(false);
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<DashboardTimeRange>("month");
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const loadData = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);
        const stats = await getDashboardStats(timeRange);
        setData(stats);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Đã có lỗi xảy ra khi kết nối máy chủ thống kê.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [timeRange, toast],
  );

  useEffect(() => {
    let active = true;

    async function initialLoad() {
      try {
        setLoading(true);
        setError(null);
        const stats = await getDashboardStats(timeRange);
        if (active) {
          setData(stats);
        }
      } catch (err) {
        if (active) {
          const message =
            err instanceof Error
              ? err.message
              : "Đã có lỗi xảy ra khi tải dữ liệu thống kê.";
          setError(message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      active = false;
    };
  }, [timeRange]);

  const handleExportCsv = async () => {
    try {
      await downloadDashboardCsvReport();
      toast.success("Đã xuất file báo cáo CSV thành công!");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Xuất báo cáo thất bại.";
      toast.error(message);
    }
  };

  // Loading skeleton screen
  if (loading && !data) {
    return (
      <div aria-label="Đang tải tổng quan quản trị" aria-busy="true" className="space-y-3 animate-pulse motion-reduce:animate-none @container/dashboard">
        {/* Header skeleton */}
        <div className="h-28 rounded-[14px] bg-white" />

        {/* KPI Cards skeleton */}
        <div className="grid grid-cols-4 gap-3 @max-[1180px]/dashboard:grid-cols-2 @max-[650px]/dashboard:grid-cols-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-[14px] bg-white" />
          ))}
        </div>

        {/* Secondary mini-counters skeleton */}
        <div className="grid grid-cols-4 gap-3 @max-[900px]/dashboard:grid-cols-2 @max-[650px]/dashboard:grid-cols-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-[14px] bg-white" />
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="h-80 rounded-[14px] bg-white" />

        {/* 2-column widgets skeleton */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 rounded-[14px] bg-white" />
          <div className="h-96 rounded-[14px] bg-white" />
        </div>
      </div>
    );
  }

  // Error screen
  if (error && !data) {
    return (
      <div role="alert" className="flex min-h-60 flex-col items-center justify-center gap-3 rounded-[14px] border border-rose-200 bg-rose-50 p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-rose-50 text-rose-500">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-[16px] font-[750] text-[#0b1747]">
          Không Thể Tải Bảng Điều Khiển
        </h2>
        <p className="max-w-md text-[13px] text-rose-700">{error}</p>
        <button
          type="button"
          onClick={() => loadData(false)}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#075bff] px-3 py-2 text-[12px] font-[650] text-white transition-colors duration-180 hover:bg-[#064ddd] motion-reduce:transition-none"
        >
          <RefreshCw size={16} />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-w-0 space-y-3 font-sans text-sm leading-normal tracking-normal text-[#0b1747] @container/dashboard">
      {/* Dashboard Top Header & Controls */}
      <DashboardHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onRefresh={() => loadData(true)}
        onExportCsv={handleExportCsv}
        isRefreshing={refreshing}
      />

      {data && (
        <>
          {/* Main KPI Cards & Secondary Metric Counters */}
          <DashboardKpiCards kpis={data.kpis} timeRange={timeRange} />

          <div className="grid items-stretch gap-3 grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] @max-[900px]/dashboard:grid-cols-1">
            <DashboardAnalyticsChart chart={data.chart} appearance="workforce" />
            <DashboardTopTours topTours={data.topTours} />
          </div>
          <DashboardRecentBookings bookings={data.recentBookings} onShowStatus={() => setShowStatus(true)} />
          {showStatus && <AdminModalShell title="Trạng Thái Đơn Hàng" onClose={() => setShowStatus(false)} maxWidthClassName="max-w-xl">
            <div className="p-4"><DashboardStatusBreakdown statusBreakdown={data.statusBreakdown} /></div>
          </AdminModalShell>}

          {/* Quick Action Shortcuts Panel */}
        </>
      )}
    </div>
  );
}
