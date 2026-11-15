"use client";

import { useId, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Compass,
  Copy,
  Globe,
  Info,
  Plane,
  ShoppingCart,
  Sparkles,
  Tag,
  Ticket,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { Dialog } from "@/components/common/overlays/Dialog";
import { ImageWithFallback } from "@/components/common/media/ImageWithFallback";
import { cleanVND } from "@/lib/utils/currency";
import { formatDateTime } from "@/lib/utils/dateTime";
import { useToast } from "@/lib/notifications/useToast";
import { voucherAudienceLabel, type Voucher } from "shared";

export function HomeVoucherDetailModal({
  voucher,
  onClose,
}: {
  voucher: Voucher;
  onClose: () => void;
}) {
  const headingId = useId();
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

  const usagePercent =
    voucher.usage_limit > 0
      ? Math.min(100, Math.round((voucher.used_count / voucher.usage_limit) * 100))
      : 0;

  const remainingPercent = Math.max(0, 100 - usagePercent);
  const remainingCount = Math.max(0, voucher.usage_limit - voucher.used_count);

  let scopeLabel = "Tất cả các tour trên JourniTrip";
  let tourTargetLink = "/tours";
  if (voucher.applicable_scope === "tour_type" && voucher.applicable_tour_types?.length) {
    scopeLabel = `Các loại tour: ${voucher.applicable_tour_types.join(", ")}`;
  } else if (voucher.applicable_scope === "specific_tours" && voucher.applicable_tour_ids?.length) {
    scopeLabel = `Áp dụng cho ${voucher.applicable_tour_ids.length} tour được chỉ định`;
  }

  const audienceText = voucherAudienceLabel(voucher.eligible_tiers);
  const bgImage = voucher.image_url || "/images/about/our-story-ha-long-bay.png";

  return (
    <Dialog labelledBy={headingId} onClose={onClose}>
      <section className="my-auto flex max-h-[calc(100dvh-2rem)] sm:max-h-[min(88dvh,580px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-2xl">
        {/* Modal Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3 sm:px-6 sm:py-3.5 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-xs">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h2 id={headingId} className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Chi tiết Mã Ưu Đãi
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Xem đầy đủ điều kiện và phạm vi áp dụng của voucher.
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Đóng chi tiết voucher"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Modal Body */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-3.5 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-stretch">
            {/* LEFT COLUMN: Poster Card + How To Use */}
            <div className="md:col-span-5 flex flex-col gap-2.5 sm:gap-3">
              {/* Poster Card */}
              <div className="relative min-h-[170px] sm:min-h-[185px] overflow-hidden rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between shadow-md">
                {/* Background image & gradient overlay */}
                <ImageWithFallback
                  src={bgImage}
                  alt={voucher.name || "Voucher"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-blue-900/40" />

                {/* Top Info */}
                <div className="relative z-10 space-y-1 sm:space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-600/90 px-2.5 py-0.5 text-[10px] sm:text-[10.5px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-xs">
                    <Sparkles size={11} className="text-amber-300" />
                    Ưu đãi du lịch
                  </span>

                  {/* Tên voucher hiển thị nổi bật */}
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white drop-shadow-md line-clamp-2 pt-0.5 leading-snug">
                    {voucher.name || "Voucher Tour Du Lịch"}
                  </h3>

                  {/* Mức giảm to rõ */}
                  <div className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white drop-shadow-lg pt-0.5">
                    {discountText}
                  </div>

                  {/* Pill điều kiện tối thiểu */}
                  <div className="inline-block rounded-full bg-white/95 px-2.5 sm:px-3 py-0.5 text-[10.5px] sm:text-[11px] font-bold text-slate-800 shadow-sm backdrop-blur-xs mt-0.5 sm:mt-1">
                    Đơn tối thiểu từ {cleanVND(voucher.min_order_value)}
                  </div>
                </div>

                {/* Bottom Code Box */}
                <div className="relative z-10 rounded-xl sm:rounded-2xl border border-white/80 bg-white/95 p-2 sm:p-2.5 px-3 sm:px-3.5 shadow-xl backdrop-blur-md mt-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-[8.5px] sm:text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Mã voucher
                      </span>
                      <code className="text-xs sm:text-sm md:text-base font-black font-mono tracking-wide text-blue-700">
                        {voucher.code}
                      </code>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1 rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition"
                      title="Sao chép mã"
                    >
                      {copied ? (
                        <Check size={16} className="text-emerald-600" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* How to use Card */}
              <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-[#f4f9fd] p-3 sm:p-3.5 flex flex-col justify-between">
                <div>
                  <h4 className="flex items-center gap-2 text-xs sm:text-[13px] font-bold text-slate-900 mb-1.5 sm:mb-2">
                    <span className="text-blue-500">💡</span> Cách sử dụng mã giảm giá:
                  </h4>
                  <ol className="space-y-1.5 text-[11.5px] sm:text-xs text-slate-700 leading-relaxed font-medium">
                    <li className="flex items-start gap-2">
                      <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white mt-0.5">
                        1
                      </span>
                      <span>
                        Nhấn <strong>Sao chép mã</strong> ở trên.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white mt-0.5">
                        2
                      </span>
                      <span>
                        Chọn tour du lịch bạn muốn đặt và chuyển đến bước thanh toán.
                      </span>
                    </li>
                  </ol>
                </div>

                {/* Landmark watermark */}
                <div className="pointer-events-none absolute -bottom-2 -right-2 opacity-15">
                  <Compass size={50} className="text-blue-600" />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Grid Cards */}
            <div className="md:col-span-7 flex flex-col gap-2 sm:gap-2.5 justify-between">
              {/* Row 1: Giá trị giảm & Đơn hàng tối thiểu */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                <div className="rounded-2xl border border-slate-100 bg-[#fbfdff] p-2.5 sm:p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Tag size={13} className="text-blue-600" />
                    <span>Giá trị giảm</span>
                  </div>
                  <p className="mt-1 text-sm sm:text-base font-black text-slate-900">
                    {discountText}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#fbfdff] p-2.5 sm:p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <ShoppingCart size={13} className="text-blue-600" />
                    <span>Đơn hàng tối thiểu</span>
                  </div>
                  <p className="mt-1 text-sm sm:text-base font-black text-slate-900">
                    {cleanVND(voucher.min_order_value)}
                  </p>
                </div>
              </div>

              {/* Row 2: Hiệu lực từ & Hạn sử dụng đến */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                <div className="rounded-2xl border border-slate-100 bg-[#fbfdff] p-2.5 sm:p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Calendar size={13} className="text-blue-600" />
                    <span>Hiệu lực từ</span>
                  </div>
                  <p className="mt-1 text-[11.5px] sm:text-xs font-bold text-slate-800">
                    {formatDateTime(voucher.start_date)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#fbfdff] p-2.5 sm:p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Clock size={13} className="text-blue-600" />
                    <span>Hạn sử dụng đến</span>
                  </div>
                  <p className="mt-1 text-[11.5px] sm:text-xs font-bold text-rose-600">
                    {formatDateTime(voucher.expiry_date)}
                  </p>
                </div>
              </div>

              {/* Row 3: Số lượt còn lại with Circular Progress Ring */}
              <div className="rounded-2xl border border-slate-100 bg-[#fbfdff] p-2.5 sm:p-3 px-3.5 flex items-center gap-3.5 shadow-2xs">
                {/* SVG Donut Ring */}
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                  <svg className="h-12 w-12 -rotate-90 transform" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-600 transition-all duration-500"
                      strokeDasharray={`${remainingPercent}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-black text-slate-900 leading-tight">
                      {remainingPercent}%
                    </span>
                    <span className="text-[8px] font-semibold text-slate-500 leading-tight">
                      Còn lại
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
                    Số lượt còn lại
                  </span>
                  <p className="text-sm sm:text-base font-black text-slate-900 mt-0.5">
                    {remainingCount} / {voucher.usage_limit} lượt
                  </p>
                  <p className="text-[10.5px] text-slate-500">
                    (Đã dùng {usagePercent}%)
                  </p>
                </div>
              </div>

              {/* Row 4: Giới hạn mỗi khách hàng & Đối tượng áp dụng */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                <div className="rounded-2xl border border-slate-100 bg-[#fbfdff] p-2.5 sm:p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Users size={13} className="text-blue-600" />
                    <span>Giới hạn mỗi khách hàng</span>
                  </div>
                  <p className="mt-1 text-[11.5px] sm:text-xs font-bold text-slate-900">
                    {voucher.usage_limit_per_user || 1} lần / tài khoản
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-[#fbfdff] p-2.5 sm:p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                    <Globe size={13} className="text-blue-600" />
                    <span>Đối tượng áp dụng</span>
                  </div>
                  <p className="mt-1 text-[11.5px] sm:text-xs font-bold text-blue-700">
                    {audienceText}
                  </p>
                </div>
              </div>

              {/* Row 5: Phạm vi tour */}
              <div className="rounded-2xl border border-slate-100 bg-[#fbfdff] p-2.5 sm:p-3 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Plane size={13} className="text-blue-600" />
                  <span>Phạm vi tour</span>
                </div>
                <p className="mt-1 text-[11.5px] sm:text-xs font-bold text-slate-800">
                  {scopeLabel}
                </p>
              </div>

              {/* Row 6: Lưu ý quan trọng */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-2.5 sm:p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Info size={13} className="text-blue-600" />
                  <span>Lưu ý quan trọng</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                  Voucher chỉ áp dụng cho các tour thuộc phạm vi và điều kiện nêu trên.
                  {voucher.discount_type === "percentage" && voucher.max_discount_amount !== null && (
                    <> Mức giảm tối đa là {cleanVND(voucher.max_discount_amount)} cho mỗi đơn hàng.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-2.5 sm:px-6 sm:py-3 bg-slate-50/40">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs sm:text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Đóng
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              <span>{copied ? "Đã sao chép mã" : "Sao chép mã"}</span>
            </button>

            <Link
              href={tourTargetLink}
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-sm shadow-blue-500/20 transition hover:bg-blue-700"
            >
              <Plane size={15} />
              <span>Xem tour &amp; Dùng ngay</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </footer>
      </section>
    </Dialog>
  );
}
