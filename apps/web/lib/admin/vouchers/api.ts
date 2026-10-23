import { requestAdminJson } from "@/lib/http/requestAdminJson";
import type { Voucher, VoucherForm } from "shared";

export function getAdminVouchers() {
  return requestAdminJson<Voucher[]>(
    "/admin/marketing/vouchers",
    { method: "GET" },
    "Không thể tải danh sách voucher.",
  );
}

export function createAdminVoucher(payload: VoucherForm | Record<string, unknown>) {
  return requestAdminJson(
    "/admin/marketing/vouchers",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "Không thể lưu voucher.",
  );
}

export function deleteAdminVoucher(voucherId: number) {
  return requestAdminJson(
    `/admin/marketing/vouchers/${voucherId}`,
    { method: "DELETE" },
    "Không thể xóa voucher.",
  );
}
