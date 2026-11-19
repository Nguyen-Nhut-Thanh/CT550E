"use client";

import InlineNotice from "@/components/common/dialogs_and_feedback/media/InlineNotice";
import { PAYMENT_METHODS } from "@/lib/booking/client/paymentMethods";
import { formatVND } from "@/lib/utils/currency";
import {
  Award,
  CalendarDays,
  ChevronRight,
  Crown,
  Gem,
  ShieldCheck,
  Sparkles,
  TicketPercent,
} from "lucide-react";
import { useId } from "react";
import type { BookingVoucherAndPaymentProps, MembershipTierId } from "shared";

const TIER_VISUALS: Record<
  MembershipTierId,
  {
    badgeClass: string;
    bgClass: string;
    borderClass: string;
    iconBgClass: string;
    Icon: typeof Gem;
    label: string;
  }
> = {
  diamond: {
    badgeClass: "bg-emerald-600 text-white",
    bgClass: "bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-cyan-50/70",
    borderClass: "border-emerald-200",
    iconBgClass: "bg-emerald-100 text-emerald-700",
    Icon: Gem,
    label: "Hội viên Kim Cương",
  },
  platinum: {
    badgeClass: "bg-cyan-600 text-white",
    bgClass: "bg-gradient-to-br from-cyan-50/90 via-sky-50/50 to-blue-50/70",
    borderClass: "border-cyan-200",
    iconBgClass: "bg-cyan-100 text-cyan-700",
    Icon: Award,
    label: "Hội viên Bạch Kim",
  },
  gold: {
    badgeClass: "bg-amber-600 text-white",
    bgClass: "bg-gradient-to-br from-amber-50/90 via-yellow-50/50 to-orange-50/70",
    borderClass: "border-amber-200",
    iconBgClass: "bg-amber-100 text-amber-700",
    Icon: Crown,
    label: "Hội viên Vàng",
  },
  silver: {
    badgeClass: "bg-slate-700 text-white",
    bgClass: "bg-gradient-to-br from-slate-100/90 via-slate-50 to-gray-100/80",
    borderClass: "border-slate-300",
    iconBgClass: "bg-slate-200 text-slate-700",
    Icon: ShieldCheck,
    label: "Hội viên Bạc",
  },
  bronze: {
    badgeClass: "bg-amber-800 text-white",
    bgClass: "bg-gradient-to-br from-amber-50/60 to-orange-50/60",
    borderClass: "border-amber-200",
    iconBgClass: "bg-amber-100 text-amber-800",
    Icon: Sparkles,
    label: "Hội viên Đồng",
  },
};

