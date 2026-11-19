"use client";

import { AdminStatCard } from "@/components/common/admin_shared/cards/AdminStatCard";

import {
  Award,
  Briefcase,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Shield,
  UserCheck,
  Users,
} from "lucide-react";
import type { ComprehensiveAnalytics } from "shared";

interface AnalyticsWorkforceTabProps {
  data: ComprehensiveAnalytics;
}

export function AnalyticsWorkforceTab({ data }: AnalyticsWorkforceTabProps) {
  const { workforce } = data;

  const totalAssigned = workforce.topStaff.reduce(
    (acc, s) => acc + (s.assignedCount || 0),
    0,
  );
  const totalCompleted = workforce.topStaff.reduce(
    (acc, s) => acc + (s.completedCount || 0),
    0,
  );
  const avgCompletionRate =
    totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 100;

  return (
    <div className="space-y-3">
      {/* Workforce Summary KPIs */}
      <div className="grid grid-cols-4 gap-3 @max-[1180px]/analytics:grid-cols-2 @max-[650px]/analytics:grid-cols-1">
        <AdminStatCard title="Tổng nhân sự hệ thống" value={`${workforce.totalStaff} Nhân viên`} description="Bao gồm HDV, tài xế và điều hành tour" icon={Users} tone="indigo" />
        <AdminStatCard title="Đang trực / Sẵn sàng" value={`${workforce.activeStaff} Nhân sự`} description={`Tỷ lệ sẵn sàng làm việc ${workforce.totalStaff > 0 ? Math.round((workforce.activeStaff / workforce.totalStaff) * 100) : 100}%`} icon={UserCheck} tone="green" />
        <AdminStatCard title="Lượt phân công kíp tour" value={`${totalAssigned} Lượt`} description={`Đã hoàn thành xuất sắc ${totalCompleted} chuyến`} icon={Briefcase} />
        <AdminStatCard title="Tỷ lệ hoàn thành tour" value={`${avgCompletionRate}%`} description="Đạt chỉ tiêu KPI vận hành" icon={Award} tone="amber" />
      </div>

      {/* Roles Breakdown */}
      <div>
        <h4 className="text-[16px] font-[750] leading-[1.5] text-[#0b1747] mb-3">
          Cơ Cấu Đội Ngũ Theo Vai Trò Chuyên Môn
        </h4>
        <div className="grid grid-cols-4 gap-3 @max-[1180px]/analytics:grid-cols-2 @max-[650px]/analytics:grid-cols-1">
          {workforce.byRole.map((roleItem) => (
            <AdminStatCard key={roleItem.role} title={roleItem.label} value={`${roleItem.count} nhân sự`} icon={Shield} tone="indigo" />
          ))}
        </div>
      </div>

      {/* Workforce Performance Table */}
      <div className="min-w-0 rounded-[14px] border border-[#e1edfc] bg-white overflow-hidden">
        <div className="p-4 border-b border-[#edf2fb] flex items-center justify-between">
          <div>
            <h4 className="text-[16px] font-[750] leading-[1.5] text-[#0b1747]">
              Bảng Theo Dõi Hiệu Suất & Phân Công Lịch Trình Nhân Sự
            </h4>
            <p className="text-xs text-[#7387aa]">
              Đánh giá khối lượng công việc, tỷ lệ hoàn thành chuyến đi của từng nhân viên
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#f4f8fd] text-[12px] text-[#657b9f] border-b border-[#e1edfc] font-semibold ">
              <tr>
                <th className="py-3 px-4">Nhân sự</th>
                <th className="py-3 px-4">Thông tin liên hệ</th>
                <th className="py-3 px-4">Vai trò đảm nhiệm</th>
                <th className="py-3 px-4 text-center">Chuyến phụ trách</th>
                <th className="py-3 px-4 text-center">Chuyến hoàn thành</th>
                <th className="py-3 px-4 text-right">Tỷ lệ hoàn thành</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf2fb] font-medium text-slate-700">
              {workforce.topStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-60 p-6 text-center text-[#7387aa]">
                    Chưa có dữ liệu phân công nhân sự trong kỳ này
                  </td>
                </tr>
              ) : (
                workforce.topStaff.map((staff, idx) => {
                  const rate =
                    staff.assignedCount > 0
                      ? Math.round((staff.completedCount / staff.assignedCount) * 100)
                      : 100;
                  return (
                    <tr
                      key={`${staff.userId}-${idx}`}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 text-xs">
                            {staff.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#0b1747]">{staff.fullName}</p>
                            <span className="font-mono text-[10px] text-[#7387aa]">
                              ID: #{staff.userId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {staff.phone && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Phone size={11} className="text-[#7387aa]" />
                              <span>{staff.phone}</span>
                            </div>
                          )}
                          {staff.email && (
                            <div className="flex items-center gap-1.5 text-[#7387aa]">
                              <Mail size={11} />
                              <span className="truncate max-w-44">{staff.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {staff.roles.map((r, rIdx) => (
                            <span
                              key={`${r}-${rIdx}`}
                              className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                            >
                              {r === "guide"
                                ? "Hướng dẫn viên"
                                : r === "driver"
                                ? "Tài xế"
                                : r === "operator"
                                ? "Điều hành"
                                : r === "leader"
                                ? "Trưởng đoàn"
                                : r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-[#0b1747]">
                          {staff.assignedCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-emerald-600">
                          {staff.completedCount}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-bold text-[#0b1747]">{rate}%</span>
                          <div className="h-2 w-14 rounded-[20px] bg-[#e1eaf7] overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(rate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-[650] text-emerald-700">
                          <CheckCircle size={10} />
                          {staff.status === "active" ? "Đang trực" : "Sẵn sàng"}
                        </span>
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

