import { adminFetch } from "../adminFetch";
import type {
  DashboardStats,
  DashboardTimeRange,
  DashboardReportRow,
  DashboardKpi,
  DashboardChartPoint,
  DashboardBookingItem,
  DashboardTopTour,
  DashboardStatusBreakdown,
} from "shared";

export type {
  DashboardStats,
  DashboardTimeRange,
  DashboardReportRow,
  DashboardKpi,
  DashboardChartPoint,
  DashboardBookingItem,
  DashboardTopTour,
  DashboardStatusBreakdown,
};

export async function getDashboardStats(
  range: DashboardTimeRange | string = "month",
): Promise<DashboardStats> {
  const res = await adminFetch(`/admin/dashboard/stats?range=${range}`);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(
      errorBody?.message || "Không thể tải dữ liệu thống kê bảng điều khiển.",
    );
  }
  return res.json();
}

export async function getDashboardReport(): Promise<DashboardReportRow[]> {
  const res = await adminFetch("/admin/dashboard/report");
  if (!res.ok) {
    throw new Error("Không thể tải danh sách báo cáo chi tiết.");
  }
  return res.json();
}

export async function downloadDashboardCsvReport(): Promise<void> {
  const res = await adminFetch("/admin/dashboard/export-csv");
  if (!res.ok) {
    throw new Error("Không thể xuất file báo cáo CSV.");
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bao-cao-thong-ke-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
