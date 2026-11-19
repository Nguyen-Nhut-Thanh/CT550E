"use client";

import { AdminStatCard } from "@/components/common/admin_shared/cards/AdminStatCard";

import { formatVND } from "@/lib/utils/currency";
import {
  CheckCircle2,
  MessageSquare,
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
    <div className="space-y-3">
      {/* SECTION 1: VOUCHERS & PROMOTIONS */}
      <div className="min-w-0 rounded-[14px] border border-[#e1edfc] bg-white p-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#edf2fb]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <Gift size={18} />
          </div>
          <div>
            <h4 className="text-[16px] font-[750] leading-[1.5] text-[#0b1747]">
              Hiệu Quả Mã Khuyến Mãi & Voucher Ưu Đãi
            </h4>
            <p className="text-xs text-[#7387aa]">
              Thống kê lượt phát hành, mức độ đón nhận và ngân sách giảm giá cho khách
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-3 @max-[1180px]/analytics:grid-cols-2 @max-[650px]/analytics:grid-cols-1">
          <AdminStatCard title="Tổng voucher phát hành" value={vouchers.totalIssued.toLocaleString("vi-VN")} description={`Có ${vouchers.activeCount} mã đang hoạt động`} icon={Ticket} tone="purple" />
          <AdminStatCard title="Lượt voucher đã áp dụng" value={`${vouchers.totalUsed.toLocaleString("vi-VN")} lượt`} description={`Tỷ lệ sử dụng đạt ${usageRate}%`} icon={CheckCircle2} tone="green" />
          <AdminStatCard title="Tổng ngân sách giảm giá" value={formatVND(vouchers.totalDiscountAmount)} description="Đã trừ trực tiếp vào đơn đặt tour" icon={Tag} tone="rose" />
          <AdminStatCard title="Chiết khấu TB mỗi đơn" value={formatVND(avgDiscount)} description="Mức kích thích nhu cầu mua tour" icon={Percent} />
        </div>
      </div>

      {/* SECTION 2: REVIEWS & CSAT ANALYSIS */}
      <div className="min-w-0 rounded-[14px] border border-[#e1edfc] bg-white p-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#edf2fb]">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Star size={18} className="fill-amber-500" />
          </div>
          <div>
            <h4 className="text-[16px] font-[750] leading-[1.5] text-[#0b1747]">
              Chỉ Số Trải Nghiệm Khách Hàng & Đánh Giá Dịch Vụ (CSAT)
            </h4>
            <p className="text-xs text-[#7387aa]">
              Phân tích chất lượng các chuyến đi dựa trên đánh giá trực tiếp từ du khách
            </p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-3 @max-[900px]/analytics:grid-cols-1">
          {/* Big Score Card */}
          <AdminStatCard title="Điểm đánh giá trung bình" value={`${reviews.averageRating} / 5.0`} description={`Dựa trên tổng cộng ${reviews.totalReviews.toLocaleString("vi-VN")} lượt đánh giá`} icon={MessageSquare} tone="amber"
            badge={<span className="rounded-full border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-emerald-700">{reviews.satisfactionRate}% hài lòng</span>}
          >
            <div className="flex items-center justify-center gap-1 text-amber-500" aria-label={`Điểm trung bình ${reviews.averageRating} trên 5 sao`}>
              {[1,2,3,4,5].map(star => <Star key={star} size={20} className={star <= Math.round(reviews.averageRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"} />)}
            </div>
          </AdminStatCard>

          {/* Star Breakdown Progress Bars */}
          <div className="col-span-2 @max-[900px]/analytics:col-span-1 space-y-3 flex flex-col justify-center">
            {starLevels.map((lvl) => {
              const pct = Math.round((lvl.count / totalReviewsCount) * 100);
              return (
                <div key={lvl.star} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-16 shrink-0 font-bold text-slate-700">
                    <span>{lvl.star} sao</span>
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                  </div>

                  <div className="h-2 min-w-0 flex-1 rounded-[20px] bg-[#e1eaf7] overflow-hidden">
                    <div
                      className={`h-full ${lvl.color} rounded-full transition-all duration-300`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>

                  <div className="w-24 shrink-0 text-right">
                    <span className="font-bold text-[#0b1747]">{lvl.count}</span>
                    <span className="text-[#7387aa] text-[11px] ml-1">({pct}%)</span>
                  </div>

                  <div className="w-24 shrink-0 text-right text-[11px] font-semibold text-[#7387aa] @max-[650px]/analytics:hidden">
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

