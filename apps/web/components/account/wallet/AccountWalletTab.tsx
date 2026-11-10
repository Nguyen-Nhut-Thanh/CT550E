"use client";

import { useState } from "react";
import { Check, Copy, Loader2, RotateCw, Ticket } from "lucide-react";
import Link from "next/link";
import { useAccountResource } from "@/lib/account/useAccountResource";
import { getMembership } from "@/lib/membership/api";
import { useToast } from "@/lib/notifications/useToast";
import { formatVND } from "@/lib/utils/currency";
import type { MembershipVoucher } from "shared";

type WalletFilter = "available" | "used" | "expired";
const tabs: { value: WalletFilter; label: string }[] = [
  { value: "available", label: "Có thể sử dụng" },
  { value: "used", label: "Đã sử dụng" },
  { value: "expired", label: "Hết hạn" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

function cleanVND(val: number | string | null | undefined) {
  return formatVND(val).replace(/\s*đ/, "đ");
}

export function AccountWalletTab() {
  const { data, loading, error, refresh } = useAccountResource(
    "membership",
    getMembership,
  );
  const toast = useToast();
  const [filter, setFilter] = useState<WalletFilter>("available");
  const [copied, setCopied] = useState("");

  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      toast.success(`Đã sao chép mã ưu đãi ${code}`);
      window.setTimeout(() => setCopied((current) => (current === code ? "" : current)), 2000);
    } catch {
      toast.error("Không thể tự động sao chép mã. Vui lòng chọn và sao chép thủ công.");
    }
  }

  const vouchers = data?.vouchers ?? [];
  const visibleVouchers = vouchers.filter((voucher) =>
    filter === "available"
      ? voucher.state === "available" || voucher.state === "upcoming"
      : voucher.state === filter,
  );

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <nav aria-label="Đường dẫn" className="mb-4 flex items-center text-xs sm:text-sm font-semibold">
        <Link href="/account" className="text-slate-500 hover:text-blue-600 transition">
          Tài khoản
        </Link>
        <span className="mx-2 text-slate-300">/</span>
        <span className="text-blue-600">Ví ưu đãi</span>
      </nav>

      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Ví voucher &amp; ưu đãi
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Lưu giữ ưu đãi cho những chuyến đi sắp tới.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/account/membership"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
          >
            Hạng thành viên
          </Link>
          <span aria-hidden="true" className="h-4 w-px bg-slate-200" />
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 transition hover:text-blue-700 disabled:opacity-50"
          >
            <RotateCw size={15} className={loading ? "animate-spin" : ""} />
            <span>Làm mới</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Trạng thái voucher"
        className="mt-6 mb-7 flex gap-7 overflow-x-auto border-b border-slate-200/80"
      >
        {tabs.map(({ value, label }) => {
          const count =
            value === "available"
              ? vouchers.filter((voucher) => voucher.state === "available" || voucher.state === "upcoming").length
              : vouchers.filter((voucher) => voucher.state === value).length;
          const selected = filter === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(value)}
              className={`relative pb-3 text-sm font-semibold transition shrink-0 ${
                selected ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {label} ({count})
              {selected && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative flex min-h-[148px] overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-xs animate-pulse"
            >
              <div className="flex flex-1 items-start gap-3.5">
                <div className="h-11 w-11 rounded-xl bg-slate-100 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                  <div className="h-6 w-32 bg-slate-100 rounded" />
                  <div className="h-3 w-44 bg-slate-100 rounded" />
                  <div className="h-3 w-28 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="w-[140px] shrink-0 pl-5 border-l border-dashed border-slate-200 flex flex-col justify-center space-y-2">
                <div className="h-3 w-16 bg-slate-100 rounded" />
                <div className="h-5 w-24 bg-slate-100 rounded" />
                <div className="h-4 w-20 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-rose-100 bg-white p-8 text-center text-rose-700 shadow-xs">
          <p>{error}</p>
          <button type="button" onClick={refresh} className="mt-3 font-semibold text-blue-600 underline">
            Thử tải lại
          </button>
        </div>
      ) : visibleVouchers.length ? (
        <div className="grid gap-5 md:grid-cols-2">
          {visibleVouchers.map((voucher: MembershipVoucher) => {
            const inactive = voucher.state === "used" || voucher.state === "expired";
            return (
              <article
                key={voucher.voucher_id}
                className={`relative flex min-h-[148px] overflow-hidden rounded-2xl bg-white border border-slate-100/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-md hover:border-blue-100 ${
                  inactive ? "opacity-60" : ""
                }`}
              >
                {/* Left Info Section */}
                <div className="flex flex-1 min-w-0 items-start gap-3.5 p-4 sm:p-5">
                  <div className="mt-0.5 flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-blue-600">
                    <Ticket className="h-5 w-5 sm:h-5.5 sm:w-5.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] sm:text-xs font-semibold tracking-wider text-slate-500 uppercase">
                      {voucher.is_birthday ? "Ưu đãi sinh nhật" : "Ưu đãi thành viên"}
                    </p>
                    <h2 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                      {voucher.discount_type === "percentage"
                        ? `Giảm ${voucher.discount_value}%`
                        : `Giảm ${cleanVND(voucher.discount_value)}`}
                    </h2>
                    <p className="mt-2 text-xs font-medium text-slate-500 truncate">
                      {voucher.discount_type === "percentage" && voucher.max_discount_amount !== null && (
                        <>Tối đa {cleanVND(voucher.max_discount_amount)} · </>
                      )}
                      Đơn từ {cleanVND(voucher.min_order_value)}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">
                      Hạn dùng: {formatDate(voucher.expiry_date)}
                    </p>
                    {voucher.state === "upcoming" && (
                      <p className="mt-1 text-xs font-semibold text-amber-600">
                        Có hiệu lực từ {formatDate(voucher.start_date)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Divider with Punch Hole Notches */}
                <div className="relative flex shrink-0 flex-col items-center w-0">
                  <span
                    aria-hidden="true"
                    className="absolute -top-2.5 left-0 -translate-x-1/2 z-10 h-5 w-5 rounded-full bg-[#f4f8fc] border-b border-slate-200/80 shadow-[inset_0_-1px_2px_rgba(0,0,0,0.03)]"
                  />
                  <div className="h-full w-0 border-r border-dashed border-slate-200" />
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-2.5 left-0 -translate-x-1/2 z-10 h-5 w-5 rounded-full bg-[#f4f8fc] border-t border-slate-200/80 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                  />
                </div>

                {/* Right Stub Section */}
                <div className="flex w-[145px] sm:w-[180px] shrink-0 flex-col justify-center p-4 sm:p-5 pl-4 sm:pl-5">
                  <p className="text-[11px] sm:text-xs font-semibold tracking-wider text-slate-500 uppercase">
                    Mã ưu đãi
                  </p>
                  <code className="mt-1 block truncate text-base sm:text-lg font-black tracking-wide text-slate-900 font-sans">
                    {voucher.code}
                  </code>
                  {!inactive && (
                    <button
                      type="button"
                      onClick={() => void copy(voucher.code)}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
                    >
                      {copied === voucher.code ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                      <span className={copied === voucher.code ? "text-emerald-600 font-bold" : ""}>
                        {copied === voucher.code ? "Đã sao chép" : "Sao chép"}
                      </span>
                    </button>
                  )}
                  {voucher.state === "used" && (
                    <span className="mt-2 text-xs sm:text-sm font-semibold text-slate-400">Đã sử dụng</span>
                  )}
                  {voucher.state === "expired" && (
                    <span className="mt-2 text-xs sm:text-sm font-semibold text-slate-400">Hết hạn</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/70 bg-white px-6 py-14 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-blue-500">
            <Ticket size={28} />
          </div>
          <p className="mt-4 font-bold text-slate-800">
            {filter === "available"
              ? "Bạn chưa có voucher có thể sử dụng"
              : filter === "used"
              ? "Chưa có voucher đã sử dụng"
              : "Chưa có voucher hết hạn"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Khám phá những hành trình mới và nhận thêm ưu đãi cho chuyến đi tiếp theo.
          </p>
          <Link
            href="/tours"
            className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
          >
            Khám phá tour
          </Link>
        </div>
      )}

      <p className="mt-7 text-xs leading-6 text-slate-500">
        Mỗi voucher chỉ sử dụng một lần cho một đơn. Ưu đãi áp dụng trên tiền tour trước phụ thu phòng và dịch vụ bổ sung; mỗi đơn chỉ dùng một voucher.
      </p>
    </div>
  );
}
