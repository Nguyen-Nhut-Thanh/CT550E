"use client";

import { AdminStatCard } from "@/components/common/admin_shared/cards/AdminStatCard";

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
      badge: "bg-slate-200 text-[#0b1747] border-slate-300",
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
    <div className="space-y-3">
      {/* Overview KPI Cards */}
      <div className="grid grid-cols-4 gap-3 @max-[1180px]/analytics:grid-cols-2 @max-[650px]/analytics:grid-cols-1">
        <AdminStatCard title="Tổng khách hàng" value={`${customers.totalUsers.toLocaleString("vi-VN")} TV`} description="Toàn bộ tài khoản người dùng đăng ký" icon={Users} />
        <AdminStatCard title="Khách hàng mới" value={`+${customers.newUsers.toLocaleString("vi-VN")} TV`} description="Gia nhập hệ thống trong kỳ này" icon={UserCheck} tone="green" />
        <AdminStatCard title="Top 1 VIP Chi Tiêu" value={<span className="block truncate" title={customers.topVip[0]?.fullName}>{customers.topVip[0]?.fullName || "Chưa có"}</span>} description={`Chi tiêu: ${formatVND(customers.topVip[0]?.totalSpent || 0)}`} icon={Crown} tone="amber" />
        <AdminStatCard title="Dòng tiền từ Top 10 VIP" value={formatVND(totalVipSpent)} description="Nhóm khách hàng trung thành nhất" icon={Gem} tone="purple" />
      </div>

      {/* Customer Tiers Breakdown */}
      <div>
        <h4 className="text-[16px] font-[750] leading-[1.5] text-[#0b1747] mb-3">
          Phân Bổ Cơ Cấu Theo Hạng Thành Viên
        </h4>
        <div className="grid grid-cols-4 gap-3 @max-[1180px]/analytics:grid-cols-2 @max-[650px]/analytics:grid-cols-1">
          {customers.byTier.map((tierItem) => {
            const meta = tierStyles[tierItem.tier] || tierStyles.bronze;
            const Icon = meta.icon;
            const pct = Math.round((tierItem.count / totalUsers) * 100);
            return (
              <AdminStatCard key={tierItem.tier} title={tierItem.label} value={`${tierItem.count} TV`} icon={Icon} tone={tierItem.tier === "diamond" ? "cyan" : tierItem.tier === "gold" ? "amber" : tierItem.tier === "silver" ? "slate" : "orange"} description={`Hội viên cấp ${tierItem.tier}`}
                badge={<span className={`rounded-full border px-1.5 py-0.5 ${meta.badge}`}>{pct}%</span>}
              >
                <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500"><span>Tỷ trọng hội viên</span><span>{pct}%</span></div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(pct,100)}%` }} /></div>
              </AdminStatCard>
            );
          })}
        </div>
      </div>

      {/* Top 10 VIP Customers Table */}
      <div className="min-w-0 rounded-[14px] border border-[#e1edfc] bg-white overflow-hidden">
        <div className="p-4 border-b border-[#edf2fb] flex items-center justify-between">
          <div>
            <h4 className="text-[16px] font-[750] leading-[1.5] text-[#0b1747]">
              Top 10 Khách Hàng VIP Đóng Góp Doanh Thu Cao Nhất
            </h4>
            <p className="text-xs text-[#7387aa]">
              Danh sách các khách hàng thân thiết có tổng chi tiêu cao nhất trên toàn hệ thống
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f4f8fd] text-[12px] text-[#657b9f] border-b border-[#e1edfc] font-semibold ">
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
            <tbody className="divide-y divide-[#edf2fb] font-medium text-slate-700">
              {customers.topVip.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-60 p-6 text-center text-[#7387aa]">
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
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                            idx === 0
                              ? "bg-amber-100 text-amber-800"
                              : idx === 1
                              ? "bg-slate-200 text-[#0b1747]"
                              : idx === 2
                              ? "bg-orange-100 text-orange-800"
                              : "bg-slate-100 text-[#7387aa]"
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
                            <p className="font-bold text-[#0b1747]">{vip.fullName}</p>
                            <span className="font-mono text-[10px] text-[#7387aa]">
                              UID: #{vip.userId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {vip.email && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Mail size={11} className="text-[#7387aa]" />
                              <span className="truncate max-w-44">{vip.email}</span>
                            </div>
                          )}
                          {vip.phone && (
                            <div className="flex items-center gap-1.5 text-[#7387aa]">
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
                        <span className="font-bold text-[#0b1747]">
                          {vip.totalBookings} tour
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-blue-700">
                        {formatVND(vip.totalSpent)}
                      </td>
                      <td className="py-3 px-4 text-right text-[#7387aa] text-[11px]">
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

