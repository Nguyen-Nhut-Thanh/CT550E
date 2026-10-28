"use client";

import { DashboardAnalyticsChart } from "@/components/admin/dashboard/DashboardAnalyticsChart";
import { DashboardHeader } from "@/components/admin/dashboard/DashboardHeader";
import { DashboardKpiCards } from "@/components/admin/dashboard/DashboardKpiCards";
import { DashboardRecentBookings } from "@/components/admin/dashboard/DashboardRecentBookings";
import { AdminModalShell } from "@/components/common/AdminModalShell";
import { DashboardStatusBreakdown } from "@/components/admin/dashboard/DashboardStatusBreakdown";
import { DashboardTopTours } from "@/components/admin/dashboard/DashboardTopTours";
import { downloadDashboardCsvReport, getDashboardStats } from "@/lib/admin/dashboard/api";
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
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div className="h-28 rounded-3xl bg-slate-200/70" />

        {/* KPI Cards skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-36 rounded-3xl bg-slate-200/70" />
          ))}
        </div>

        {/* Secondary mini-counters skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-200/70" />
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="h-80 rounded-3xl bg-slate-200/70" />

        {/* 2-column widgets skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-96 rounded-3xl bg-slate-200/70" />
          <div className="h-96 rounded-3xl bg-slate-200/70" />
        </div>
      </div>
    );
  }

  // Error screen
  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-rose-200 bg-white p-12 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-500">
          <AlertCircle size={32} />
        </div>
        <h2 className="mt-4 text-xl font-black text-slate-900">
          Không Thể Tải Bảng Điều Khiển
        </h2>
        <p className="mt-2 max-w-md text-sm text-slate-500">{error}</p>
        <button
          type="button"
          onClick={() => loadData(false)}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95"
        >
          <RefreshCw size={16} />
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard space-y-4">
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

          <div className="grid grid-cols-1 items-stretch gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(340px,1fr)]">
            <DashboardAnalyticsChart chart={data.chart} />
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
