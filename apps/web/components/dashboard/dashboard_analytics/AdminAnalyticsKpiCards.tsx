"use client";

import { AdminStatCard } from "@/components/common/admin_shared/cards/AdminStatCard";

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
    },
    {
      title: "Tổng Lượt Đặt Tour",
      value: financials.totalBookings.toLocaleString("vi-VN"),
      trend: `${financials.bookingsTrend > 0 ? "+" : ""}${financials.bookingsTrend}%`,
      isUp: financials.bookingsTrend >= 0,
      subtitle: `${financials.cancelledBookings} đơn hủy / ${financials.totalBookings} đơn tạo`,
      icon: ShoppingBag,
      gradient: "from-emerald-600 to-teal-600",
    },
    {
      title: "Giá Trị Đơn Trung Bình (AOV)",
      value: formatVND(financials.averageOrderValue),
      trend: "Doanh thu TB",
      isUp: true,
      subtitle: "Bình quân trên mỗi lượt đặt thành công",
      icon: TrendingUp,
      gradient: "from-indigo-600 to-violet-600",
    },
    {
      title: "Thanh Toán Qua VNPAY",
      value: formatVND(financials.vnpayVolume),
      trend: "100% tỷ trọng",
      isUp: true,
      subtitle: `${financials.vnpayTransactions} giao dịch thanh toán thành công`,
      icon: CreditCard,
      gradient: "from-amber-600 to-orange-600",
    },
    {
      title: "Khách Hàng Hệ Thống",
      value: `${customers.totalUsers.toLocaleString("vi-VN")} TV`,
      trend: `+${customers.newUsers} mới`,
      isUp: true,
      subtitle: `Có ${customers.newUsers} khách hàng đăng ký trong kỳ`,
      icon: Users,
      gradient: "from-cyan-600 to-blue-600",
    },
    {
      title: "Mức Hài Lòng Khách Hàng (CSAT)",
      value: `${marketing.reviews.satisfactionRate}%`,
      trend: `${marketing.reviews.averageRating} ★`,
      isUp: marketing.reviews.averageRating >= 4.0,
      subtitle: `Dựa trên ${marketing.reviews.totalReviews} lượt đánh giá tour`,
      icon: Star,
      gradient: "from-rose-600 to-pink-600",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 @max-[1180px]/analytics:grid-cols-2 @max-[650px]/analytics:grid-cols-1">
      {kpis.map((kpi) => (
        <AdminStatCard key={kpi.title} title={kpi.title} value={kpi.value} icon={kpi.icon} gradient={kpi.gradient} description={kpi.subtitle}
          badge={<span className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold leading-none ${kpi.isUp ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`}>{kpi.trend.includes("%") && (kpi.isUp ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />)}{kpi.trend}</span>}
        />
      ))}
    </div>
  );
}

