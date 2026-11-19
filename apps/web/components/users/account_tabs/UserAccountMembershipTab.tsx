"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  History,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { MembershipRewardItem, MembershipTierId } from "shared";
import { DEFAULT_MEMBERSHIP_REWARDS } from "shared";
import { useAccountResource } from "@/lib/users/account/useAccountResource";
import { getMembership } from "@/lib/membership/client/api";
import { formatVND } from "@/lib/utils/currency";
import { useAccount } from "@/components/users/account_layout/UserAccountShell";
import { UserMembershipCard3D } from "@/components/membership/customer_membership/UserMembershipCard3D";
import { UserMembershipProgressCard } from "@/components/membership/customer_membership/UserMembershipProgressCard";
import { UserMembershipPointsSimulator } from "@/components/membership/customer_membership/UserMembershipPointsSimulator";
import { UserMembershipTierGrid } from "@/components/membership/customer_membership/UserMembershipTierGrid";
import { UserMembershipRewardsBoutique } from "@/components/membership/customer_membership/UserMembershipRewardsBoutique";
import { UserMembershipRedeemModal } from "@/components/membership/customer_membership/UserMembershipRedeemModal";
import { UserMembershipComparisonTable } from "@/components/membership/customer_membership/UserMembershipComparisonTable";

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export function AccountMembershipTab() {
  const { user } = useAccount();
  const { data, loading, error, refresh } = useAccountResource(
    "membership",
    getMembership,
  );

  const [activePreviewTier, setActivePreviewTier] =
    useState<MembershipTierId | null>(null);
  const [selectedReward, setSelectedReward] =
    useState<MembershipRewardItem | null>(null);

  const cardSectionRef = useRef<HTMLDivElement>(null);

  const handlePreviewTier = (tierId: MembershipTierId) => {
    setActivePreviewTier(tierId);
    cardSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) {
    return (
      <div
        role="status"
        className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 -mb-4 sm:-mb-6 lg:-mb-8 flex min-h-[500px] items-center justify-center gap-3 rounded-3xl bg-[#050B14] p-10 text-slate-400 border border-slate-800"
      >
        <Loader2 className="h-7 w-7 animate-spin text-amber-400" />
        <span className="text-sm font-semibold text-slate-200">
          Đang mở không gian đặc quyền thượng lưu AURA...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div
        role="alert"
        className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 -mb-4 sm:-mb-6 lg:-mb-8 rounded-3xl border border-rose-500/40 bg-[#050B14] p-8 text-rose-300 shadow-2xl"
      >
        <p className="font-semibold text-base">
          {error || "Không thể tải thông tin hạng thành viên."}
        </p>
        <button
          type="button"
          onClick={refresh}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-rose-500/20 px-5 py-2.5 text-xs font-bold text-rose-200 transition-colors hover:bg-rose-500/30 border border-rose-500/30"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const effectiveRewards = data.rewards?.length
    ? data.rewards
    : DEFAULT_MEMBERSHIP_REWARDS;
  const pointsBalance = data.pointsBalance ?? data.points;

  return (
    <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 -mb-4 sm:-mb-6 lg:-mb-8 p-4 sm:p-6 lg:p-7 xl:p-8 bg-[#050B14] text-slate-100 min-h-screen rounded-3xl sm:rounded-[32px] border border-slate-800/80 shadow-2xl relative overflow-hidden space-y-12 selection:bg-amber-500 selection:text-slate-950">
      {/* Ambient Background Glows chuẩn pagemember.html */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 right-0 w-[30rem] h-[30rem] bg-teal-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[28rem] h-[28rem] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      {/* 1. Header Hero Banner */}
      <header className="relative z-10 flex flex-col justify-between gap-4 border-b border-white/10 pb-8 md:flex-row md:items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Không Gian Đặc Quyền Hội Viên AURA</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
            Hành trình thượng lưu,{" "}
            <span className="bg-gradient-to-r from-[#FFF5D6] via-[#E5C158] to-[#C59B27] bg-clip-text text-transparent">
              đặc quyền xứng tầm.
            </span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Trải nghiệm dịch vụ cá nhân hóa tại hơn 1,200 khu nghỉ dưỡng 5 sao,
            hãng hàng không đối tác và du thuyền hạng sang trên toàn cầu.
          </p>
        </div>
      </header>

      {/* 2. Interactive Card (Left) & Progress/Metrics (Right) */}
      <div
        ref={cardSectionRef}
        id="membershipCardSection"
        className="relative z-10 grid grid-cols-1 items-stretch gap-6 lg:gap-8 lg:grid-cols-12"
      >
        <div className="lg:col-span-5 flex flex-col justify-between">
          <UserMembershipCard3D
            currentTierId={data.tier.id}
            memberName={user?.full_name ?? ""}
            memberId={user?.user_id}
            cycleEnd={data.cycleEnd}
            activePreviewTier={activePreviewTier ?? undefined}
            onSelectPreviewTier={setActivePreviewTier}
          />
        </div>

        <div className="lg:col-span-7 flex flex-col">
          <UserMembershipProgressCard summary={data} />
        </div>
      </div>

      {/* 3. Interactive Points & Cash Simulator */}
      <div className="relative z-10">
        <UserMembershipPointsSimulator currentTierId={data.tier.id} />
      </div>

      {/* 4. 5-Tier Cards Grid with Perk Filters */}
      <div className="relative z-10">
        <UserMembershipTierGrid
          tiers={data.tiers}
          currentTierId={data.tier.id}
          onPreviewTier={handlePreviewTier}
        />
      </div>

      {/* 5. Rewards Boutique Showcase */}
      <div className="relative z-10">
        <UserMembershipRewardsBoutique
          rewards={effectiveRewards}
          pointsBalance={pointsBalance}
          onSelectReward={(reward) => setSelectedReward(reward)}
        />
      </div>

      {/* 6. Comprehensive Matrix Comparison Table */}
      <div className="relative z-10">
        <UserMembershipComparisonTable
          tiers={data.tiers}
          currentTierId={data.tier.id}
        />
      </div>

      {/* 7. Accumulation History & Cycles */}
      <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Current Cycle Bookings */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#122238]/45 backdrop-blur-xl lg:col-span-7 shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/10 p-5 bg-[#050B14]/40">
            <History className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Lịch sử tích lũy trong kỳ hiện tại
            </h2>
          </div>

          {data.history.length ? (
            <ul className="divide-y divide-white/5">
              {data.history.map((item) => (
                <li
                  key={item.bookingId}
                  className="flex flex-wrap items-center justify-between gap-3 p-5 transition-colors hover:bg-white/5"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/booking/${item.bookingId}`}
                      className="text-sm font-bold text-white hover:text-amber-300 transition-colors line-clamp-1"
                    >
                      {item.tourName}
                    </Link>
                    <p className="mt-1 text-xs text-slate-400">
                      Đơn #{item.bookingId} • Hoàn thành ngày{" "}
                      {formatDate(item.completedAt)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-emerald-400">
                      +{formatVND(item.amount)}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-amber-400">
                      +{item.points.toLocaleString("vi-VN")} Pts
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-8 text-center text-xs text-slate-400">
              Chưa có tour hoàn thành đủ điều kiện tích lũy trong chu kỳ này.
            </p>
          )}
        </section>

        {/* Past Cycles History */}
        <section className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#122238]/45 p-5 backdrop-blur-xl lg:col-span-5 shadow-xl">
          <div>
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <CalendarDays className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Các kỳ xét hạng trước đây
              </h2>
            </div>

            {data.cycles.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {[...data.cycles].reverse().map((cycle) => (
                  <li
                    key={cycle.start}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/5 bg-[#050B14]/70 p-3.5 text-xs text-slate-300"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {formatDate(cycle.start)} – {formatDate(cycle.end)}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tổng chi tiêu: {formatVND(cycle.spending)}
                      </p>
                    </div>
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-300 uppercase">
                      Hạng{" "}
                      {data.tiers.find((t) => t.id === cycle.tier)?.name ??
                        cycle.tier}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="p-8 text-center text-xs text-slate-400">
                Tài khoản đang ở chu kỳ xét hạng đầu tiên.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* 8. Policy & Operation Rules Explanations */}
      <section className="relative z-10 rounded-3xl border border-amber-400/35 bg-gradient-to-br from-amber-500/12 via-[#0A1424]/85 to-[#050B14] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-2 text-amber-400 mb-4">
          <Info className="h-5 w-5" />
          <h2 className="font-serif text-lg sm:text-xl font-bold text-white">
            Quy Định Vận Hành & Chính Sách Đặc Quyền
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 text-xs leading-relaxed text-slate-300">
          <div className="rounded-2xl border border-white/10 bg-[#050B14]/80 p-4">
            <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Chu kỳ xét hạng 12 tháng
            </h3>
            <p>
              Chu kỳ tính từ ngày tour đầu tiên hoàn thành. Ngay khi tổng chi tiêu
              thực tế đạt mốc mới, hệ thống tự động thăng hạng tức thì (real-time)
              và phát voucher thăng hạng vào ví. Hết 12 tháng, hệ thống xét duy trì
              hoặc điều chỉnh hạng theo chi tiêu kỳ vừa qua.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#050B14]/80 p-4">
            <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              Tích & Tiêu điểm thưởng
            </h3>
            <p>
              Mỗi 100.000đ thực trả của tour hoàn thành = 1 điểm cơ bản × Hệ số
              hạng thẻ. Điểm thưởng có thể dùng để trừ tiền trực tiếp khi đặt tour
              (1 điểm = 1.000đ, tối đa 30% giá trị đơn hàng) hoặc đổi các gói nghỉ
              dưỡng cao cấp tại Sàn đổi quà.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#050B14]/80 p-4">
            <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Chiết khấu thông minh 4 lớp
            </h3>
            <p>
              Khi thanh toán đơn tour: Lớp 1 (Trừ voucher) → Lớp 2 (Giảm theo hạng
              hội viên 2% – 7% trên giá tour còn lại) → Lớp 3 (Giảm dịch vụ đi kèm
              5% – 20%) → Lớp 4 (Quy đổi điểm thưởng Points + Cash).
            </p>
          </div>
        </div>
      </section>

      {/* Redemption Modal */}
      {selectedReward && (
        <UserMembershipRedeemModal
          reward={selectedReward}
          pointsBalance={pointsBalance}
          onClose={() => setSelectedReward(null)}
          onSuccess={() => {
            void refresh();
          }}
        />
      )}
    </div>
  );
}
