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
    <div className="space-y-3">
      {/* Chart Section */}
      <DashboardAnalyticsChart
        chart={chart}
        appearance="workforce"
        title="Diễn Biến Doanh Thu & Lượng Đặt Tour"
        description="Xu hướng phát sinh doanh thu và đơn đặt tour theo các mốc thời gian."
        bookingsLabel="Lượng đơn"
      />
      {/* Revenue by Period Breakdown Table */}
      <div className="min-w-0 rounded-[14px] border border-[#e1edfc] bg-white overflow-hidden">
        <div className="p-4 border-b border-[#edf2fb] flex items-center justify-between">
          <div>
            <h4 className="text-[16px] font-[750] leading-[1.5] text-[#0b1747]">
              Bảng Kê Chi Tiết Diễn Biến Doanh Thu Theo Mốc
            </h4>
            <p className="text-xs text-[#7387aa]">
              Số liệu chi tiết từng chu kỳ để đối soát kế toán và lập báo cáo
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f4f8fd] text-[12px] text-[#657b9f] border-b border-[#e1edfc] font-semibold ">
              <tr>
                <th className="py-3 px-4">Thời gian / Mốc</th>
                <th className="py-3 px-4 text-right">Doanh thu ghi nhận</th>
                <th className="py-3 px-4 text-center">Lượt booking</th>
                <th className="py-3 px-4 text-right">Giá trị TB/Đơn (AOV)</th>
                <th className="py-3 px-4 text-right">Tỷ trọng (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2fb] font-medium text-slate-700">
              {chart.map((row) => {
                const totalRev = financials.totalRevenue || 1;
                const ratio = Math.round((row.revenue / totalRev) * 100);
                const aov = row.bookings > 0 ? Math.round(row.revenue / row.bookings) : 0;
                return (
                  <tr key={row.date} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#0b1747]">{row.label}</td>
                    <td className="py-3 px-4 text-right font-extrabold text-[#075bff]">
                      {formatVND(row.revenue)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-bold text-[#0b1747]">
                        {row.bookings}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{formatVND(aov)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold text-slate-600">{ratio}%</span>
                        <div className="h-2 w-14 rounded-[20px] bg-[#e1eaf7] overflow-hidden">
                          <div
                            className="h-full bg-[#075bff] rounded-full"
                            style={{ width: `${Math.min(ratio, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-[#0b1747]">
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

