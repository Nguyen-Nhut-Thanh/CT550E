"use client";

import { AlertCircle, CheckCircle, Clock, Star, ThumbsDown } from "lucide-react";
import type { AdminReviewItem } from "shared";

interface ReviewStatsCardsProps {
  items: AdminReviewItem[];
  total: number;
}

export function ReviewStatsCards({ items, total }: ReviewStatsCardsProps) {
  const pendingCount = items.filter((r) => r.status === 0).length;
  const approvedCount = items.filter((r) => r.status === 1).length;
  const rejectedCount = items.filter((r) => r.status === 2).length;

  const totalRating = items.reduce((acc, r) => acc + (r.rating || 0), 0);
  const avgRating = items.length > 0 ? (totalRating / items.length).toFixed(1) : "5.0";

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* Tổng đánh giá */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Tổng đánh giá</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Star size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{total}</span>
          <span className="text-xs text-slate-400">lượt gửi</span>
        </div>
      </div>

      {/* Chờ duyệt */}
      <div className={`rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${
        pendingCount > 0
          ? "border-amber-200 bg-amber-50/40"
          : "border-slate-200/80 bg-white"
      }`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-700">Chờ kiểm duyệt</span>
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Clock size={18} />
            {pendingCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
              </span>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-amber-900">{pendingCount}</span>
          <span className="text-xs text-amber-600 font-medium">cần xử lý</span>
        </div>
      </div>

      {/* Đã duyệt */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-700">Đã phê duyệt</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-emerald-900">{approvedCount}</span>
          <span className="text-xs text-emerald-600 font-medium">hiển thị công khai</span>
        </div>
      </div>

      {/* Từ chối / Ẩn */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-rose-700">Từ chối / Đã ẩn</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <ThumbsDown size={18} />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-rose-900">{rejectedCount}</span>
          <span className="text-xs text-rose-600 font-medium">vi phạm / ẩn</span>
        </div>
      </div>

      {/* Điểm trung bình */}
      <div className="col-span-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition hover:shadow-md sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Điểm trung bình</span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
            <Star size={18} className="fill-amber-400" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{avgRating}</span>
          <span className="text-xs text-slate-400">/ 5.0 sao</span>
        </div>
      </div>
    </div>
  );
}

