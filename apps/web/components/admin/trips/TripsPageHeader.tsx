"use client";

import Link from "next/link";
import { CalendarDays, Compass, RefreshCw } from "lucide-react";
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
    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-xs">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Compass size={24} />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Vận hành tour
              </span>
              {scheduleId && (
                <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Đang xem chuyến #{scheduleId}
                </span>
              )}
            </div>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
              Điều hành chuyến
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Điều động nhân sự phụ trách (HDV, lái xe), xác nhận chuyến và quản lý danh sách đoàn hành khách.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-blue-600" : ""} />
            <span>{loading ? "Đang tải…" : "Làm mới"}</span>
          </button>
          <Link
            href="/admin/schedules"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
          >
            <CalendarDays size={14} />
            <span>Lịch khởi hành</span>
          </Link>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
          <p className="text-[11px] font-semibold text-slate-500">Tổng chuyến vận hành</p>
          <p className="mt-1 text-xl font-black text-slate-800">{schedules.length}</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
          <p className="text-[11px] font-semibold text-blue-600">Sắp khởi hành</p>
          <p className="mt-1 text-xl font-black text-blue-800">{upcomingCount}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
          <p className="text-[11px] font-semibold text-emerald-600">Đang diễn ra</p>
          <p className="mt-1 text-xl font-black text-emerald-800">{ongoingCount}</p>
        </div>
        <div
          className={`rounded-xl border p-3 ${
            overdueCount > 0
              ? "border-rose-200 bg-rose-50/70 text-rose-800"
              : "border-slate-100 bg-slate-50/60 text-slate-800"
          }`}
        >
          <p className={`text-[11px] font-semibold ${overdueCount > 0 ? "text-rose-600" : "text-slate-500"}`}>
            Gấp trong 24h
          </p>
          <p className="mt-1 text-xl font-black">
            {overdueCount > 0 ? `${overdueCount} cần chốt` : "0"}
          </p>
        </div>
      </div>
    </div>
  );
}

