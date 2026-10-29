"use client";

import { useEffect, useState } from "react";
import { Gem, Loader2, TicketPercent } from "lucide-react";
import { getMembership } from "@/lib/membership/api";
import { formatVND } from "@/lib/utils/currency";
import { membershipDiscount, type MembershipSummary } from "shared";

export function BookingMemberVouchers({
  subtotal,
  total,
  disabled,
  onSelect,
}: {
  subtotal: number;
  total: number;
  disabled: boolean;
  onSelect: (code: string) => void;
}) {
  const [data, setData] = useState<MembershipSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getMembership()
      .then((result) => {
        if (active) setData(result);
      })
      .catch(() => {
        if (active) setError("Không thể tải voucher thành viên.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [revision]);
  const options =
    data?.vouchers
      .filter((voucher) => voucher.state === "available")
      .map((voucher) => ({
        ...voucher,
        discount: membershipDiscount(voucher, subtotal),
      }))
      .sort(
        (a, b) =>
          b.discount - a.discount ||
          new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime(),
      ) ?? [];
  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5">
      <h2 className="flex items-center gap-2 font-bold text-blue-900">
        <Gem size={18} />
        {data ? `Ưu đãi hạng ${data.tier.name}` : "Ưu đãi thành viên"}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Dự kiến tích lũy {Math.floor(total / 100_000).toLocaleString("vi-VN")}{" "}
        điểm xét hạng sau khi hoàn thành và thanh toán tour.
      </p>
      {loading ? (
        <p
          role="status"
          className="mt-3 flex items-center gap-2 text-sm text-slate-500"
        >
          <Loader2 size={16} className="animate-spin" />
          Đang tìm ưu đãi...
        </p>
      ) : error ? (
        <p role="alert" className="mt-3 text-sm text-rose-600">
          {error}
          <button
            onClick={() => setRevision((value) => value + 1)}
            className="ml-2 underline"
          >
            Thử lại
          </button>
        </p>
      ) : options.length ? (
        <div className="mt-4 space-y-2">
          {options.map((voucher, index) => (
            <button
              key={voucher.voucher_id}
              type="button"
              disabled={disabled || voucher.discount <= 0}
              onClick={() => onSelect(voucher.code)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-blue-100 bg-white p-3 text-left disabled:opacity-50"
            >
              <span className="flex min-w-0 items-center gap-2">
                <TicketPercent size={18} className="shrink-0 text-blue-600" />
                <span>
                  <span className="text-sm font-bold text-slate-800">
                    {voucher.discount_type === "percentage"
                      ? `Giảm ${voucher.discount_value}%`
                      : `Giảm ${formatVND(voucher.discount_value)}`}
                    {index === 0 && voucher.discount > 0 && (
                      <span className="ml-2 text-xs text-emerald-700">
                        Tiết kiệm nhất
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-xs text-slate-500">
                    Đơn từ {formatVND(voucher.min_order_value)} · Hết hạn{" "}
                    {new Date(voucher.expiry_date).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}
                  </span>
                </span>
              </span>
              <span className="shrink-0 text-sm font-bold text-blue-700">
                {voucher.discount > 0
                  ? `−${formatVND(voucher.discount)}`
                  : "Chưa đủ điều kiện"}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          Bạn chưa có voucher thành viên. Hoàn thành tour để tích lũy lên hạng.
        </p>
      )}
    </section>
  );
}
