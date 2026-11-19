"use client";

import { ArrowRight, Gift, Wallet } from "lucide-react";
import type { MembershipRewardItem } from "shared";

interface UserMembershipRewardsBoutiqueProps {
  rewards: MembershipRewardItem[];
  pointsBalance: number;
  onSelectReward: (reward: MembershipRewardItem) => void;
}

export function UserMembershipRewardsBoutique({
  rewards,
  pointsBalance,
  onSelectReward,
}: UserMembershipRewardsBoutiqueProps) {
  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
            <Gift className="h-3.5 w-3.5" />
            <span>AURA Boutique</span>
          </div>
          <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-white">
            Đổi Điểm Lấy Trải Nghiệm Độc Bản
          </h2>
          <p className="mt-1 text-xs text-slate-400 sm:text-sm">
            Quy đổi điểm thưởng tích lũy lấy các kỳ nghỉ 5 sao, vé máy bay thương
            gia và du thuyền sang trọng.
          </p>
        </div>

        {/* User Balance Chip */}
        <div className="flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-[#0A1424] px-4 py-2.5 shadow-md">
          <Wallet className="h-5 w-5 text-amber-400" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">
              Điểm khả dụng của bạn
            </p>
            <p className="text-base font-extrabold text-amber-300">
              {pointsBalance.toLocaleString("vi-VN")}{" "}
              <span className="text-xs font-normal text-slate-400">Pts</span>
            </p>
          </div>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {rewards.map((reward) => {
          const canAfford = pointsBalance >= reward.pointsCost;

          return (
            <div
              key={reward.id}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#122238]/45 backdrop-blur-xl transition-all duration-300 hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/5"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                  <img
                    src={reward.imageUrl}
                    alt={reward.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-transparent" />

                  {/* Category Badge */}
                  <span className="absolute top-3 left-3 rounded-full border border-white/20 bg-[#050B14]/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300 backdrop-blur-md">
                    {reward.category}
                  </span>

                  {/* Points Cost Pill */}
                  <span className="absolute bottom-3 right-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-xs font-black text-[#050B14] shadow-lg">
                    {reward.pointsCost.toLocaleString("vi-VN")} Pts
                  </span>
                </div>

                {/* Details */}
                <div className="p-5">
                  <h3 className="font-serif text-base font-bold text-white leading-snug group-hover:text-amber-300 transition-colors">
                    {reward.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {reward.description}
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => onSelectReward(reward)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                    canAfford
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-[#050B14] shadow-md shadow-amber-500/10 hover:brightness-110 active:scale-[0.99]"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{canAfford ? "Đổi ngay" : "Xem điều kiện đổi"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
