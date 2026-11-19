"use client";

import { AdminStatCard } from "@/components/common/admin_shared/cards/AdminStatCard";

import { formatVND } from "@/lib/utils/currency";
import {
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  Clock,
  Compass,
  CreditCard,
  DollarSign,
  Percent,
  Users,
  XCircle,
} from "lucide-react";
import type { DashboardKpiCardsProps, DashboardTimeRange } from "shared";

export function DashboardKpiCards({ kpis, timeRange }: DashboardKpiCardsProps) {
  const rangeLabels: Record<DashboardTimeRange, string> = {
    "7d": "7 ngày",
    "30d": "30 ngày",
    month: "tháng này",
    year: "năm nay",
  };

  const periodText = rangeLabels[timeRange] || "kỳ này";

  const cards = [
    {
      title: "Tổng Doanh Thu",
      subtitle: `Doanh thu phát sinh ${periodText}`,
      value: formatVND(kpis.totalRevenue),
      trend: `${kpis.revenueTrend > 0 ? "+" : ""}${kpis.revenueTrend}%`,
      isUp: kpis.revenueTrend >= 0,
      icon: DollarSign,
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      title: "Lượt Đặt Tour",
      subtitle: `Số booking tạo mới ${periodText}`,
      value: kpis.totalBookings.toLocaleString("vi-VN"),
      trend: `${kpis.bookingsTrend > 0 ? "+" : ""}${kpis.bookingsTrend}%`,
      isUp: kpis.bookingsTrend >= 0,
      icon: Briefcase,
      gradient: "from-emerald-600 to-teal-600",
    },
    {
      title: "Khách Hàng Mới",
      subtitle: `Tài khoản đăng ký ${periodText}`,
      value: kpis.newUsers.toLocaleString("vi-VN"),
      trend: `${kpis.usersTrend > 0 ? "+" : ""}${kpis.usersTrend}%`,
      isUp: kpis.usersTrend >= 0,
      icon: Users,
      gradient: "from-purple-600 to-violet-600",
    },
    {
      title: "Tour Hoạt Động",
      subtitle: `${kpis.activeTours} trên tổng ${kpis.totalTours} tour`,
      value: `${kpis.activeTours} Tour`,
      trend: `${Math.round((kpis.activeTours / Math.max(kpis.totalTours, 1)) * 100)}% mở bán`,
      isUp: true,
      icon: Compass,
      gradient: "from-amber-600 to-orange-600",
    },
  ];

  return (
    <div className="space-y-3">
      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-4 gap-3 @max-[1180px]/dashboard:grid-cols-2 @max-[650px]/dashboard:grid-cols-1">
        {cards.map((card) => (
          <AdminStatCard key={card.title} title={card.title} value={card.value} icon={card.icon} gradient={card.gradient} description={card.subtitle}
            badge={<span className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold leading-none ${card.isUp ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"}`}>{card.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{card.trend}</span>}
          />
        ))}
      </div>

      {/* Secondary mini-counters strip */}
      <div className="grid grid-cols-4 gap-3 @max-[900px]/dashboard:grid-cols-2 @max-[650px]/dashboard:grid-cols-1">
        <AdminStatCard title="Chờ thanh toán" value={`${kpis.pendingBookings} đơn`} icon={Clock} tone="amber" />
        <AdminStatCard title="Đã thanh toán" value={`${kpis.paidBookings} đơn`} icon={CreditCard} tone="green" />
        <AdminStatCard title="Đã hủy" value={`${kpis.cancelledBookings} đơn`} icon={XCircle} tone="rose" />
        <AdminStatCard title="Tỷ lệ thành công" value={`${kpis.conversionRate}%`} icon={Percent} tone="indigo" />
      </div>
    </div>
  );
}
