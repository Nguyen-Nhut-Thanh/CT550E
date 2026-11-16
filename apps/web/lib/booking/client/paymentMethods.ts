import { CreditCard, ShieldCheck, Wallet } from "lucide-react";
import type { PaymentMethod } from "shared";

export const PAYMENT_METHODS: Array<{
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
