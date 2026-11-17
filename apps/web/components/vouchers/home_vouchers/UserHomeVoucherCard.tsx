"use client";

import { useEffect, useState, type MouseEvent } from "react";
import confetti from "canvas-confetti";
import { ArrowRight, Check, Copy, Info, Sparkles } from "lucide-react";
import Link from "next/link";
import { cleanVND } from "@/lib/utils/currency";
import { formatDate } from "@/lib/utils/dateTime";
import { useToast } from "@/lib/notifications/useToast";
import type { Voucher } from "shared";

export function HomeVoucherCard({
  voucher,
  onOpenDetail,
}: {
  voucher: Voucher;
  onOpenDetail?: (voucher: Voucher) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const toast = useToast();

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      toast.success(`Đã sao chép mã ưu đãi ${voucher.code}`);
      confetti({
        particleCount: 30,
        spread: 55,
        origin: {
          x: (buttonRect.left + buttonRect.width / 2) / window.innerWidth,
          y: (buttonRect.top + buttonRect.height / 2) / window.innerHeight,
        },
        colors: ["#2563eb", "#38bdf8", "#f59e0b", "#10b981"],
        scalar: 0.75,
        zIndex: 9999,
      });
    } catch {
      toast.error("Không thể tự động sao chép mã. Vui lòng thử lại.");
    }
  };

  const discountText =
    voucher.discount_type === "percentage"
      ? `Giảm ${voucher.discount_value}%`
      : `Giảm ${cleanVND(voucher.discount_value)}`;

  const maxDiscountText =
    voucher.discount_type === "percentage" &&
    voucher.max_discount_amount !== null
      ? `Tối đa ${cleanVND(voucher.max_discount_amount)}`
      : null;

  const usagePercent =
    voucher.usage_limit > 0
      ? Math.min(
          100,
          Math.round((voucher.used_count / voucher.usage_limit) * 100),
        )
      : 0;

  useEffect(() => {
    const timer = window.setTimeout(() => setProgress(usagePercent), 100);
    return () => window.clearTimeout(timer);
  }, [usagePercent]);

return (
    <article className="voucher-shimmer group relative flex min-w-[340px] max-w-[420px] flex-1 overflow-hidden rounded-2xl border border-blue-100/80 bg-white shadow-[0_8px_25px_-6px_rgba(37,99,235,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_-6px_rgba(37,99,235,0.22)] sm:min-w-[380px]">
      
      {/* HIỆU ỨNG ÁNH KIM CHẠY NGANG (Đã thêm lại vào đây) */}
      <div className="voucher-shimmer-beam" />

      {/* 1. VIỀN TRÁI: Cố định, luôn hiện */}
      <div className="absolute left-0 right-[140px] top-0 z-10 h-1.5 rounded-tl-2xl bg-gradient-to-r from-sky-400 to-blue-600 sm:right-[155px]" />

      {/* 2. VIỀN PHẢI: Cố định ở trên cùng (thẳng hàng viền trái), KHÔNG bị nghiêng theo cuống, CHỈ hiện khi đã xé */}
      {copied && (
        <div className="absolute right-0 top-0 z-10 h-1.5 w-[140px] rounded-tr-2xl bg-gradient-to-r from-blue-600 to-indigo-600 sm:w-[155px]" />
      )}

      {/* Phần thân trái */}
      <div className="flex min-w-0 flex-1 flex-col justify-between p-4 pt-5 sm:p-5 sm:pt-6">
        <div>
          <span className="mb-2.5 inline-flex max-w-full items-center gap-1.5 truncate rounded-md bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold uppercase text-blue-600">
            <Sparkles size={12} className="shrink-0 text-amber-500" />
            {voucher.name || "Ưu đãi du lịch"}
          </span>

          <h3 className="text-xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-blue-600 sm:text-2xl">
            {discountText}
          </h3>
          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
            {maxDiscountText ? `${maxDiscountText} · ` : ""}Đơn từ{" "}
            {cleanVND(voucher.min_order_value)}
          </p>
          {voucher.short_description && (
            <p className="mt-1.5 line-clamp-1 text-xs text-slate-600">
              {voucher.short_description}
            </p>
          )}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px]">
            <span className="font-medium text-slate-500">
              Đã dùng{" "}
              <strong className="text-slate-700">{usagePercent}%</strong>
            </span>
            <span className="shrink-0 text-slate-400">
              HSD: {formatDate(voucher.expiry_date)}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full bg-gradient-to-r transition-[width] duration-1000 ease-out ${
                usagePercent >= 80
                  ? "from-rose-400 to-rose-600"
                  : "from-sky-400 to-blue-600"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Phần cuống vé bên phải */}
      <div
        className={`relative z-20 flex w-[140px] shrink-0 origin-top-left flex-col items-center justify-center rounded-r-2xl border-l-2 border-dashed border-slate-300 p-4 text-center transition-all duration-[450ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] sm:w-[155px] sm:p-5 ${
          copied ? "bg-blue-50/70" : "bg-white"
        }`}
        style={{
          transform: copied ? "rotate(3.5deg) translate(4px, 3px)" : "none",
        }}
      >
        {/* 3. Khuyết TRÊN - Luôn hiện, nằm trong cuống vé để khi xé sẽ tự dịch/nghiêng theo nét đứt */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-2.5 -left-[11px] z-30 h-5 w-5 rounded-full bg-[#eef4ff] shadow-[inset_0_1px_3px_rgba(15,23,42,0.08)]"
        />

        {/* Khuyết DƯỚI - Luôn hiện */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-2.5 -left-[11px] z-30 h-5 w-5 rounded-full bg-[#eef4ff] shadow-[inset_0_1px_3px_rgba(15,23,42,0.08)]"
        />

        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Mã ưu đãi
        </span>
        <code className="mb-2.5 mt-0.5 block max-w-full truncate font-sans text-sm font-extrabold tracking-tight text-blue-600 sm:text-[15px]">
          {voucher.code}
        </code>

        <div className="w-full space-y-1.5">
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full px-2 py-2 text-xs font-bold text-white shadow-sm transition-all active:scale-95 sm:px-3 ${
              copied
                ? "bg-emerald-500 shadow-emerald-200 hover:bg-emerald-600"
                : "bg-blue-600 shadow-blue-200 hover:bg-blue-700"
            }`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span className="whitespace-nowrap">
              {copied ? "Đã sao chép" : "Sao chép"}
            </span>
          </button>

          <Link
            href="/tours"
            className="inline-flex w-full items-center justify-center gap-1 py-0.5 text-xs font-semibold text-slate-700 transition hover:text-blue-600"
          >
            <span>Dùng ngay</span>
            <ArrowRight size={12} />
          </Link>

          <button
            type="button"
            onClick={() => onOpenDetail?.(voucher)}
            className="inline-flex w-full items-center justify-center gap-1 py-0.5 text-[11px] text-slate-400 transition hover:text-slate-600"
          >
            <Info size={12} />
            <span>Xem chi tiết</span>
          </button>
        </div>
      </div>
    </article>
  );
}
