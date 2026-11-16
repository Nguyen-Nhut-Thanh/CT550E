"use client";

import { formatVND } from "@/lib/utils/currency";
import {
  CheckCircle2,
  Gift,
  HeartHandshake,
  Percent,
  Sparkles,
  Star,
  Tag,
  Ticket,
} from "lucide-react";
import type { ComprehensiveAnalytics } from "shared";

interface AnalyticsMarketingTabProps {
  data: ComprehensiveAnalytics;
}

export function AnalyticsMarketingTab({ data }: AnalyticsMarketingTabProps) {
  const { vouchers, reviews } = data.marketing;

  const usageRate =
    vouchers.totalIssued > 0
      ? Math.round((vouchers.totalUsed / vouchers.totalIssued) * 100)
      : 0;

  const avgDiscount =
    vouchers.totalUsed > 0
      ? Math.round(vouchers.totalDiscountAmount / vouchers.totalUsed)
      : 0;

  const totalReviewsCount = reviews.totalReviews || 1;

  const starLevels = [
    {
      star: 5,
      label: "Tuyệt vời",
      count: reviews.starsCount.star5,
      color: "bg-emerald-500",
    },
    {
      star: 4,
      label: "Rất tốt",
      count: reviews.starsCount.star4,
      color: "bg-blue-500",
    },
    {
      star: 3,
      label: "Hài lòng",
      count: reviews.starsCount.star3,
      color: "bg-amber-500",
    },
    {
      star: 2,
      label: "Trung bình",
      count: reviews.starsCount.star2,
      color: "bg-orange-500",
    },
    {
      star: 1,
      label: "Cần cải thiện",
      count: reviews.starsCount.star1,
      color: "bg-rose-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* SECTION 1: VOUCHERS & PROMOTIONS */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Gift size={18} />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Hiệu Quả Mã Khuyến Mãi & Voucher Ưu Đãi
            </h4>
            <p className="text-xs text-slate-500">
              Thống kê lượt phát hành, mức độ đón nhận và ngân sách giảm giá cho khách
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
              <Ticket size={14} className="text-purple-500" />
              <span>Tổng voucher phát hành</span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {vouchers.totalIssued.toLocaleString("vi-VN")}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Có <span className="font-bold text-purple-600">{vouchers.activeCount} mã</span> đang hoạt động
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span>Lượt voucher đã áp dụng</span>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {vouchers.totalUsed.toLocaleString("vi-VN")} lượt
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Tỷ lệ sử dụng đạt <span className="font-bold text-emerald-600">{usageRate}%</span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
              <Tag size={14} className="text-rose-500" />
              <span>Tổng ngân sách giảm giá</span>
            </div>
            <p className="mt-2 text-2xl font-black text-rose-600">
              {formatVND(vouchers.totalDiscountAmount)}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Đã trừ trực tiếp vào đơn đặt tour</p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
              <Percent size={14} className="text-blue-500" />
              <span>Chiết khấu TB mỗi đơn</span>
            </div>
            <p className="mt-2 text-2xl font-black text-blue-600">
              {formatVND(avgDiscount)}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">Mức kích thích nhu cầu mua tour</p>
          </div>
        </div>
      </div>

      {/* SECTION 2: REVIEWS & CSAT ANALYSIS */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Star size={18} className="fill-amber-500" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Chỉ Số Trải Nghiệm Khách Hàng & Đánh Giá Dịch Vụ (CSAT)
            </h4>
            <p className="text-xs text-slate-500">
              Phân tích chất lượng các chuyến đi dựa trên đánh giá trực tiếp từ du khách
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Big Score Card */}
          <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/60 to-orange-50/30 p-6 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Điểm Đánh Giá Trung Bình
            </span>
            <div className="mt-2 text-5xl font-black text-slate-900 tracking-tight">
              {reviews.averageRating}
              <span className="text-2xl font-normal text-slate-400"> / 5.0</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={
                    star <= Math.round(reviews.averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  }
                />
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-600">
              Dựa trên tổng cộng{" "}
              <span className="font-black text-slate-900">
                {reviews.totalReviews.toLocaleString("vi-VN")} lượt đánh giá
              </span>
            </p>
            <div className="mt-4 rounded-xl bg-white/90 border border-amber-200/60 px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-2xs">
              <span className="text-base font-black">{reviews.satisfactionRate}%</span> khách hàng hài lòng (4-5 sao)
            </div>
          </div>

          {/* Star Breakdown Progress Bars */}
          <div className="lg:col-span-2 space-y-3 flex flex-col justify-center">
            {starLevels.map((lvl) => {
              const pct = Math.round((lvl.count / totalReviewsCount) * 100);
              return (
                <div key={lvl.star} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-16 shrink-0 font-bold text-slate-700">
                    <span>{lvl.star} sao</span>
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                  </div>

                  <div className="h-3 flex-1 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full ${lvl.color} rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="w-24 shrink-0 text-right">
                    <span className="font-bold text-slate-900">{lvl.count}</span>
                    <span className="text-slate-400 text-[11px] ml-1">({pct}%)</span>
                  </div>

                  <div className="w-24 shrink-0 text-right text-[11px] font-semibold text-slate-500">
                    {lvl.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

