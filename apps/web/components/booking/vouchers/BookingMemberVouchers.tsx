"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Gem, Loader2, TicketPercent, X } from "lucide-react";
import { Dialog } from "@/components/common/overlays/Dialog";
import { getMembership } from "@/lib/membership/api";
import { formatVND } from "@/lib/utils/currency";
import { membershipDiscount, type MembershipSummary } from "shared";

export function BookingMemberVouchers({
  subtotal,
  total,
  disabled,
  selectedCode,
  selectionError,
  onSelect,
  onClose,
}: {
  subtotal: number;
  total: number;
  disabled: boolean;
  selectedCode: string | null;
  selectionError: string | null;
  onSelect: (code: string) => Promise<boolean>;
  onClose: () => void;
}) {
  const headingId = useId();
  const [data, setData] = useState<MembershipSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [applyError, setApplyError] = useState("");
  const selectionInFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    getMembership().then(result => { if (active) setData(result); })
      .catch(() => { if (active) setError("Không thể tải mã giảm giá hiện có."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);

  const options = data?.vouchers.filter(voucher => voucher.state === "available")
    .map(voucher => ({ ...voucher, discount: membershipDiscount(voucher, subtotal) }))
    .sort((a, b) => b.discount - a.discount || new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()) ?? [];

  const select = async (code: string) => {
    if (disabled || selectionInFlight.current) return;
    if (selectedCode?.trim().toUpperCase() === code.trim().toUpperCase()) { onClose(); return; }
    selectionInFlight.current = true;
    setSelecting(code); setApplyError("");
    try {
      // Only close after server validation; highlighting follows the applied code from checkout.
      if (await onSelect(code) && mounted.current) onClose();
    } catch {
      if (mounted.current) setApplyError("Không thể áp dụng mã giảm giá. Vui lòng thử lại.");
    } finally {
      selectionInFlight.current = false;
      if (mounted.current) setSelecting(null);
    }
  };

  return <Dialog labelledBy={headingId} onClose={onClose}>
    <section className="flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 p-5 sm:px-6">
        <div><h2 id={headingId} className="flex items-center gap-2 text-lg font-bold text-slate-900"><TicketPercent className="h-5 w-5 text-blue-600" />Chọn mã giảm giá</h2><p className="mt-1 text-sm text-slate-500">Chọn một mã để áp dụng cho đơn đặt tour này.</p></div>
        <button type="button" aria-label="Đóng danh sách mã giảm giá" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-500"><X className="h-5 w-5" /></button>
      </header>
      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-5 sm:p-6">
        <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
          <p className="flex items-center gap-2 text-sm font-bold text-blue-900"><Gem size={17} />{data ? `Ưu đãi hạng ${data.tier.name}` : "Ưu đãi thành viên"}</p>
          <p className="mt-1.5 text-xs leading-5 text-slate-600">Dự kiến tích lũy {Math.floor(total * Math.round((data?.tier.pointMultiplier ?? 1) * 10) / 1_000_000).toLocaleString("vi-VN")} điểm thưởng sau khi hoàn thành và thanh toán tour{data ? ` (hệ số ×${data.tier.pointMultiplier.toLocaleString("vi-VN")})` : ''}.</p>
        </div>
        {loading ? <p role="status" className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500"><Loader2 size={18} className="animate-spin" />Đang tìm mã giảm giá...</p>
          : error ? <div role="alert" className="py-6 text-center text-sm text-rose-600"><p>{error}</p><button type="button" onClick={() => setRevision(value => value + 1)} className="mt-2 font-semibold underline">Thử lại</button></div>
          : options.length ? <div className="space-y-2.5">{options.map((voucher, index) => {
            const active = selectedCode?.trim().toUpperCase() === voucher.code.trim().toUpperCase();
            const busy = selecting === voucher.code;
            return <button key={voucher.voucher_id} type="button" aria-pressed={active} disabled={disabled || selecting !== null || voucher.discount <= 0} onClick={() => void select(voucher.code)} className={`flex w-full items-start justify-between gap-3 rounded-xl border-2 p-3.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-default disabled:opacity-60 ${active ? "border-blue-500 bg-blue-50" : "border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30"}`}>
              <span className="flex min-w-0 items-start gap-2.5">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white"}`}>{active && <Check size={13} strokeWidth={3} />}</span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1"><span className="text-sm font-bold text-slate-800">{voucher.discount_type === "percentage" ? `Giảm ${voucher.discount_value}%` : `Giảm ${formatVND(voucher.discount_value)}`}</span>{active ? <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">Đang áp dụng</span> : index === 0 && voucher.discount > 0 && <span className="text-[10px] font-semibold text-emerald-700">Tiết kiệm nhất</span>}</span>
                  <span className="mt-1 block break-all text-xs font-semibold tracking-wide text-blue-700">{voucher.code}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">Đơn từ {formatVND(voucher.min_order_value)} · Hết hạn {new Date(voucher.expiry_date).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</span>
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 pt-0.5 text-xs font-bold text-blue-700 sm:text-sm">{busy && <Loader2 size={15} className="animate-spin" />}{voucher.discount > 0 ? `−${formatVND(voucher.discount)}` : "Chưa đủ điều kiện"}</span>
            </button>;
          })}</div>
          : <p className="py-6 text-center text-sm leading-6 text-slate-500">Bạn chưa có mã giảm giá khả dụng.</p>}
      </div>
      <footer className="shrink-0 border-t border-slate-100 px-5 py-4 sm:px-6">
        {(selectionError || applyError) && <p role="alert" className="mb-2 text-sm leading-6 text-rose-600">{selectionError || applyError}</p>}
        <p aria-live="polite" className="text-xs leading-5 text-slate-500">{selecting ? "Đang kiểm tra và áp dụng mã giảm giá..." : selectedCode ? <>Đang áp dụng mã <strong className="text-blue-700">{selectedCode}</strong>.</> : "Mỗi đơn đặt tour áp dụng một mã giảm giá."}</p>
      </footer>
    </section>
  </Dialog>;
}
