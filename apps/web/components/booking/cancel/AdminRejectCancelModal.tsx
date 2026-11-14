"use client";

import { BookingCancelPolicySection } from "./BookingCancelPolicySection";
import { BookingCancelRequestCard } from "./BookingCancelRequestCard";
import { BookingTourSummaryCard } from "./BookingTourSummaryCard";
import { useBookingCancelPolicy } from "./useBookingCancelPolicy";
import type { AdminBooking } from "shared";
import type { CancelRequestDetails } from "./BookingCancelRequestCard";

export const REJECT_QUICK_REASONS = [
  "Booking sát ngày khởi hành, vi phạm điều kiện hủy tour",
  "Vé máy bay và khách sạn đã xuất vé/đặt cọc không hoàn lại",
  "Đã quá thời hạn gửi yêu cầu hủy tour theo hợp đồng dịch vụ",
  "Khách đồng ý dời lịch khởi hành sang đợt tiếp theo",
  "Hồ sơ visa/thủ tục xuất nhập cảnh đã được nộp cho cơ quan chức năng",
];

export interface AdminRejectModalContentProps {
  booking: AdminBooking;
  cancelDetails: CancelRequestDetails | null;
  reasonPreview: string;
  actionNote: string;
  setActionNote: (val: string) => void;
  copiedField?: string | null;
  setCopiedField?: (val: string | null) => void;
}

export function AdminRejectModalContent({
  booking,
  cancelDetails,
  reasonPreview,
  actionNote,
  setActionNote,
  copiedField,
  setCopiedField,
}: AdminRejectModalContentProps) {
  const { estimate, isPaid, totalAmount, theme } = useBookingCancelPolicy(booking, {
    cancelDetails,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start p-6">
      {/* CỘT TRÁI: Thẻ tóm tắt tour + Đếm ngược thời gian & Bảng quy định hoàn hủy tour */}
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

      {/* CỘT PHẢI: Chi tiết yêu cầu hủy của khách & Form lý do từ chối */}
      <div className="space-y-4">
        <BookingCancelRequestCard
          booking={booking}
          cancelDetails={cancelDetails}
          customerReason={reasonPreview}
          variant="reject"
          copiedField={copiedField}
          onCopyField={(field, text) => {
            void navigator.clipboard.writeText(text);
            if (setCopiedField) {
              setCopiedField(field);
              setTimeout(() => setCopiedField(null), 2000);
            }
          }}
        />

        {/* Form Nhập Lý Do Từ Chối */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 space-y-3.5 shadow-2xs">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span>Lý do từ chối yêu cầu hủy</span>
                <span className="text-rose-500 font-black">*</span>
              </label>
              <span className="text-[10.5px] text-slate-400 font-medium">
                Gửi thông báo &amp; email cho khách
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Vui lòng nêu rõ lý do từ chối để hệ thống gửi thông báo và email chính thức cho khách hàng.
            </p>
          </div>

          {/* Quick chips gợi ý lý do */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Gợi ý lý do nhanh (bấm để chọn):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {REJECT_QUICK_REASONS.map((reason, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActionNote(reason)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition font-medium text-left cursor-pointer ${
                    actionNote === reason
                      ? "bg-rose-50 border-rose-300 text-rose-700 font-bold shadow-2xs"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <textarea
              value={actionNote}
              onChange={(event) => setActionNote(event.target.value)}
              rows={4}
              placeholder="Nhập chi tiết lý do từ chối yêu cầu hủy..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 outline-none transition focus:border-rose-500 shadow-2xs"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
              <span>Nội dung này là bắt buộc khi từ chối</span>
              <span>{actionNote.trim().length} ký tự</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