export function BookingVoucherAndPayment({
  voucherCode,
  voucherLoading,
  voucherResult,
  voucherError,
  paymentMethod,
  onVoucherCodeChange,
  onApplyVoucher,
  onOpenAvailableVouchers,
  availableVouchersOpen = false,
  onPaymentMethodChange,
  memberTier,
  pricing,
}: BookingVoucherAndPaymentProps) {
  const voucherInputId = useId();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          Mã giảm giá và thanh toán
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Kiểm tra voucher trước khi chuyển sang bước thanh toán.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor={voucherInputId} className="flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-800">
              <TicketPercent className="h-4 w-4 text-blue-600" />
              Mã ưu đãi
            </label>
            {onOpenAvailableVouchers && <button type="button" aria-haspopup="dialog" aria-expanded={availableVouchersOpen} onClick={onOpenAvailableVouchers} className="flex items-center justify-end gap-1 text-right text-xs font-semibold text-blue-600 transition hover:text-blue-700 hover:underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-blue-500">Chọn mã giảm giá đang có<ChevronRight className="h-3.5 w-3.5 shrink-0" /></button>}
          </div>
          <div className="flex gap-3">
            <input
              id={voucherInputId}
              value={voucherCode}
              onChange={(event) => onVoucherCodeChange(event.target.value)}
              placeholder="Nhập mã voucher"
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
            />
            <button
              type="button"
              onClick={onApplyVoucher}
              disabled={voucherLoading}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {voucherLoading ? "Đang kiểm tra" : "Áp dụng"}
            </button>
          </div>

          {voucherError && (
            <InlineNotice tone="error">{voucherError}</InlineNotice>
          )}
          {voucherResult && (
            <InlineNotice tone="success">
              Áp dụng thành công mã <strong>{voucherResult.code}</strong>, giảm{" "}
              {formatVND(voucherResult.discountAmount)}.
            </InlineNotice>
          )}

          {memberTier ? (() => {
            const visual = TIER_VISUALS[memberTier.id] ?? TIER_VISUALS.bronze;
            const TierIcon = visual.Icon;
            const hasTourDiscount = memberTier.tourDiscountPercent > 0;
            const hasServiceDiscount = memberTier.serviceDiscountPercent > 0;
            const tourDiscountAmount = pricing?.tourDiscount ?? 0;
            const serviceDiscountAmount = pricing?.serviceDiscount ?? 0;

            return (
              <div
                className={`rounded-xl border p-3.5 shadow-2xs transition-all ${visual.borderClass} ${visual.bgClass}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-2xs ${visual.iconBgClass}`}
                  >
                    <TierIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${visual.badgeClass}`}
                      >
                        <TierIcon className="h-3 w-3" />
                        {visual.label}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600">
                        Tích lũy ×{memberTier.pointMultiplier} điểm thưởng
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      Do quý khách là thành viên{" "}
                      <strong className="text-slate-900 font-semibold">
                        {memberTier.name}
                      </strong>
                      , đơn hàng này được hưởng chính sách ưu đãi đặc quyền:
                    </p>

                    <div className="space-y-1 text-xs">
                      {hasTourDiscount && (
                        <div className="flex items-center justify-between gap-2 text-slate-800">
                          <span className="flex items-center gap-1.5">
                            <span className="font-bold text-emerald-600">✓</span>
                            Giảm <strong>{memberTier.tourDiscountPercent}%</strong> giá vé tour:
                          </span>
                          <span className="font-bold text-emerald-700">
                            {tourDiscountAmount > 0
                              ? `-${formatVND(tourDiscountAmount)}`
                              : `-${memberTier.tourDiscountPercent}%`}
                          </span>
                        </div>
                      )}

                      {hasServiceDiscount && (
                        <div className="flex items-center justify-between gap-2 text-slate-800">
                          <span className="flex items-center gap-1.5">
                            <span className="font-bold text-emerald-600">✓</span>
                            Giảm <strong>{memberTier.serviceDiscountPercent}%</strong> dịch vụ đi kèm:
                          </span>
                          <span className="font-bold text-emerald-700">
                            {serviceDiscountAmount > 0
                              ? `-${formatVND(serviceDiscountAmount)}`
                              : `-${memberTier.serviceDiscountPercent}%`}
                          </span>
                        </div>
                      )}

                      {!hasTourDiscount && !hasServiceDiscount && (
                        <div className="text-[11px] text-slate-600">
                          Tích lũy chi tiêu các chuyến đi để thăng hạng Bạc (hưởng ngay giảm 2% giá tour &amp; 5% dịch vụ).
                        </div>
                      )}
                    </div>

                    {voucherResult && (
                      <p className="pt-0.5 text-[11px] italic text-slate-500">
                        * Ưu đãi thành viên được tự động áp dụng song song cùng mã ưu đãi <strong>{voucherResult.code}</strong>.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-500">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
              <span>
                Đăng nhập tài khoản để nhận đặc quyền hội viên giảm giá tour lên đến <strong>7%</strong> và tích điểm thưởng.
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            Phương thức thanh toán
          </label>
          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <label
                  key={method.id}
                  className={`flex items-start gap-3 rounded-xl border p-4 transition ${paymentMethod === method.id
                      ? "border-blue-300 bg-blue-50/70"
                      : "border-slate-200 bg-slate-50"
                    } ${method.enabled
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-60"
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="mt-1"
                    checked={paymentMethod === method.id}
                    onChange={() =>
                      method.enabled && onPaymentMethodChange(method.id)
                    }
                    disabled={!method.enabled}
                  />
                  <Icon className="mt-0.5 h-5 w-5 text-blue-700" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {method.label}
                      </p>
                      {method.badge ? (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          {method.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {method.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
