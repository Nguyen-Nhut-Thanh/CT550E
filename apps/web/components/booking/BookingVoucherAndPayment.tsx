import {
  CalendarDays,
  CreditCard,
  ShieldCheck,
  TicketPercent,
  Wallet,
} from "lucide-react";
import InlineNotice from "@/components/common/InlineNotice";
import { formatVND } from "@/lib/client/utils/utils";
import type { PaymentMethod, VoucherValidationResult } from "@/lib/client/utils/booking";

const PAYMENT_METHODS: Array<{
  id: PaymentMethod;
  label: string;
  description: string;
  icon: typeof CreditCard;
  enabled: boolean;
  badge?: string;
}> = [
  {
    id: "vnpay",
    label: "VNPay",
    description: "Thanh toán online qua ATM, QR ngân hàng, thẻ nội địa.",
    icon: CreditCard,
    enabled: true,
  },
  {
    id: "momo",
    label: "MoMo",
    description: "Thanh toán nhanh trên điện thoại, phù hợp mobile-first.",
    icon: Wallet,
    enabled: false,
    badge: "Sắp có",
  },
  {
    id: "bank_transfer",
    label: "Chuyển khoản",
    description: "Giữ chỗ trước, chuyển khoản xác nhận sau.",
    icon: ShieldCheck,
    enabled: false,
    badge: "Sắp có",
  },
];

interface BookingVoucherAndPaymentProps {
  voucherCode: string;
  voucherLoading: boolean;
  voucherResult: VoucherValidationResult | null;
  voucherError: string | null;
  paymentMethod: PaymentMethod;
  onVoucherCodeChange: (code: string) => void;
  onApplyVoucher: () => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
}

export function BookingVoucherAndPayment({
  voucherCode,
  voucherLoading,
  voucherResult,
  voucherError,
  paymentMethod,
  onVoucherCodeChange,
  onApplyVoucher,
  onPaymentMethodChange,
}: BookingVoucherAndPaymentProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">
          Mã giảm giá và thanh toán
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Kiểm tra voucher trước khi chuyển sang bước thanh toán.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <TicketPercent className="h-4 w-4 text-sky-600" />
            Mã ưu đãi
          </label>
          <div className="flex gap-3">
            <input
              value={voucherCode}
              onChange={(event) => onVoucherCodeChange(event.target.value)}
              placeholder="Nhập mã voucher"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-sky-400 focus:bg-white"
            />
            <button
              type="button"
              onClick={onApplyVoucher}
              disabled={voucherLoading}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {voucherLoading ? "Đang kiểm tra" : "Áp dụng"}
            </button>
          </div>

          {voucherError && (
            <InlineNotice tone="error">{voucherError}</InlineNotice>
          )}
          {voucherResult && (
            <InlineNotice tone="success">
              Áp dụng thành công mã <strong>{voucherResult.code}</strong>, giảm{" "}
              {formatVND(voucherResult.discountAmount)}.
            </InlineNotice>
          )}
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <CalendarDays className="h-4 w-4 text-sky-600" />
            Phương thức thanh toán
          </label>
          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              return (
                <label
                  key={method.id}
                  className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                    paymentMethod === method.id
                      ? "border-sky-300 bg-sky-50/70"
                      : "border-slate-200 bg-slate-50"
                  } ${
                    method.enabled
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-60"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    className="mt-1"
                    checked={paymentMethod === method.id}
                    onChange={() =>
                      method.enabled && onPaymentMethodChange(method.id)
                    }
                    disabled={!method.enabled}
                  />
                  <Icon className="mt-0.5 h-5 w-5 text-sky-700" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {method.label}
                      </p>
                      {method.badge ? (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          {method.badge}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {method.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
