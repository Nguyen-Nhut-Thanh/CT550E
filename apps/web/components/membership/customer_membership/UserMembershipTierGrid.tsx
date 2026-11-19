"use client";

import { useState } from "react";
import {
  Award,
  Building2,
  CheckCircle2,
  Compass,
  Crown,
  Eye,
  Gem,
  Plane,
  ShieldCheck,
  Star,
} from "lucide-react";
import type { MembershipTier, MembershipTierId } from "shared";
import { formatVND } from "@/lib/utils/currency";

interface UserMembershipTierGridProps {
  tiers: MembershipTier[];
  currentTierId: MembershipTierId;
  onPreviewTier: (tierId: MembershipTierId) => void;
}

type PerkCategory = "all" | "lounge" | "hotel" | "shield";

interface PerkItem {
  text: string;
  category: "all" | "lounge" | "hotel" | "shield";
  isIncluded?: boolean;
}

const TIER_DETAILS: Record<
  MembershipTierId,
  {
    subtitle: string;
    icon: typeof Compass;
    perks: PerkItem[];
    badgeStyle: string;
  }
> = {
  bronze: {
    subtitle: "Khởi đầu hành trình khám phá",
    icon: Compass,
    badgeStyle: "bg-amber-950/40 text-amber-300 border-amber-800/40",
    perks: [
      {
        text: "Tích lũy chi tiêu & điểm thưởng 1.0× sau mỗi chuyến đi",
        category: "all",
      },
      {
        text: "Voucher quà tặng sinh nhật 50.000đ hàng năm",
        category: "all",
      },
      {
        text: "Thức uống chào mừng tại một số khách sạn đối tác",
        category: "hotel",
      },
      {
        text: "Hỗ trợ khách hàng qua cổng thông tin tiêu chuẩn",
        category: "shield",
      },
    ],
  },
  silver: {
    subtitle: "Tận hưởng tiện nghi khởi đầu",
    icon: Award,
    badgeStyle: "bg-slate-800 text-slate-300 border-slate-600",
    perks: [
      {
        text: "Giảm trực tiếp 2% giá vé mọi tour du lịch",
        category: "all",
      },
      {
        text: "Tích lũy ×1.2 điểm thưởng trên số tiền thực trả",
        category: "all",
      },
      {
        text: "Giảm 5% dịch vụ đi kèm (xe đưa đón, phòng VIP)",
        category: "hotel",
      },
      {
        text: "Voucher thăng hạng 100.000đ + Voucher sinh nhật 100.000đ",
        category: "all",
      },
      {
        text: "Ưu tiên hỗ trợ xử lý giữ chỗ trong 24h",
        category: "shield",
      },
    ],
  },
  gold: {
    subtitle: "Tiện nghi & Dịch vụ nâng tầm",
    icon: Star,
    badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    perks: [
      {
        text: "Giảm trực tiếp 3% giá vé tour trọn gói",
        category: "all",
      },
      {
        text: "Tích lũy ×1.5 điểm thưởng mọi giao dịch",
        category: "all",
      },
      {
        text: "Giảm 10% các dịch vụ du lịch đi kèm",
        category: "hotel",
      },
      {
        text: "Ưu tiên chọn chỗ ngồi đầu xe / máy bay",
        category: "lounge",
      },
      {
        text: "Trip Shield: Miễn phí đổi ngày khởi hành 01 lần/năm (trước 7 ngày)",
        category: "shield",
      },
      {
        text: "Voucher thăng hạng 3% (max 200k) + Sinh nhật 200.000đ",
        category: "all",
      },
    ],
  },
  platinum: {
    subtitle: "Đặc quyền ưu tiên toàn cầu",
    icon: Crown,
    badgeStyle: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    perks: [
      {
        text: "Giảm trực tiếp 5% vé tour (chia sẻ tối đa 2 người đi cùng)",
        category: "all",
      },
      {
        text: "Tích lũy ×2.0 điểm thưởng mọi giao dịch",
        category: "all",
      },
      {
        text: "01 lượt nâng hạng phòng resort/năm + 01 chuyến xe đón sân bay",
        category: "hotel",
      },
      {
        text: "Ưu đãi phòng chờ thương gia sân bay quốc nội & quốc tế",
        category: "lounge",
      },
      {
        text: "Trip Shield: Hoàn/hủy linh hoạt trước 72h (hoàn về ví điểm)",
        category: "shield",
      },
      {
        text: "Kênh phục vụ VIP riêng biệt & Voucher sinh nhật 300.000đ",
        category: "shield",
      },
    ],
  },
  diamond: {
    subtitle: "Đỉnh cao xa hoa & Quản gia riêng",
    icon: Gem,
    badgeStyle: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    perks: [
      {
        text: "Giảm trực tiếp 7% vé tour (chia sẻ tối đa 3 người đi cùng)",
        category: "all",
      },
      {
        text: "Tích lũy ×3.0 điểm thưởng tối đa",
        category: "all",
      },
      {
        text: "Tự động nâng hạng phòng Suite/Villa khi có phòng trống",
        category: "hotel",
      },
      {
        text: "Phòng chờ First Class toàn cầu & Xe đón tiễn Mercedes",
        category: "lounge",
      },
      {
        text: "Bảo hiểm hủy chuyến cao cấp & Đổi lịch trình không giới hạn",
        category: "shield",
      },
      {
        text: "Chuyên viên tư vấn & Quản gia Concierge 1-1 phục vụ 24/7",
        category: "shield",
      },
      {
        text: "Tặng 01 thẻ Bạc cho người thân + Voucher sinh nhật 500.000đ",
        category: "all",
      },
    ],
  },
};

