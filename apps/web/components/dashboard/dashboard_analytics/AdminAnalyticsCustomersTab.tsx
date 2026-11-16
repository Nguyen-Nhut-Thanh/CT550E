"use client";

import { formatVND } from "@/lib/utils/currency";
import {
  Calendar,
  Crown,
  Gem,
  Mail,
  Medal,
  Phone,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import type { ComprehensiveAnalytics } from "shared";

interface AnalyticsCustomersTabProps {
  data: ComprehensiveAnalytics;
}

export function AnalyticsCustomersTab({ data }: AnalyticsCustomersTabProps) {
  const { customers } = data;

  const totalUsers = customers.totalUsers || 1;

  const tierStyles: Record<
    string,
    { label: string; badge: string; icon: typeof Medal; border: string; glow: string }
  > = {
    diamond: {
      label: "Kim Cương",
      badge: "bg-cyan-100 text-cyan-800 border-cyan-200",
      icon: Gem,
      border: "border-cyan-200",
      glow: "from-cyan-500/10 to-blue-500/10",
    },
    gold: {
      label: "Vàng",
      badge: "bg-amber-100 text-amber-800 border-amber-200",
      icon: Crown,
      border: "border-amber-200",
      glow: "from-amber-500/10 to-yellow-500/10",
    },
    silver: {
      label: "Bạc",
      badge: "bg-slate-200 text-slate-800 border-slate-300",
      icon: Sparkles,
      border: "border-slate-200",
      glow: "from-slate-400/10 to-slate-200/10",
    },
    bronze: {
      label: "Đồng",
      badge: "bg-orange-100 text-orange-800 border-orange-200",
      icon: Medal,
      border: "border-orange-200",
      glow: "from-orange-500/10 to-amber-500/10",
    },
  };

  const totalVipSpent = customers.topVip.reduce((s, c) => s + c.totalSpent, 0);

  return (
    <div className="space-y-6">
      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tổng khách hàng
              </p>
              <h4 className="text-xl font-black text-slate-900">
                {customers.totalUsers.toLocaleString("vi-VN")} TV
              </h4>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Toàn bộ tài khoản người dùng đăng ký</p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Khách hàng mới
              </p>
              <h4 className="text-xl font-black text-slate-900">
                +{customers.newUsers} TV
              </h4>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Gia nhập hệ thống trong kỳ này</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Crown size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Top 1 VIP Chi Tiêu
              </p>
              <h4 className="text-sm font-black text-slate-900 truncate max-w-44">
                {customers.topVip[0]?.fullName || "Chưa có"}
              </h4>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Chi tiêu:{" "}
            <span className="font-bold text-amber-600">
              {formatVND(customers.topVip[0]?.totalSpent || 0)}
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-purple-100 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Gem size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Dòng tiền từ Top 10 VIP
              </p>
              <h4 className="text-lg font-black text-slate-900">
                {formatVND(totalVipSpent)}
              </h4>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Nhóm khách hàng trung thành nhất</p>
        </div>
      </div>

      {/* Customer Tiers Breakdown */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3">
          Phân Bổ Cơ Cấu Theo Hạng Thành Viên
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {customers.byTier.map((tierItem) => {
            const meta = tierStyles[tierItem.tier] || tierStyles.bronze;
            const Icon = meta.icon;
            const pct = Math.round((tierItem.count / totalUsers) * 100);
            return (
              <div
                key={tierItem.tier}
                className={`rounded-2xl border ${meta.border} bg-white p-4 shadow-xs`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${meta.glow} text-slate-800`}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">{tierItem.label}</h5>
                      <span className="text-[11px] text-slate-400">Hội viên cấp {tierItem.tier}</span>
                    </div>
                  </div>
                  <span className={`rounded-lg border px-2 py-0.5 text-xs font-black ${meta.badge}`}>
                    {tierItem.count} TV
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <span>Tỷ trọng hội viên:</span>
                  <span className="font-bold text-slate-800">{pct}%</span>
                </div>

                <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 10 VIP Customers Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Top 10 Khách Hàng VIP Đóng Góp Doanh Thu Cao Nhất
            </h4>
            <p className="text-xs text-slate-500">
              Danh sách các khách hàng thân thiết có tổng chi tiêu cao nhất trên toàn hệ thống
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200/70 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 text-center w-12">Hạng</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Thông tin liên hệ</th>
                <th className="py-3 px-4 text-center">Hạng hội viên</th>
                <th className="py-3 px-4 text-center">Số tour đã đặt</th>
                <th className="py-3 px-4 text-right">Tổng chi tiêu tích lũy</th>
                <th className="py-3 px-4 text-right">Lần đặt gần nhất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {customers.topVip.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Chưa có số liệu khách hàng VIP trong kỳ này
                  </td>
                </tr>
              ) : (
                customers.topVip.map((vip, idx) => {
                  const meta = tierStyles[vip.membershipTier] || tierStyles.bronze;
                  const TierIcon = meta.icon;
                  return (
                    <tr
                      key={vip.userId}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black ${
                            idx === 0
                              ? "bg-amber-100 text-amber-800"
                              : idx === 1
                              ? "bg-slate-200 text-slate-800"
                              : idx === 2
                              ? "bg-orange-100 text-orange-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 font-bold text-white text-xs">
                            {vip.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{vip.fullName}</p>
                            <span className="font-mono text-[10px] text-slate-400">
                              UID: #{vip.userId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {vip.email && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Mail size={11} className="text-slate-400" />
                              <span className="truncate max-w-44">{vip.email}</span>
                            </div>
                          )}
                          {vip.phone && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Phone size={11} />
                              <span>{vip.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${meta.badge}`}
                        >
                          <TierIcon size={12} />
                          {meta.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-slate-800">
                          {vip.totalBookings} tour
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-black text-blue-700">
                        {formatVND(vip.totalSpent)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                        {vip.lastBookingDate || "Chưa có"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

