"use client";

import { useState } from "react";
import { Check, Copy, Loader2, TicketPercent } from "lucide-react";
import Link from "next/link";
import { useAccountResource } from "@/lib/account/useAccountResource";
import { getMembership } from "@/lib/membership/api";
import { formatVND } from "@/lib/utils/currency";
import type { MembershipVoucher } from "shared";

export function AccountWalletTab() {
  const { data, loading, error, refresh } = useAccountResource(
    "membership",
    getMembership,
  );
  const [filter, setFilter] = useState<MembershipVoucher["state"]>("available");
  const [copied, setCopied] = useState("");
  const [copyError, setCopyError] = useState("");
  async function copy(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setCopyError("");
    } catch {
      setCopyError(
        "Không thể sao chép tự động. Bạn có thể chọn và sao chép mã bên dưới.",
      );
    }
  }
  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-wrap justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Ví voucher & ưu đãi
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Ưu đãi dành riêng cho những hành trình tiếp theo của bạn.
          </p>
        </div>
        <Link
          href="/account/membership"
          className="self-start rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
        >
          Xem hạng thành viên
        </Link>
      </header>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Lọc voucher"
      >
        {(
          [
            ["available", "Có thể dùng"],
            ["used", "Đã dùng"],
            ["expired", "Hết hạn"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === value ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-600"}`}
          >
            {label} (
            {data?.vouchers.filter((voucher) => voucher.state === value)
              .length ?? 0}
            )
          </button>
        ))}
      </div>
      {copyError && (
        <p role="alert" className="text-sm text-rose-600">
          {copyError}
        </p>
      )}
      {loading ? (
        <p role="status" className="flex items-center gap-2 p-6 text-slate-500">
          <Loader2 className="animate-spin" size={18} />
          Đang tải voucher...
        </p>
      ) : error ? (
        <p role="alert" className="text-rose-600">
          {error}
          <button onClick={refresh} className="ml-3 underline">
            Thử lại
          </button>
        </p>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {data?.vouchers
            .filter((voucher) => voucher.state === filter)
            .map((voucher) => (
              <article
                key={voucher.voucher_id}
                className={`overflow-hidden rounded-2xl border border-slate-200 bg-white ${filter !== "available" ? "opacity-70" : ""}`}
              >
                <div className="flex items-start gap-4 p-5">
                  <div className="rounded-2xl bg-sky-50 p-3 text-blue-600">
                    <TicketPercent size={28} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                      Ưu đãi thành viên
                    </p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                      {voucher.discount_type === "percentage"
                        ? `Giảm ${voucher.discount_value}%`
                        : `Giảm ${formatVND(voucher.discount_value)}`}
                    </h2>
                    {voucher.discount_type === "percentage" &&
                      voucher.max_discount_amount !== null && (
                        <p className="mt-1 text-sm text-slate-600">
                          Tối đa {formatVND(voucher.max_discount_amount)}
                        </p>
                      )}
                    <p className="mt-2 text-sm text-slate-500">
                      Đơn từ {formatVND(voucher.min_order_value)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Hạn dùng:{" "}
                      {new Date(voucher.expiry_date).toLocaleString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-slate-200 bg-slate-200/30 px-5 py-4">
                  <code className="break-all text-xs font-bold text-slate-700">
                    {voucher.code}
                  </code>
                  {filter === "available" && (
                    <button
                      onClick={() => void copy(voucher.code)}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600"
                    >
                      {copied === voucher.code ? (
                        <Check size={15} />
                      ) : (
                        <Copy size={15} />
                      )}
                      {copied === voucher.code ? "Đã sao chép" : "Sao chép"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          {!data?.vouchers.some((voucher) => voucher.state === filter) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center xl:col-span-2">
              <TicketPercent className="mx-auto mb-3 text-sky-400" size={40} />
              <p className="font-bold text-slate-700">
                {filter === "available"
                  ? "Bạn chưa có voucher có thể sử dụng"
                  : filter === "used"
                    ? "Chưa có voucher đã dùng"
                    : "Chưa có voucher hết hạn"}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Hoàn thành tour để tích lũy lên hạng và nhận ưu đãi mới.
              </p>
              <Link
                href="/tours"
                className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white"
              >
                Khám phá tour
              </Link>
            </div>
          )}
        </div>
      )}
      <p className="text-xs leading-6 text-slate-500">
        Voucher dành riêng cho tài khoản của bạn, dùng một lần cho một đơn. Áp
        dụng trên tiền tour trước phụ thu phòng và dịch vụ bổ sung. Mỗi đơn dùng
        một voucher; voucher được giữ khi tạo đơn thành công.
      </p>
    </div>
  );
}
