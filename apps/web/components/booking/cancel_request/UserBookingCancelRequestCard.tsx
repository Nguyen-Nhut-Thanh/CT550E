"use client";

import {
  AlertCircle,
  Building2,
  Check,
  CircleDollarSign,
  Copy,
} from "lucide-react";
import type { AdminBooking } from "shared";
import { BookingCustomerContactCard } from "@/components/booking/cancel_request/UserBookingCustomerContactCard";

export interface CancelRequestDetails {
  reason?: string;
  daysRemaining?: string;
  tierPenalty?: string;
  totalPaid?: string;
  penaltyAmount?: string;
  refundEstimated?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  requestedAt?: string;
  numericRefundAmount?: number;
}

export interface BookingCancelRequestCardProps {
  booking: AdminBooking;
  cancelDetails: CancelRequestDetails | null;
  customerReason?: string;
  variant?: "approve" | "reject";
  copiedField?: string | null;
  onCopyField?: (field: string, text: string) => void;
  className?: string;
}

export function BookingCancelRequestCard({
  booking,
  cancelDetails,
  customerReason: propReason,
  variant = "approve",
  copiedField,
  onCopyField,
  className = "",
}: BookingCancelRequestCardProps) {
  const isReject = variant === "reject";
  const reason =
    cancelDetails?.reason || propReason || "Khách yêu cầu hủy tour không nêu rõ lý do";

  const handleCopy = (field: string, text: string) => {
    if (onCopyField) {
      onCopyField(field, text);
    } else {
      void navigator.clipboard.writeText(text);
    }
  };

  return (
    <div
      className={`rounded-[14px] border border-[#e1edfc] bg-white p-4 space-y-3 shadow-2xs ${className}`}
    >
      {/* Header chi tiết yêu cầu */}
      <div className="flex items-center justify-between border-b border-[#edf2fb] pb-2.5">
        <span
          className={`font-bold uppercase tracking-wider text-xs flex items-center gap-1.5 ${
            isReject ? "text-rose-900" : "text-[#07123e]"
          }`}
        >
          {isReject ? (
            <AlertCircle size={15} className="text-rose-600" />
          ) : (
            <CircleDollarSign size={15} className="text-[#075bff]" />
          )}
          {isReject ? "Yêu cầu hủy từ khách hàng" : "Chi tiết yêu cầu hủy của khách"}
        </span>
        {cancelDetails?.requestedAt ? (
          <span className="text-[11px] text-[#7387aa] font-medium">
            {cancelDetails.requestedAt}
          </span>
        ) : null}
      </div>

      {/* Thông tin liên hệ người đặt (3 hàng riêng biệt) */}
      <BookingCustomerContactCard booking={booking} />

      {/* Hộp lý do khách gửi hủy */}
      {reason ? (
        <div
          className={`rounded-xl border p-3 space-y-1 ${
            isReject
              ? "border-rose-200/90 bg-rose-50/60"
              : "border-blue-200/80 bg-blue-50/60"
          }`}
        >
          <span
            className={`text-[10.5px] font-bold uppercase tracking-wider block ${
              isReject ? "text-rose-700" : "text-blue-700"
            }`}
          >
            Lý do khách gửi
          </span>
          <p
            className={`text-xs font-semibold leading-relaxed whitespace-pre-wrap ${
              isReject ? "text-rose-950" : "text-slate-900"
            }`}
          >
            "{reason}"
          </p>
          {cancelDetails?.refundEstimated ? (
            <div
              className={`pt-1.5 mt-1 border-t flex items-center justify-between text-[11.5px] ${
                isReject ? "border-rose-200/60" : "border-blue-200/60"
              }`}
            >
              <span className={isReject ? "text-rose-800" : "text-slate-600"}>
                Tiền khách mong muốn hoàn:
              </span>
              <strong className={isReject ? "text-rose-950" : "text-blue-950"}>
                {cancelDetails.refundEstimated}
              </strong>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Thông tin tài khoản ngân hàng khách nhận hoàn tiền (nếu có) */}
      {cancelDetails?.bankName || cancelDetails?.bankAccountNumber ? (
        <div className="rounded-xl border border-blue-200/70 bg-blue-50/50 p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
            <Building2 size={14} className="text-blue-600" />
            <span>Tài khoản nhận tiền hoàn trả:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11.5px]">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Ngân hàng
              </span>
              <span className="font-bold text-slate-800">
                {cancelDetails.bankName || "—"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Số tài khoản
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-blue-700">
                  {cancelDetails.bankAccountNumber || "—"}
                </span>
                {cancelDetails.bankAccountNumber ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy("accountNumber", cancelDetails.bankAccountNumber!)
                    }
                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                    title="Sao chép số tài khoản"
                  >
                    {copiedField === "accountNumber" ? (
                      <Check size={13} className="text-emerald-600" />
                    ) : (
                      <Copy size={13} />
                    )}
                  </button>
                ) : null}
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Chủ tài khoản
              </span>
              <span className="font-bold uppercase text-slate-800">
                {cancelDetails.bankAccountName || "—"}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

