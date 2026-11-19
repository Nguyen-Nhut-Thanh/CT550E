"use client";

import { AdminStatCard } from "@/components/common/admin_shared/cards/AdminStatCard";

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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <AdminStatCard title="Tổng đánh giá" value={total} description="lượt gửi" icon={Star} />
      <AdminStatCard title="Chờ kiểm duyệt" value={pendingCount} description="cần xử lý" icon={Clock} tone="amber" badge={pendingCount > 0 ? <AlertCircle size={13} aria-label="Có đánh giá cần xử lý" className="text-amber-600" /> : undefined} />
      <AdminStatCard title="Đã phê duyệt" value={approvedCount} description="hiển thị công khai" icon={CheckCircle} tone="green" />
      <AdminStatCard title="Từ chối / Đã ẩn" value={rejectedCount} description="vi phạm / ẩn" icon={ThumbsDown} tone="rose" />
      <AdminStatCard title="Điểm trung bình" value={avgRating} description="/ 5.0 sao" icon={Star} tone="amber" className="col-span-2 sm:col-span-2 lg:col-span-1" />
    </div>
  );
}

