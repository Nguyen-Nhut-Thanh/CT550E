"use client";

import { formatVND } from "@/lib/utils/currency";
import {
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  CheckCircle2,
  Clock,
  Compass,
  CreditCard,
  DollarSign,
  Percent,
  Users,
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
      bgGlow: "bg-blue-500/10",
      textColor: "text-blue-600",
      borderColor: "border-blue-100",
    },
    {
      title: "Lượt Đặt Tour",
      subtitle: `Số booking tạo mới ${periodText}`,
      value: kpis.totalBookings.toLocaleString("vi-VN"),
      trend: `${kpis.bookingsTrend > 0 ? "+" : ""}${kpis.bookingsTrend}%`,
      isUp: kpis.bookingsTrend >= 0,
      icon: Briefcase,
      gradient: "from-emerald-600 to-teal-600",
      bgGlow: "bg-emerald-500/10",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100",
    },
    {
      title: "Khách Hàng Mới",
      subtitle: `Tài khoản đăng ký ${periodText}`,
      value: kpis.newUsers.toLocaleString("vi-VN"),
      trend: `${kpis.usersTrend > 0 ? "+" : ""}${kpis.usersTrend}%`,
      isUp: kpis.usersTrend >= 0,
      icon: Users,
      gradient: "from-purple-600 to-violet-600",
      bgGlow: "bg-purple-500/10",
      textColor: "text-purple-600",
      borderColor: "border-purple-100",
    },
    {
      title: "Tour Hoạt Động",
      subtitle: `${kpis.activeTours} trên tổng ${kpis.totalTours} tour`,
      value: `${kpis.activeTours} Tour`,
      trend: `${Math.round((kpis.activeTours / Math.max(kpis.totalTours, 1)) * 100)}% mở bán`,
      isUp: true,
      icon: Compass,
      gradient: "from-amber-600 to-orange-600",
      bgGlow: "bg-amber-500/10",
      textColor: "text-amber-600",
      borderColor: "border-amber-100",
    },
  ];

  return (
    <div className="space-y-4">
      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`dashboard-kpi group relative overflow-hidden rounded-2xl border ${card.borderColor} bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
            >
              {/* Subtle top background gradient highlight */}
              <div
                className={`hidden absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${card.gradient}`}
              />

              <div className="flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-white shadow-lg transition-transform group-hover:scale-105`}
                >
                  <Icon size={24} />
                </div>

                <div
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                    card.isUp
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      : "bg-rose-50 text-rose-700 border border-rose-100"
                  }`}
                >
                  {card.isUp ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  {card.trend}
                </div>
              </div>

              <div className="dashboard-kpi-copy">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {card.title}
                </p>
                <h3 className="mt-1 text-xl font-black tracking-tight text-slate-950 2xl:text-2xl">
                  {card.value}
                </h3>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {card.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary mini-counters strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">
              Chờ thanh toán
            </p>
            <p className="text-base font-bold text-slate-900">
              {kpis.pendingBookings} đơn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">
              Đã xác nhận
            </p>
            <p className="text-base font-bold text-slate-900">
              {kpis.confirmedBookings} đơn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CreditCard size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">
              Đã thanh toán
            </p>
            <p className="text-base font-bold text-slate-900">
              {kpis.paidBookings} đơn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-xs">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Percent size={18} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">
              Tỷ lệ thành công
            </p>
            <p className="text-base font-bold text-emerald-600">
              {kpis.conversionRate}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
