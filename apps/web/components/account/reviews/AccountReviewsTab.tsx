"use client";

import { Star } from "lucide-react";

export function AccountReviewsTab() {
  return (
    <div className="space-y-6 pt-2">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Bài đánh giá</h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Quản lý các nhận xét và đánh giá trải nghiệm của bạn
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm">
        <Star className="mx-auto mb-3 h-10 w-10 text-amber-300" />
        <p className="text-sm font-bold text-slate-700">Bạn chưa có bài đánh giá nào</p>
        <p className="mt-1 text-xs text-slate-500">
          Sau khi hoàn thành chuyến đi, bạn có thể viết đánh giá để chia sẻ cảm nhận với mọi người!
        </p>
      </div>
    </div>
  );
}
