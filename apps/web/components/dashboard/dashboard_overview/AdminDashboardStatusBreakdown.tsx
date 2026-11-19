"use client";

import {
  Award,
  Clock,
  CreditCard,
  PieChart,
  XCircle,
} from "lucide-react";
import type { DashboardStatusBreakdownProps } from "shared";

export function DashboardStatusBreakdown({
  statusBreakdown,
}: DashboardStatusBreakdownProps) {
  const paidCount = statusBreakdown.paid;
  const total =
    paidCount +
    statusBreakdown.pending +
    statusBreakdown.completed +
    statusBreakdown.cancelled;

  const getPercent = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const items = [
    {
      label: "Đã thanh toán",
      count: paidCount,
      percent: getPercent(paidCount),
      color: "bg-emerald-500",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
      icon: CreditCard,
    },
    {
      label: "Đã hoàn thành",
      count: statusBreakdown.completed,
      percent: getPercent(statusBreakdown.completed),
      color: "bg-teal-500",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-100",
      icon: Award,
    },
    {
      label: "Chờ xử lý / TT",
      count: statusBreakdown.pending,
      percent: getPercent(statusBreakdown.pending),
      color: "bg-amber-500",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-100",
      icon: Clock,
    },
    {
      label: "Đã hủy đơn",
      count: statusBreakdown.cancelled,
      percent: getPercent(statusBreakdown.cancelled),
      color: "bg-rose-500",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-100",
      icon: XCircle,
    },
  ];

  return (
    <div className="rounded-[14px] border border-[#e1edfc] bg-white p-4">
      <div className="flex items-center justify-between border-b border-[#edf2fb] pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-5.5 w-5.5 items-center justify-center text-[#075bff]">
            <PieChart size={22} />
          </div>
          <div>
            <h2 className="text-[16px] font-[750] leading-[1.5] text-[#0b1747]">
              Trạng Thái Đơn Hàng
            </h2>
            <p className="text-xs font-medium text-[#7387aa]">
              Tổng số {total} đơn đặt trong kỳ
            </p>
          </div>
        </div>
      </div>

      {/* Segmented multi-color progress bar */}
      <div className="mt-3">
        <div className="flex h-2 w-full overflow-hidden rounded-[20px] bg-[#e1eaf7]">
          {total === 0 ? (
            <div className="h-full w-full rounded-full bg-slate-200" />
          ) : (
            items.map((item) =>
              item.count > 0 ? (
                <div
                  key={item.label}
                  style={{ width: `${(item.count / total) * 100}%` }}
                  title={`${item.label}: ${item.count} (${item.percent}%)`}
                  className={`h-full ${item.color} transition-all duration-500 first:rounded-l-full last:rounded-r-full`}
                />
              ) : null,
            )
          )}
        </div>
      </div>

      {/* Breakdown detail list */}
      <div className="mt-3 space-y-1">
        {items.map((item) => {
          return (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl px-1 py-1 transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />

                <span className="text-xs font-semibold text-slate-700">
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0b1747]">
                  {item.count} đơn
                </span>
                <span
                  className={`rounded-lg border px-1.5 py-0.5 text-[11px] font-[650] ${item.badgeColor}`}
                >
                  {item.percent}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
