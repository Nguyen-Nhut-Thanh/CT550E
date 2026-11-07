import type { VoucherLike } from 'shared';
export function isVoucherExpired(voucher: VoucherLike) {
  return new Date(voucher.expiry_date).getTime() <= Date.now();
}

export function isVoucherLocked(voucher: VoucherLike) {
  return isVoucherExpired(voucher) || Number(voucher.used_count || 0) > 0;
}

export function getVoucherStatus(voucher: VoucherLike, now = Date.now()): "active" | "locked" | "upcoming" | "expired" | "exhausted" {
  if (new Date(voucher.expiry_date).getTime() <= now) return "expired";
  if (voucher.usage_limit !== undefined && Number(voucher.used_count || 0) >= voucher.usage_limit) return "exhausted";
  if (voucher.status === 0) return "locked";
  if (voucher.start_date && new Date(voucher.start_date).getTime() > now) return "upcoming";
  return "active";
}
