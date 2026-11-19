"use client";

import { AdminScenicHeaderBackground } from "@/components/common/admin_shared/layout/AdminScenicHeaderBackground";

import { AdminStatCard } from "@/components/common/admin_shared/cards/AdminStatCard";

import Link from "next/link";
import { CalendarDays, Compass, RefreshCw, Clock3, CheckCircle2, CircleAlert } from "lucide-react";
import type { WorkforceSchedule } from "shared";

export interface TripsPageHeaderProps {
  scheduleId?: number;
  schedules: WorkforceSchedule[];
  loading: boolean;
  onRefresh: () => void;
}

export function TripsPageHeader({
  scheduleId,
  schedules,
  loading,
  onRefresh,
}: TripsPageHeaderProps) {
  const now = Date.now();
  const upcomingCount = schedules.filter((s) => Date.parse(s.start_date) > now).length;
  const ongoingCount = schedules.filter(
    (s) => Date.parse(s.start_date) <= now && Date.parse(s.end_date) >= now,
  ).length;
  const overdueCount = schedules.filter(
    (s) =>
      !s.crew_locked_at &&
      Date.parse(s.start_date) > now &&
      Date.parse(s.start_date) - now <= 86400_000,
  ).length;

  return (
    <div className="space-y-3">
      <header className="relative isolate @container/trips-header">
        <AdminScenicHeaderBackground />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#075bff] shadow-xs">
              <Compass size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#075bff] border border-blue-100">
                  Vận hành tour
                </span>
                {scheduleId && (
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 border border-amber-200">
                    Đang xem chuyến #{scheduleId}
                  </span>
                )}
              </div>
              <h1 className="text-[24px] font-extrabold leading-[1.25] tracking-[-.6px] text-[#07123e]">
                Điều hành chuyến
              </h1>
              <p className="mt-[3px] text-[12px] leading-[1.5] text-[#637da5]">
                Điều động nhân sự phụ trách (HDV, lái xe), xác nhận chuyến và quản lý danh sách đoàn hành khách.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-[#075bff] transition disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-[#075bff]" : ""} />
              <span>{loading ? "Đang tải…" : "Làm mới"}</span>
            </button>
            <Link
              href="/admin/schedules"
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-[#075bff] hover:bg-blue-100 transition cursor-pointer"
            >
              <CalendarDays size={14} />
              <span>Lịch khởi hành</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <AdminStatCard title="Tổng chuyến vận hành" value={schedules.length} icon={Compass} />
        <AdminStatCard title="Sắp khởi hành" value={upcomingCount} icon={CalendarDays} tone="purple" />
        <AdminStatCard title="Đang diễn ra" value={ongoingCount} icon={CheckCircle2} tone="green" />
        <AdminStatCard title="Gấp trong 24h" value={overdueCount > 0 ? `${overdueCount} cần chốt` : "0"} icon={Clock3} tone={overdueCount > 0 ? "rose" : "slate"} badge={overdueCount > 0 ? <CircleAlert size={13} aria-label="Có chuyến cần chốt" className="text-rose-600" /> : undefined} />
      </div>
    </div>
  );
}

