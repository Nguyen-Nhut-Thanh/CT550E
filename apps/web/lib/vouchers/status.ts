import type { VoucherLike } from 'shared';
export function isVoucherExpired(voucher: VoucherLike) {
  return new Date(voucher.expiry_date).getTime() < Date.now();
}

export function isVoucherLocked(voucher: VoucherLike) {
  return isVoucherExpired(voucher) || Number(voucher.used_count || 0) > 0;
}
