"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Gift,
  Loader2,
  TicketPercent,
  X,
} from "lucide-react";
import type { MembershipRewardItem } from "shared";
import { redeemMembershipReward } from "@/lib/membership/client/api";

interface UserMembershipRedeemModalProps {
  reward: MembershipRewardItem | null;
  pointsBalance: number;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}

export function UserMembershipRedeemModal({
  reward,
  pointsBalance,
  onClose,
  onSuccess,
}: UserMembershipRedeemModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    code: string;
    remaining: number;
  } | null>(null);

  if (!reward) return null;

  const cost = reward.pointsCost;
  const remaining = pointsBalance - cost;
  const hasEnoughPoints = remaining >= 0;

  const handleConfirm = async () => {
    if (!hasEnoughPoints || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await redeemMembershipReward(reward.id);
      if (res.success) {
        setSuccessData({
          code: res.voucherCode,
          remaining: res.remainingPoints,
        });
        onSuccess(res.remainingPoints);
      } else {
        setError("Không thể thực hiện quy đổi điểm. Vui lòng thử lại sau.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Đã có lỗi xảy ra khi đổi điểm.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="redeemModalTitle"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/40 bg-[#0A1424] p-6 sm:p-8 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng hộp thoại"
          className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {!successData ? (
          /* Confirmation View */
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-500/20 text-amber-400">
              <Gift className="h-6 w-6" />
            </div>

            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
              {reward.category}
            </span>
            <h3
              id="redeemModalTitle"
              className="mt-1 font-serif text-lg sm:text-xl font-bold text-white leading-snug"
            >
              {reward.title}
            </h3>

            {/* Calculations Box */}
            <div className="my-5 space-y-2.5 rounded-2xl border border-white/10 bg-[#050B14]/90 p-4 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Số điểm hiện tại của bạn:</span>
                <span className="font-bold text-white">
                  {pointsBalance.toLocaleString("vi-VN")} Pts
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Điểm cần quy đổi:</span>
                <span className="font-bold text-amber-400">
                  -{cost.toLocaleString("vi-VN")} Pts
                </span>
              </div>
              <div className="border-t border-white/10 pt-2.5 flex justify-between text-sm">
                <span className="font-medium text-slate-300">
                  Số dư sau khi đổi:
                </span>
                <span
                  className={`font-black ${
                    hasEnoughPoints ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {hasEnoughPoints
                    ? `${remaining.toLocaleString("vi-VN")} Pts`
                    : `Thiếu ${Math.abs(remaining).toLocaleString("vi-VN")} Pts`}
                </span>
              </div>
            </div>

            {/* Error or Notice */}
            {!hasEnoughPoints && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span>
                  Số điểm khả dụng của bạn không đủ để đổi phần thưởng này. Hoàn
                  thành thêm tour để tích lũy điểm!
                </span>
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Modal Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 rounded-xl border border-white/15 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5"
              >
                Để sau
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!hasEnoughPoints || loading}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold transition-all ${
                  hasEnoughPoints && !loading
                    ? "bg-gradient-to-r from-amber-400 to-amber-500 text-[#050B14] shadow-lg shadow-amber-500/20 hover:brightness-110"
                    : "cursor-not-allowed border border-white/10 bg-white/5 text-slate-500"
                }`}
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>{loading ? "Đang xử lý..." : "Xác nhận đổi ngay"}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Success View */
          <div className="py-2 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3 className="font-serif text-2xl font-bold text-white">
              Đổi Thưởng Thành Công!
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-300">
              Mã E-Voucher đặc quyền đã được phát hành và lưu vào ví ưu đãi AURA
              của bạn.
            </p>

            {/* Generated Voucher Code */}
            <div className="my-5 rounded-xl border border-dashed border-amber-400/50 bg-[#050B14] p-3 font-mono text-base font-extrabold tracking-widest text-amber-300 select-all">
              {successData.code}
            </div>

            <div className="space-y-2">
              <Link
                href="/account/wallet"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 text-xs font-bold text-[#050B14] shadow-lg shadow-amber-500/20 transition-all hover:brightness-110"
              >
                <TicketPercent className="h-4 w-4" />
                <span>Xem trong Ví Voucher của bạn</span>
              </Link>
              <button
                type="button"
                onClick={handleFinish}
                className="w-full rounded-xl border border-white/15 py-2.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/5"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
