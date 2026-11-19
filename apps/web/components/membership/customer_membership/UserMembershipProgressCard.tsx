"use client";

import Link from "next/link";
import {
  AlertCircle,
  CalendarDays,
  ChevronRight,
  Sparkles,
  TicketPercent,
  TrendingUp,
  Wallet,
} from "lucide-react";
import type { MembershipSummary } from "shared";
import { formatVND } from "@/lib/utils/currency";

interface UserMembershipProgressCardProps {
  summary: MembershipSummary;
}

export function UserMembershipProgressCard({
  summary,
}: UserMembershipProgressCardProps) {
  const {
    tier,
    nextTier,
    spending,
    pointsBalance,
    points,
    toNextTier,
    toRetainTier,
    progress,
    cycleStart,
    cycleEnd,
    vouchers,
  } = summary;

  const availableVouchersCount = vouchers.filter(
    (v) => v.state === "available",
  ).length;

  const currentPoints = pointsBalance ?? points;

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  const daysToCycleEnd = cycleEnd
    ? Math.max(
        0,
        Math.ceil(
          (new Date(cycleEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  const isRenewalNear = daysToCycleEnd !== null && daysToCycleEnd <= 30;

  return (
    <div className="flex h-full flex-col justify-between rounded-3xl border border-white/10 bg-[#122238]/45 p-4 sm:p-5 backdrop-blur-xl shadow-2xl text-slate-100 gap-3">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Trạng thái tài khoản
          </span>
          <div className="mt-0.5 flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Hạng {tier.name}
            </h2>
            <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
              {tier.id === "diamond"
                ? "Top 1% VIP"
                : tier.id === "platinum"
                  ? "Top 5% Hội viên"
                  : tier.id === "gold"
                    ? "Top 15% Hội viên"
                    : "Hội viên chính thức"}
            </span>
          </div>
        </div>

        <Link
          href="/account/wallet"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-slate-200 transition-colors hover:border-amber-400/40 hover:bg-white/10 hover:text-white"
        >
          <TicketPercent className="h-3.5 w-3.5 text-amber-400" />
          <span>{availableVouchersCount} voucher khả dụng</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="rounded-xl border border-white/5 bg-[#050B14]/70 p-3">
          <p className="text-[11px] font-medium text-slate-400">
            Chi tiêu xét hạng kỳ này
          </p>
          <p className="mt-0.5 text-lg sm:text-xl font-black text-white">
            {formatVND(spending)}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-400">
            Chu kỳ xét hạng 12 tháng
          </p>
        </div>

        <div className="rounded-xl border border-amber-400/20 bg-gradient-to-br from-amber-500/10 via-[#0A1424]/60 to-[#050B14]/80 p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-amber-300">
              Điểm thưởng khả dụng
            </p>
            <Wallet className="h-3.5 w-3.5 text-amber-400" />
          </div>
          <p className="mt-0.5 text-lg sm:text-xl font-black text-amber-400">
            {currentPoints.toLocaleString("vi-VN")}{" "}
            <span className="text-[11px] font-normal text-amber-200/80">Pts</span>
          </p>
          <p className="mt-0.5 text-[10px] text-amber-200/70">
            Tương đương ~ {formatVND(currentPoints * 1000)} tiền mặt
          </p>
        </div>
      </div>

      {/* Progress to Next Tier */}
      <div className="space-y-2 rounded-xl border border-white/5 bg-[#050B14]/70 p-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-200">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            {nextTier ? (
              <span>
                Tiến trình lên hạng{" "}
                <span className="font-extrabold text-amber-300">
                  {nextTier.name}
                </span>
              </span>
            ) : (
              <span>Bạn đang giữ hạng cao nhất</span>
            )}
          </h3>
          <span className="text-xs font-extrabold text-emerald-400">
            {Math.floor(progress)}%
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-1000"
            style={{ width: `${Math.min(100, Math.max(progress, 2))}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          {nextTier ? (
            <span>
              Cần thêm{" "}
              <strong className="text-amber-300 font-bold">
                {formatVND(toNextTier)}
              </strong>{" "}
              chi tiêu từ tour hoàn thành
            </span>
          ) : (
            <span className="text-emerald-400 font-medium">
              Đặc quyền tối thượng dành cho khách hàng VIP
            </span>
          )}
          {nextTier && (
            <span className="text-slate-400">
              Mốc kế tiếp: {formatVND(nextTier.threshold)}
            </span>
          )}
        </div>
      </div>

      {/* Retention & Anniversary Cycle Alert */}
      <div className="border-t border-white/10 pt-2.5 text-[11px] text-slate-400 space-y-1">
        {tier.id !== "bronze" && toRetainTier > 0 && !isRenewalNear && (
          <p className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
            <span>
              Cần thêm{" "}
              <strong className="text-white font-semibold">
                {formatVND(toRetainTier)}
              </strong>{" "}
              để duy trì hạng {tier.name} cho kỳ sau.
            </span>
          </p>
        )}

        {cycleStart && cycleEnd ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-amber-400/80" />
              Chu kỳ xét hạng: {formatDate(cycleStart)} – {formatDate(cycleEnd)}
            </span>
            {daysToCycleEnd !== null && (
              <span
                className={`font-semibold ${
                  isRenewalNear ? "text-amber-400" : "text-slate-300"
                }`}
              >
                Còn {daysToCycleEnd} ngày
              </span>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-slate-500">
            Chu kỳ xét hạng 12 tháng sẽ bắt đầu khi bạn hoàn thành chuyến đi đầu
            tiên.
          </p>
        )}

        {isRenewalNear && toRetainTier > 0 && (
          <div className="flex items-start gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-200">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
            <span>
              Kỳ xét hạng của bạn sẽ kết thúc sau {daysToCycleEnd} ngày nữa. Đặt
              thêm tour để hoàn thành trước ngày kết thúc và giữ trọn đặc quyền
              hạng {tier.name}!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
