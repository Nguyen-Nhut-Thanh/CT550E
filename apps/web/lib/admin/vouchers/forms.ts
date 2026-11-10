import { formatLocalDate, formatLocalDateTime, formatLocalTime } from "@/lib/utils/dateTime";
import { getVoucherStatus } from "@/lib/vouchers/status";
import type { Voucher, VoucherForm, VoucherStatusFilter } from 'shared';

export function createDefaultVoucherForm(now = new Date()): VoucherForm {
  return {
    customer_types: ["all"],
    code: "",
    name: "",
    short_description: "",
    image_url: "",
    discount_type: "percentage",
    discount_value: 0,
    min_order_value: 0,
    max_discount_amount: null,
    usage_limit: 100,
    usage_limit_per_user: 1,
    applicable_scope: "all",
    applicable_tour_types: [],
    applicable_tour_ids: [],
    start_date: formatLocalDateTime(new Date(now.getTime() + 60 * 60 * 1000)),
    duration_hours: 72,
    status: 1,
  };
}

export function buildVoucherForm(voucher: Voucher): VoucherForm {
  return {
    customer_types: voucher.eligible_tiers?.length ? [...voucher.eligible_tiers] : ["all"],
    code: voucher.code,
    name: voucher.name || "",
    short_description: voucher.short_description || "",
    image_url: voucher.image_url || "",
    discount_type: voucher.discount_type,
    discount_value: Number(voucher.discount_value),
    min_order_value: Number(voucher.min_order_value),
    max_discount_amount: voucher.max_discount_amount
      ? Number(voucher.max_discount_amount)
      : null,
    usage_limit: voucher.usage_limit,
    usage_limit_per_user: voucher.usage_limit_per_user ?? 1,
    applicable_scope: voucher.applicable_scope || "all",
    applicable_tour_types: voucher.applicable_tour_types || [],
    applicable_tour_ids: voucher.applicable_tour_ids || [],
    start_date: formatLocalDateTime(new Date(voucher.start_date)),
    duration_hours: getVoucherDurationHours(voucher),
    status: voucher.status,
  };
}

export function getVoucherDurationHours(voucher: Voucher) {
  const start = new Date(voucher.start_date);
  const end = new Date(voucher.expiry_date);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
}

export function filterVouchers(
  vouchers: Voucher[],
  searchTerm: string,
  statusFilter: VoucherStatusFilter,
) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return vouchers.filter((voucher) => {
    const matchesSearch = voucher.code.toLowerCase().includes(normalizedSearch);
    const matchesStatus = statusFilter === "all" || getVoucherStatus(voucher) === statusFilter;

    return matchesSearch && matchesStatus;
  });
}

export function buildVoucherPayload(form: VoucherForm) {
  if (!form.customer_types.length) throw new Error("Vui lòng chọn ít nhất một đối tượng áp dụng.");
  const startDate = new Date(form.start_date);
  const expiryDate = new Date(
    startDate.getTime() + form.duration_hours * 60 * 60 * 1000,
  );

  return {
    code: form.code,
    name: form.name?.trim() || undefined,
    short_description: form.short_description?.trim() || undefined,
    image_url: form.image_url?.trim() || undefined,
    discount_type: form.discount_type,
    discount_value: form.discount_value,
    min_order_value: form.min_order_value,
    max_discount_amount: form.discount_type === "percentage" ? form.max_discount_amount : null,
    status: form.status,
    eligible_tiers: form.customer_types.includes("all") ? [] : form.customer_types,
    start_date: startDate.toISOString(),
    usage_limit: Number(form.usage_limit),
    usage_limit_per_user: Number(form.usage_limit_per_user || 1),
    applicable_scope: form.applicable_scope || "all",
    applicable_tour_types: form.applicable_scope === "tour_type" ? form.applicable_tour_types : [],
    applicable_tour_ids: form.applicable_scope === "specific_tours" ? form.applicable_tour_ids : [],
    expiry_date: expiryDate.toISOString(),
  };
}

export function getVoucherDateParts(startDate: string, now = new Date()) {
  return {
    minDate: formatLocalDate(now),
    minTime: formatLocalTime(now),
    startDateValue: startDate ? startDate.slice(0, 10) : "",
    startTimeValue: startDate ? startDate.slice(11, 16) : "",
  };
}
