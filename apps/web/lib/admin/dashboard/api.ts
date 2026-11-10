import { adminFetch } from "@/lib/http/adminFetch";
import type { ComprehensiveAnalytics, DashboardStats, DashboardTimeRange } from "shared";

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

export async function getComprehensiveAnalytics(
  range = "month",
  from?: string,
  to?: string,
): Promise<ComprehensiveAnalytics> {
  const params = new URLSearchParams();
  if (range) params.set("range", range);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const res = await adminFetch(`/admin/dashboard/analytics?${params.toString()}`);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(
      errorBody?.message || "Không thể tải dữ liệu báo cáo thống kê toàn diện.",
    );
  }
  return res.json();
}

export async function downloadComprehensiveExcel(
  range = "month",
  from?: string,
  to?: string,
): Promise<void> {
  const params = new URLSearchParams();
  if (range) params.set("range", range);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const res = await adminFetch(`/admin/dashboard/export-excel?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Không thể xuất file báo cáo Excel toàn diện.");
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Bao-cao-thong-ke-toan-dien-${new Date().toISOString().split("T")[0]}.xls`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function downloadSectionCsv(
  section: string,
  range = "month",
  from?: string,
  to?: string,
): Promise<void> {
  const params = new URLSearchParams();
  params.set("section", section);
  if (range) params.set("range", range);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  const res = await adminFetch(`/admin/dashboard/export-section-csv?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Không thể xuất file CSV cho mục ${section}.`);
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Bao-cao-${section}-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