export function UserMembershipTierGrid({
  tiers,
  currentTierId,
  onPreviewTier,
}: UserMembershipTierGridProps) {
  const [filterCategory, setFilterCategory] = useState<PerkCategory>("all");

  return (
    <section className="space-y-6">
      {/* Header and Filter Buttons */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Hệ thống phân hạng
          </span>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-white">
            Năm Cấp Độ Đặc Quyền Xứng Tầm
          </h2>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Nâng hạng tự động dựa trên chi tiêu thực tế tích lũy trong chu kỳ 12
            tháng.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 rounded-2xl border border-white/10 bg-[#0A1424]/90 p-1.5 shadow-sm">
          <button
            type="button"
            onClick={() => setFilterCategory("all")}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              filterCategory === "all"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-[#050B14] shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Tất cả đặc quyền
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory("lounge")}
            className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              filterCategory === "lounge"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-[#050B14] shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Plane className="h-3.5 w-3.5" />
            <span>Phòng chờ & Đưa đón</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory("hotel")}
            className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              filterCategory === "hotel"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-[#050B14] shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Khách sạn & Nghỉ dưỡng</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory("shield")}
            className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              filterCategory === "shield"
                ? "bg-gradient-to-r from-amber-400 to-amber-500 font-bold text-[#050B14] shadow"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Trip Shield & Hỗ trợ VIP</span>
          </button>
        </div>
      </div>

      {/* 5 Cards Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 xl:gap-2.5">
        {tiers.map((tier) => {
          const detail = TIER_DETAILS[tier.id] ?? TIER_DETAILS.bronze;
          const Icon = detail.icon;
          const isUserTier = tier.id === currentTierId;

          return (
            <div
              key={tier.id}
              className={`relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border p-3.5 sm:p-4 xl:px-3 xl:py-4 backdrop-blur-xl transition-all duration-300 ${
                isUserTier
                  ? "border-2 border-amber-400 bg-gradient-to-b from-amber-500/15 via-[#0A1424]/90 to-[#050B14] shadow-xl shadow-amber-500/15"
                  : "border-white/10 bg-[#122238]/45 hover:border-white/20 hover:bg-[#122238]/60"
              }`}
            >
              {isUserTier && (
                <div className="absolute -top-3 left-3 sm:left-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#050B14] shadow-md">
                  Hạng của bạn
                </div>
              )}

              <div>
                {/* Top Badge & Icon */}
                <div className="mb-2.5 flex items-center justify-between">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${detail.badgeStyle}`}
                  >
                    Hạng {tier.name}
                  </span>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400" />
                </div>

                <h3 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                  {tier.id === "bronze" ? "Member" : tier.name}
                </h3>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {detail.subtitle}
                </p>

                {/* Qualification Threshold */}
                <div className="my-3 border-y border-white/10 py-2.5 text-xs">
                  <p className="text-slate-400 text-[11px]">Điều kiện đạt hạng</p>
                  <p className="mt-0.5 text-xs sm:text-sm font-bold text-white">
                    {tier.threshold > 0
                      ? `Từ ${formatVND(tier.threshold)}`
                      : "Đăng ký tài khoản miễn phí"}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-amber-300">
                    Tích lũy ×{tier.pointMultiplier.toLocaleString("vi-VN")} điểm
                  </p>
                </div>

                {/* Perks List */}
                <ul className="space-y-2 text-xs text-slate-300">
                  {detail.perks.map((perk, idx) => {
                    const isDimmed =
                      filterCategory !== "all" &&
                      perk.category !== filterCategory;

                    return (
                      <li
                        key={idx}
                        className={`flex items-start gap-1.5 transition-opacity duration-200 ${
                          isDimmed ? "opacity-20" : "opacity-100"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                        <span className="leading-snug text-[11.5px] sm:text-xs">{perk.text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-2">
                <button
                  type="button"
                  onClick={() => onPreviewTier(tier.id)}
                  className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition-all ${
                    isUserTier
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-[#050B14] shadow-md shadow-amber-500/20 hover:brightness-110"
                      : "border border-white/15 bg-white/5 text-slate-300 hover:border-amber-400/40 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>
                    {isUserTier ? "Xem thẻ của bạn" : `Xem thẻ ${tier.name}`}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
