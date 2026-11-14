"use client";

import { PriceInput } from "@/components/common/forms/PriceInput";
import { BookingCancelPolicySection } from "./BookingCancelPolicySection";
import { BookingCancelRequestCard } from "./BookingCancelRequestCard";
import { BookingTourSummaryCard } from "./BookingTourSummaryCard";
import { useBookingCancelPolicy } from "./useBookingCancelPolicy";
import type { AdminBooking } from "shared";
import type { CancelRequestDetails } from "./BookingCancelRequestCard";

export interface AdminApproveModalContentProps {
  booking: AdminBooking;
  cancelDetails: CancelRequestDetails | null;
  refundAmount: string;
  setRefundAmount: (val: string) => void;
  actionNote: string;
  setActionNote: (val: string) => void;
  copiedField: string | null;
  setCopiedField: (val: string | null) => void;
}

export function AdminApproveModalContent({
  booking,
  cancelDetails,
  refundAmount,
  setRefundAmount,
  actionNote,
  setActionNote,
  copiedField,
  setCopiedField,
}: AdminApproveModalContentProps) {
  const { estimate, isPaid, totalAmount, theme } = useBookingCancelPolicy(booking, {
    cancelDetails,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start p-6">
      {/* CỘT TRÁI: Thẻ tóm tắt tour + Đếm ngược thời gian, 3 ô chi phí, Bảng quy định hoàn hủy tour */}
      <div className="space-y-4">
        <BookingTourSummaryCard
          booking={booking}
          totalAmount={totalAmount}
          isPaid={isPaid}
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Căn cứ chính sách hoàn hủy
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {cancelDetails?.requestedAt
                ? `Căn cứ lúc khách gửi (${cancelDetails.requestedAt})`
                : "Đối chiếu ngày khởi hành"}
            </span>
          </div>
          <BookingCancelPolicySection
            estimate={estimate}
            isPaid={isPaid}
            totalAmount={totalAmount}
            theme={theme}
            refundLabel="Tiền hoàn theo quy định"
          />
        </div>
      </div>

      {/* CỘT PHẢI: Chi tiết khách gửi, Số tiền duyệt hoàn, Ghi chú admin */}
      <div className="space-y-4">
        <BookingCancelRequestCard
          booking={booking}
          cancelDetails={cancelDetails}
          variant="approve"
          copiedField={copiedField}
          onCopyField={(field, text) => {
            void navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
          }}
        />

        {/* Số tiền duyệt hoàn trả */}
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">
              Số tiền duyệt hoàn trả (VNĐ)
            </label>
            {cancelDetails?.numericRefundAmount !== undefined ? (
              <button
                type="button"
                onClick={() =>
                  setRefundAmount(String(cancelDetails.numericRefundAmount))
                }
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Áp dụng gợi ý: {cancelDetails.refundEstimated}
              </button>
            ) : null}
          </div>
          <PriceInput
            label=""
            value={refundAmount}
            onChange={(value) => setRefundAmount(String(value))}
            icon={null}
            suffix="đ"
            placeholder="Ví dụ: 2.500.000"
            inputClassName="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 pr-9 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-500 shadow-2xs"
          />
          <p className="text-[11px] text-slate-500">
            Số tiền này sẽ được lưu vào ghi chú xử lý booking và gửi email thông báo hoàn tiền đến khách.
          </p>
        </div>

        {/* Ghi chú xử lý */}
        <div className="space-y-1.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <label className="text-xs font-bold text-slate-800">
            Ghi chú xử lý của ban quản trị
          </label>
          <textarea
            value={actionNote}
            onChange={(event) => setActionNote(event.target.value)}
            rows={3}
            placeholder="Ví dụ: Hoàn tiền theo chính sách chuyển/hủy tour của chương trình."
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 outline-none transition focus:border-emerald-500 shadow-2xs"
          />
        </div>
      </div>
    </div>
  );
}

