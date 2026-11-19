"use client";

import { formatCompactVND, formatVND } from "@/lib/utils/currency";

export interface PriceDisplayProps {
  amount?: number | string | null;
  originalAmount?: number | string | null;
  discountPercent?: number | null;
  variant?: "full" | "compact" | "perGuest" | "fromPerGuest";
  className?: string;
  priceClassName?: string;
  originalPriceClassName?: string;
  badgeClassName?: string;
  showOriginal?: boolean;
}

/**
 * Component hiển thị giá tiền VND chuẩn hóa:
 * - Đảm bảo tự động làm tròn về 1.000 đ
 * - Đồng bộ hiển thị dạng đầy đủ ('8.160.000 đ') hoặc rút gọn ('8.160K')
 * - Hiển thị giá gốc gạch ngang và huy hiệu % giảm giá nếu có
 */
export function PriceDisplay({
  amount,
  originalAmount,
  discountPercent,
  variant = "full",
  className = "",
  priceClassName = "",
  originalPriceClassName = "",
  badgeClassName = "",
  showOriginal = true,
}: PriceDisplayProps) {
  const numAmount = amount != null && amount !== "" ? Number(amount) : null;
  const numOriginal =
    originalAmount != null && originalAmount !== ""
      ? Number(originalAmount)
      : null;

  const hasDiscount =
    showOriginal &&
    numOriginal != null &&
    numAmount != null &&
    numOriginal > numAmount;

  const formattedAmount =
    variant === "compact"
      ? formatCompactVND(amount)
      : formatVND(amount);

  const perGuestSuffix =
    variant === "perGuest" || variant === "fromPerGuest" ? " / khách" : "";
  const fromPrefix = variant === "fromPerGuest" ? "Từ " : "";

  return (
    <div className={`inline-flex items-baseline flex-wrap gap-2 ${className}`}>
      <span className={`font-black ${priceClassName || "text-[#ef3b2d]"}`}>
        {fromPrefix}
        {formattedAmount}
        {perGuestSuffix && (
          <span className="text-xs font-semibold text-slate-500">
            {perGuestSuffix}
          </span>
        )}
      </span>

      {hasDiscount && (
        <span
          className={`text-xs font-semibold text-slate-400 line-through ${originalPriceClassName}`}
        >
          {formatVND(numOriginal)}
        </span>
      )}

      {hasDiscount && discountPercent != null && discountPercent > 0 && (
        <span
          className={`rounded-md border border-red-100 bg-red-50 px-1.5 py-0.5 text-[10px] font-black text-red-600 ${badgeClassName}`}
        >
          -{discountPercent}%
        </span>
      )}
    </div>
  );
}

