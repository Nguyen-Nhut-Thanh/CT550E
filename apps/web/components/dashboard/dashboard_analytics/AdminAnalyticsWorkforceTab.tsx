"use client";

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
    <div className="space-y-6">
      {/* Workforce Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tổng nhân sự hệ thống
              </p>
              <h4 className="text-xl font-black text-slate-900">
                {workforce.totalStaff} Nhân viên
              </h4>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Bao gồm HDV, tài xế và điều hành tour
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Đang trực / Sẵn sàng
              </p>
              <h4 className="text-xl font-black text-slate-900">
                {workforce.activeStaff} Nhân sự
              </h4>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Tỷ lệ sẵn sàng làm việc{" "}
            <span className="font-bold text-emerald-600">
              {workforce.totalStaff > 0
                ? Math.round((workforce.activeStaff / workforce.totalStaff) * 100)
                : 100}
              %
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Briefcase size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Lượt phân công kíp tour
              </p>
              <h4 className="text-xl font-black text-slate-900">
                {totalAssigned} Lượt
              </h4>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Đã hoàn thành xuất sắc {totalCompleted} chuyến
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Award size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Tỷ lệ hoàn thành tour
              </p>
              <h4 className="text-xl font-black text-slate-900">
                {avgCompletionRate}%
              </h4>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Đạt chỉ tiêu KPI vận hành</p>
        </div>
      </div>

      {/* Roles Breakdown */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3">
          Cơ Cấu Đội Ngũ Theo Vai Trò Chuyên Môn
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {workforce.byRole.map((roleItem) => (
            <div
              key={roleItem.role}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold text-slate-500">{roleItem.label}</p>
                <h5 className="mt-1 text-lg font-black text-slate-900">
                  {roleItem.count} nhân sự
                </h5>
              </div>
              <span className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                <Shield size={20} />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Workforce Performance Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Bảng Theo Dõi Hiệu Suất & Phân Công Lịch Trình Nhân Sự
            </h4>
            <p className="text-xs text-slate-500">
              Đánh giá khối lượng công việc, tỷ lệ hoàn thành chuyến đi của từng nhân viên
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200/70 font-semibold uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {workforce.topStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Chưa có dữ liệu phân công nhân sự trong kỳ này
                  </td>
                </tr>
              ) : (
                workforce.topStaff.map((staff) => {
                  const rate =
                    staff.assignedCount > 0
                      ? Math.round((staff.completedCount / staff.assignedCount) * 100)
                      : 100;
                  return (
                    <tr
                      key={staff.userId}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700 text-xs">
                            {staff.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{staff.fullName}</p>
                            <span className="font-mono text-[10px] text-slate-400">
                              ID: #{staff.userId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {staff.phone && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Phone size={11} className="text-slate-400" />
                              <span>{staff.phone}</span>
                            </div>
                          )}
                          {staff.email && (
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Mail size={11} />
                              <span className="truncate max-w-44">{staff.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {staff.roles.map((r) => (
                            <span
                              key={r}
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
                        <span className="font-bold text-slate-900">
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
                          <span className="font-bold text-slate-800">{rate}%</span>
                          <div className="h-1.5 w-14 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(rate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
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

