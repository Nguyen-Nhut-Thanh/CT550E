"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import type { MembershipTierId } from "shared";
import { formatVND } from "@/lib/utils/currency";

interface UserMembershipPointsSimulatorProps {
  currentTierId: MembershipTierId;
}

interface TierSimConfig {
  id: MembershipTierId;
  name: string;
  badge: string;
  multiplier: number;
  multiplierText: string;
  borderClass: string;
  textColor: string;
}

const SIM_TIER_CONFIGS: TierSimConfig[] = [
  {
    id: "bronze",
    name: "Đồng (Member)",
    badge: "1.0× Điểm",
    multiplier: 1.0,
    multiplierText: "1.0×",
    borderClass: "border-white/10 hover:border-white/20",
    textColor: "text-amber-200",
  },
  {
    id: "silver",
    name: "Bạc (Explorer)",
    badge: "1.2× Điểm",
    multiplier: 1.2,
    multiplierText: "1.2×",
    borderClass: "border-white/10 hover:border-white/20",
    textColor: "text-slate-200",
  },
  {
    id: "gold",
    name: "Vàng (Voyager)",
    badge: "1.5× Điểm",
    multiplier: 1.5,
    multiplierText: "1.5×",
    borderClass: "border-amber-400/40 hover:border-amber-400/60",
    textColor: "text-amber-400",
  },
  {
    id: "platinum",
    name: "Bạch Kim (Elite)",
    badge: "2.0× Điểm",
    multiplier: 2.0,
    multiplierText: "2.0×",
    borderClass: "border-cyan-500/30 hover:border-cyan-400/50",
    textColor: "text-cyan-300",
  },
  {
    id: "diamond",
    name: "Kim Cương (Signature)",
    badge: "3.0× Điểm",
    multiplier: 3.0,
    multiplierText: "3.0×",
    borderClass: "border-emerald-500/30 hover:border-emerald-400/50",
    textColor: "text-emerald-300",
  },
];

export function UserMembershipPointsSimulator({
  currentTierId,
}: UserMembershipPointsSimulatorProps) {
  const [spendMillions, setSpendMillions] = useState<number>(50);

  const spendAmount = spendMillions * 1_000_000;
  // 100,000 VND = 1 base point -> 1 Million VND = 10 base points
  const basePoints = spendMillions * 10;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-amber-400/35 bg-gradient-to-br from-amber-500/12 via-[#0A1424]/80 to-[#050B14] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      {/* Section Title */}
      <div className="max-w-3xl mb-7">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
          <Calculator className="h-3.5 w-3.5" />
          <span>Công cụ ước tính quyền lợi</span>
        </div>
        <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Bộ Mô Phỏng Tích Điểm Thưởng (Pts)
        </h2>
        <p className="mt-1.5 text-xs text-slate-300 sm:text-sm">
          Kéo thanh trượt để chọn mức chi tiêu du lịch dự kiến. Cứ mỗi 100.000đ
          tích 1 Pts cơ bản × hệ số hạng. Quy đổi chuẩn:{" "}
          <strong className="text-amber-300">1 Pts = 1.000đ</strong> dùng trừ trực
          tiếp tiền tour hoặc đổi quà độc quyền.
        </p>
      </div>

      {/* Interactive Range Slider */}
      <div className="mb-7 rounded-2xl border border-white/10 bg-[#050B14]/85 p-5 sm:p-6 shadow-inner">
        <div className="mb-3 flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline">
          <label
            htmlFor="spendRangeInput"
            className="text-xs font-medium text-slate-300 sm:text-sm"
          >
            Mức chi tiêu du lịch & nghỉ dưỡng dự kiến:
          </label>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-400">
              {formatVND(spendAmount)}
            </span>
            <span className="text-xs text-slate-400">/ năm hoặc chuyến đi</span>
          </div>
        </div>

        <input
          id="spendRangeInput"
          type="range"
          min="5"
          max="300"
          step="5"
          value={spendMillions}
          onChange={(e) => setSpendMillions(Number(e.target.value))}
          className="h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-amber-400 focus:outline-hidden"
          aria-label="Chọn mức chi tiêu dự kiến"
        />

        <div className="mt-2.5 flex justify-between text-[11px] font-medium text-slate-400">
          <span>5 Triệu ₫</span>
          <span>50 Triệu ₫</span>
          <span>150 Triệu ₫</span>
          <span>300 Triệu ₫</span>
        </div>
      </div>

      {/* 5 Tiers Output Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 xl:gap-2.5">
        {SIM_TIER_CONFIGS.map((t) => {
          const isUserTier = t.id === currentTierId;
          const pointsEarned = Math.round(basePoints * t.multiplier);
          const pointsCashValue = pointsEarned * 1_000;

          return (
            <div
              key={t.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-3.5 sm:p-4 xl:px-3 xl:py-3.5 transition-all duration-200 ${
                isUserTier
                  ? "border-2 border-amber-400 bg-gradient-to-b from-amber-500/15 to-[#050B14]/90 shadow-lg shadow-amber-500/10"
                  : `border-white/10 bg-[#050B14]/80 text-white hover:border-white/25 ${t.borderClass}`
              }`}
            >
              {isUserTier && (
                <span className="absolute -top-2.5 right-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#050B14] shadow">
                  Hạng của bạn
                </span>
              )}

              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider ${t.textColor}`}
                  >
                    {t.name}
                  </span>
                  <span className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-slate-300">
                    {t.multiplierText}
                  </span>
                </div>

                <div className="text-xl sm:text-2xl font-black text-white">
                  {pointsEarned.toLocaleString("vi-VN")}{" "}
                  <span className="text-xs font-normal text-slate-400">Pts</span>
                </div>
              </div>

              <div className="mt-3 border-t border-white/10 pt-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Quy đổi ví điểm:</span>
                  <strong className={`font-semibold ${t.textColor}`}>
                    ~ {formatVND(pointsCashValue)}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
