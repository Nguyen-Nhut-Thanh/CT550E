"use client";

import { useState } from "react";
import { Check, Copy, Sparkles, Tag, Ticket, ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import { cleanVND } from "@/lib/utils/currency";
import { useToast } from "@/lib/notifications/useToast";
import type { Voucher } from "shared";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

export function HomeVoucherCard({
  voucher,
  onOpenDetail,
}: {
  voucher: Voucher;
  onOpenDetail?: (voucher: Voucher) => void;
}) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      toast.success(`Đã sao chép mã ưu đãi ${voucher.code}`);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Không thể tự động sao chép mã. Vui lòng thử lại.");
    }
  };

  const discountText =
    voucher.discount_type === "percentage"
      ? `Giảm ${voucher.discount_value}%`
      : `Giảm ${cleanVND(voucher.discount_value)}`;

  const maxDiscountText =
    voucher.discount_type === "percentage" && voucher.max_discount_amount !== null
      ? `Tối đa ${cleanVND(voucher.max_discount_amount)}`
      : null;

  const usagePercent =
    voucher.usage_limit > 0
      ? Math.min(100, Math.round((voucher.used_count / voucher.usage_limit) * 100))
      : 0;

  return (
    <article className="group relative flex min-w-[340px] sm:min-w-[380px] max-w-[420px] flex-1 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10">
      {/* Top Event Banner Accent */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600" />

      {/* Left Info Section */}
      <div className="flex flex-1 min-w-0 flex-col justify-between p-5 pt-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
              <Sparkles size={11} className="text-amber-500" />
              {voucher.name || "Ưu đãi du lịch"}
            </span>
          </div>

          <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            {discountText}
          </h3>

          <p className="mt-1 text-xs font-medium text-slate-500 line-clamp-1">
            {maxDiscountText ? `${maxDiscountText} · ` : ""}Đơn từ {cleanVND(voucher.min_order_value)}
          </p>

          {voucher.short_description && (
            <p className="mt-1.5 text-xs text-slate-600 line-clamp-1">
              {voucher.short_description}
            </p>
          )}
        </div>

        {/* Progress & Expiry */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Đã dùng {usagePercent}%</span>
            <span>HSD: {formatDate(voucher.expiry_date)}</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercent >= 80 ? "bg-rose-500" : "bg-blue-600"
              }`}
              style={{ width: `${Math.max(8, usagePercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Divider with Punch Hole Notches */}
      <div className="relative flex shrink-0 flex-col items-center w-0 my-3">
        <span
          aria-hidden="true"
          className="absolute -top-6 left-0 -translate-x-1/2 z-10 h-6 w-6 rounded-full bg-[#f4f8fc] border-b border-slate-200/90 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.04)]"
        />
        <div className="h-full w-0 border-r-2 border-dashed border-slate-200" />
        <span
          aria-hidden="true"
          className="absolute -bottom-6 left-0 -translate-x-1/2 z-10 h-6 w-6 rounded-full bg-[#f4f8fc] border-t border-slate-200/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)]"
        />
      </div>

      {/* Right Stub Section */}
      <div className="flex w-[140px] sm:w-[155px] shrink-0 flex-col justify-between bg-slate-50/60 p-4 sm:p-5 text-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Mã ưu đãi
          </span>
          <code className="mt-1 block truncate text-base font-black tracking-wide text-blue-700 font-sans">
            {voucher.code}
          </code>
        </div>

        <div className="space-y-1.5 mt-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className={`w-full inline-flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 text-xs font-bold transition-all shadow-sm ${
              copied
                ? "bg-emerald-600 text-white"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
            }`}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? "Đã chép" : "Sao chép"}</span>
          </button>

          <Link
            href="/tours"
            className="inline-flex w-full items-center justify-center gap-1 text-[11px] font-bold text-slate-700 hover:text-blue-600 transition py-0.5"
          >
            <span>Dùng ngay</span>
            <ArrowRight size={11} />
          </Link>

          {/* Hàng cuối: Xem chi tiết */}
          <button
            type="button"
            onClick={() => onOpenDetail?.(voucher)}
            className="inline-flex w-full items-center justify-center gap-1 text-[11px] font-medium text-slate-400 hover:text-blue-600 hover:underline transition py-0.5"
          >
            <Info size={11} />
            <span>Xem chi tiết</span>
          </button>
        </div>
      </div>
    </article>
  );
}

