"use client";

import { formatVND } from "@/lib/utils/currency";
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import type { ComprehensiveAnalytics } from "shared";

interface AnalyticsKpiCardsProps {
  data: ComprehensiveAnalytics;
}

export function AnalyticsKpiCards({ data }: AnalyticsKpiCardsProps) {
  const { financials, customers, marketing } = data;

  const kpis = [
    {
      title: "Tổng Doanh Thu Thuần",
      value: formatVND(financials.totalRevenue),
      trend: `${financials.revenueTrend > 0 ? "+" : ""}${financials.revenueTrend}%`,
      isUp: financials.revenueTrend >= 0,
      subtitle: `${financials.completedBookings} đơn hoàn thành / ${financials.totalBookings} đơn`,
      icon: DollarSign,
      gradient: "from-blue-600 to-indigo-600",
      textColor: "text-blue-600",
      borderColor: "border-blue-100",
      glowBg: "bg-blue-500/10",
    },
    {
      title: "Tổng Lượt Đặt Tour",
      value: financials.totalBookings.toLocaleString("vi-VN"),
      trend: `${financials.bookingsTrend > 0 ? "+" : ""}${financials.bookingsTrend}%`,
      isUp: financials.bookingsTrend >= 0,
      subtitle: `${financials.cancelledBookings} đơn hủy / ${financials.totalBookings} đơn tạo`,
      icon: ShoppingBag,
      gradient: "from-emerald-600 to-teal-600",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100",
      glowBg: "bg-emerald-500/10",
    },
    {
      title: "Giá Trị Đơn Trung Bình (AOV)",
      value: formatVND(financials.averageOrderValue),
      trend: "Doanh thu TB",
      isUp: true,
      subtitle: "Bình quân trên mỗi lượt đặt thành công",
      icon: TrendingUp,
      gradient: "from-indigo-600 to-violet-600",
      textColor: "text-indigo-600",
      borderColor: "border-indigo-100",
      glowBg: "bg-indigo-500/10",
    },
    {
      title: "Thanh Toán Qua VNPAY",
      value: formatVND(financials.vnpayVolume),
      trend: "100% tỷ trọng",
      isUp: true,
      subtitle: `${financials.vnpayTransactions} giao dịch thanh toán thành công`,
      icon: CreditCard,
      gradient: "from-amber-600 to-orange-600",
      textColor: "text-amber-600",
      borderColor: "border-amber-100",
      glowBg: "bg-amber-500/10",
    },
    {
      title: "Khách Hàng Hệ Thống",
      value: `${customers.totalUsers.toLocaleString("vi-VN")} TV`,
      trend: `+${customers.newUsers} mới`,
      isUp: true,
      subtitle: `Có ${customers.newUsers} khách hàng đăng ký trong kỳ`,
      icon: Users,
      gradient: "from-cyan-600 to-blue-600",
      textColor: "text-cyan-600",
      borderColor: "border-cyan-100",
      glowBg: "bg-cyan-500/10",
    },
    {
      title: "Mức Hài Lòng Khách Hàng (CSAT)",
      value: `${marketing.reviews.satisfactionRate}%`,
      trend: `${marketing.reviews.averageRating} ★`,
      isUp: marketing.reviews.averageRating >= 4.0,
      subtitle: `Dựa trên ${marketing.reviews.totalReviews} lượt đánh giá tour`,
      icon: Star,
      gradient: "from-rose-600 to-pink-600",
      textColor: "text-rose-600",
      borderColor: "border-rose-100",
      glowBg: "bg-rose-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.title}
            className={`min-w-0 rounded-2xl border ${kpi.borderColor} bg-white p-4 shadow-xs hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${kpi.gradient} text-white shadow-sm`}
              >
                <Icon size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {kpi.title}
                  </p>
                  <span
                    className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                      kpi.isUp
                        ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                        : "border-rose-100 bg-rose-50 text-rose-700"
                    }`}
                  >
                    {kpi.trend.includes("%") ? (
                      kpi.isUp ? (
                        <ArrowUpRight size={11} />
                      ) : (
                        <ArrowDownRight size={11} />
                      )
                    ) : null}
                    {kpi.trend}
                  </span>
                </div>

                <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">
                  {kpi.value}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-500 line-clamp-1">
                  {kpi.subtitle}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

