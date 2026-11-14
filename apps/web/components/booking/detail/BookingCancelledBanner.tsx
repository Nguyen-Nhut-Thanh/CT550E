"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import type { ParsedBookingNote } from "shared";

export interface BookingCancelledBannerProps {
  parsedNote: ParsedBookingNote;
  tourId?: number;
  onViewRefundSlip?: () => void;
}

export function BookingCancelledBanner({
  parsedNote,
  tourId,
  onViewRefundSlip,
}: BookingCancelledBannerProps) {
  return (
    <div className="w-[min(1430px,_93%)] mx-auto mt-3.5 mb-1.5 rounded-2xl border border-rose-200 bg-rose-50/90 p-3 sm:px-4.5 sm:py-3 shadow-2xs text-rose-950">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Vế trái: Icon + Khối thông tin hủy */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
            <XCircle size={20} />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            {/* Dòng 1: Tiêu đề + Huy hiệu người hủy */}
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold text-rose-950 leading-none">
                {parsedNote.cancellation?.title || "Đơn đặt tour đã bị hủy"}
              </h3>
              {parsedNote.cancellation?.actor && (
                <span className="rounded-full bg-rose-200/90 px-2 py-0.5 text-[10.5px] font-bold text-rose-900 border border-rose-300 leading-none">
                  Người hủy: {parsedNote.cancellation.actor}
                </span>
              )}
            </div>

            {/* Dòng 2: Lý do hủy */}
            <p className="text-xs text-rose-900 leading-snug">
              <span className="font-bold text-rose-950">Lý do hủy:</span>{" "}
              {parsedNote.cancellation?.reason ||
                parsedNote.cancellationReason ||
                "Đơn đặt tour đã bị hủy trên hệ thống."}
            </p>

            {/* Dòng 3 (nếu có): Thời gian, tiền hoàn, ghi chú */}
            {(parsedNote.cancellation?.time ||
              parsedNote.cancellationTime ||
              parsedNote.cancellation?.refundAmount ||
              parsedNote.adminApproval?.refundAmount ||
              (parsedNote.cancellation?.note && !parsedNote.adminApproval?.note)) && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-rose-800 pt-0.5">
                {(parsedNote.cancellation?.time || parsedNote.cancellationTime) && (
                  <span>
                    <strong>Thời gian hủy:</strong>{" "}
                    {parsedNote.cancellation?.time || parsedNote.cancellationTime}
                  </span>
                )}
                {(parsedNote.cancellation?.refundAmount ||
                  parsedNote.adminApproval?.refundAmount) && (
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Tiền hoàn:{" "}
                    {parsedNote.cancellation?.refundAmount ||
                      parsedNote.adminApproval?.refundAmount}
                    {parsedNote.adminApproval?.note
                      ? ` (${parsedNote.adminApproval.note})`
                      : ""}
                  </span>
                )}
                {parsedNote.cancellation?.note &&
                  !parsedNote.adminApproval?.note && (
                    <span>
                      <strong>Ghi chú:</strong> {parsedNote.cancellation.note}
                    </span>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Vế phải: Nút Xem biên nhận hoàn tiền & Đặt lại tour */}
        <div className="shrink-0 self-center flex items-center flex-wrap gap-2">
          {onViewRefundSlip && (
            <button
              type="button"
              onClick={onViewRefundSlip}
              className="inline-flex items-center justify-center rounded-xl bg-white border border-rose-300 hover:bg-rose-100 text-rose-900 px-3.5 py-2 text-xs font-bold transition shadow-2xs whitespace-nowrap cursor-pointer"
            >
              Xem biên nhận hoàn tiền
            </button>
          )}
          {tourId && (
            <Link
              href={`/tours/${tourId}`}
              className="inline-flex items-center justify-center rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white transition shadow-xs whitespace-nowrap cursor-pointer"
            >
              Đặt lại tour này
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

