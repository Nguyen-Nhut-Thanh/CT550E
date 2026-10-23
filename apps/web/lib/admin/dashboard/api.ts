import { adminFetch } from "@/lib/http/adminFetch";
import type { DashboardStats, DashboardTimeRange } from "shared";

export async function getDashboardStats(
  range: DashboardTimeRange | string = "month",
): Promise<DashboardStats> {
  const res = await adminFetch(`/admin/dashboard/stats?range=${range}`);
  if(!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(
      errorBody?.message || "Không thể tải dữ liệu thống kê bảng điều khiển.",
    );
  }
  return res.json();
}

export async function downloadDashboardCsvReport(): Promise<void> {
  const res = await adminFetch("/admin/dashboard/export-csv");
  if(!res.ok) {
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
