"use client";

import { formatVND } from "@/lib/utils/currency";
import type { ComprehensiveAnalytics } from "shared";
import { DashboardAnalyticsChart } from "@/components/dashboard/dashboard_overview/AdminDashboardAnalyticsChart";

interface AnalyticsFinancialsTabProps {
  data: ComprehensiveAnalytics;
}

export function AnalyticsFinancialsTab({ data }: AnalyticsFinancialsTabProps) {
  const { financials, chart } = data;

  return (
    <div className="space-y-6">
      {/* Chart Section */}
      <DashboardAnalyticsChart
        chart={chart}
        title="Diễn Biến Doanh Thu & Lượng Đặt Tour"
        description="Xu hướng phát sinh doanh thu và đơn đặt tour theo các mốc thời gian."
        bookingsLabel="Lượng đơn"
      />
      {/* Revenue by Period Breakdown Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Bảng Kê Chi Tiết Diễn Biến Doanh Thu Theo Mốc
            </h4>
            <p className="text-xs text-slate-500">
              Số liệu chi tiết từng chu kỳ để đối soát kế toán và lập báo cáo
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200/70 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Thời gian / Mốc</th>
                <th className="py-3 px-4 text-right">Doanh thu ghi nhận</th>
                <th className="py-3 px-4 text-center">Lượt booking</th>
                <th className="py-3 px-4 text-right">Giá trị TB/Đơn (AOV)</th>
                <th className="py-3 px-4 text-right">Tỷ trọng (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {chart.map((row) => {
                const totalRev = financials.totalRevenue || 1;
                const ratio = Math.round((row.revenue / totalRev) * 100);
                const aov = row.bookings > 0 ? Math.round(row.revenue / row.bookings) : 0;
                return (
                  <tr key={row.date} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.label}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-blue-600">
                      {formatVND(row.revenue)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-bold text-slate-800">
                        {row.bookings}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{formatVND(aov)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold text-slate-600">{ratio}%</span>
                        <div className="h-1.5 w-14 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${Math.min(ratio, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900">
              <tr>
                <td className="py-3 px-4">TỔNG CỘNG</td>
                <td className="py-3 px-4 text-right text-blue-700">
                  {formatVND(financials.totalRevenue)}
                </td>
                <td className="py-3 px-4 text-center">{financials.totalBookings}</td>
                <td className="py-3 px-4 text-right">
                  {formatVND(financials.averageOrderValue)}
                </td>
                <td className="py-3 px-4 text-right">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

