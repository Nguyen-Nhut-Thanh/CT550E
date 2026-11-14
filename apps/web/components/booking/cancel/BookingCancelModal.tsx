"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { formatVND } from "@/lib/utils/currency";
import { requestBookingCancellation } from "@/lib/booking/api";
import CustomDropdown from "@/components/common/forms/CustomDropdown";
import { useToast } from "@/lib/notifications/useToast";
import {
  AlertTriangle,
  Banknote,
  Loader2,
  ShieldAlert,
  X,
} from "lucide-react";
import {
  CANCELLATION_REASONS,
  POPULAR_VIETNAMESE_BANKS,
  type CancelBookingPayload,
} from "shared";
import { useBookingCancelPolicy } from "./useBookingCancelPolicy";
import { BookingCancelPolicySection } from "./BookingCancelPolicySection";
import { BookingCancelReasonPicker } from "./BookingCancelReasonPicker";

export interface BookingCancelModalProps {
  booking: any | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: (result: { type: "instant_cancelled" | "cancel_requested"; message: string }) => void;
}

export function BookingCancelModal({
  booking,
  open,
  onClose,
  onSuccess,
}: BookingCancelModalProps) {
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>(CANCELLATION_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [bankName, setBankName] = useState(POPULAR_VIETNAMESE_BANKS[0]);
  const [customBankName, setCustomBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const { isPaid, startDate, totalAmount, estimate, theme } =
    useBookingCancelPolicy(booking);

  // Reset form khi mở modal
  useEffect(() => {
    if (open && booking) {
      setSelectedReason(CANCELLATION_REASONS[0]);
      setCustomReason("");
      setBankName(POPULAR_VIETNAMESE_BANKS[0]);
      setCustomBankName("");
      setBankAccountNumber("");
      setBankAccountName(booking.contact_name ? booking.contact_name.toUpperCase() : "");
    }
  }, [open, booking]);

  // Handle escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose, loading]);

  if (!mounted || !open || !booking) return null;

  const tourName =
    booking.tour_schedules?.tours?.name ||
    booking.name ||
    `Đơn đặt tour #${booking.booking_id || booking.id}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalReason =
      selectedReason === "Lý do khác"
        ? customReason.trim() || "Khách hàng có lý do cá nhân khác"
        : selectedReason;

    const finalBank = bankName === "Khác" ? customBankName.trim() : bankName;

    if (isPaid && estimate.refundAmount > 0) {
      if (!finalBank) {
        showError("Vui lòng chọn hoặc nhập tên ngân hàng nhận tiền hoàn.");
        return;
      }
      if (!bankAccountNumber.trim()) {
        showError("Vui lòng nhập số tài khoản ngân hàng nhận tiền hoàn.");
        return;
      }
      if (!bankAccountName.trim()) {
        showError("Vui lòng nhập tên chủ tài khoản thụ hưởng.");
        return;
      }
    }

    const payload: CancelBookingPayload = {
      reason: finalReason,
      bankName: isPaid && estimate.refundAmount > 0 ? finalBank : undefined,
      bankAccountNumber:
        isPaid && estimate.refundAmount > 0 ? bankAccountNumber.trim() : undefined,
      bankAccountName:
        isPaid && estimate.refundAmount > 0
          ? bankAccountName.trim().toUpperCase()
          : undefined,
      estimatedRefundAmount: isPaid ? estimate.refundAmount : 0,
    };

    setLoading(true);
    try {
      const res = await requestBookingCancellation(
        booking.booking_id || booking.id,
        payload
      );

      success(
        isPaid
          ? "Đã gửi yêu cầu hủy tour và hoàn tiền đến ban quản trị!"
          : "Đã gửi yêu cầu hủy đơn đặt tour đến ban quản trị!"
      );

      onSuccess?.({
        type: res.cancellation_type,
        message: res.message,
      });
      onClose();
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Không thể xử lý yêu cầu hủy tour."
      );
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Container: Rộng max-w-5xl để chia 2 cột đẹp mắt */}
      <div className="relative z-10 my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl lg:max-w-5xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl border border-slate-200 text-[#092448] sm:max-h-[calc(100dvh-2.5rem)]">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Đóng popup"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-slate-900 disabled:opacity-50 cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <header
          className={`relative isolate shrink-0 pt-6 pb-5 px-6 sm:px-7 overflow-hidden border-b ${theme.headerBg}`}
        >
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-xs ${theme.headerIconBg}`}
            >
              {isPaid ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
            </span>
            <span
              className={`uppercase text-[11px] tracking-wider font-extrabold px-3 py-1 rounded-full border shadow-2xs ${theme.badgeClass}`}
            >
              {theme.badgeText}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              #{booking.booking_id || booking.id}
            </span>
          </div>

          <h2
            id="cancel-modal-title"
            className="text-lg sm:text-xl font-black text-[#092448] truncate"
          >
            {tourName}
          </h2>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
            <span>
              Khởi hành: <strong>{startDate.toLocaleDateString("vi-VN")}</strong>
            </span>
            <span>·</span>
            <span>
              Giá trị đơn:{" "}
              <strong className="text-blue-700">{formatVND(totalAmount)}</strong>
            </span>
            <span>·</span>
            <span
              className={`font-bold ${
                isPaid ? "text-emerald-700" : "text-amber-700"
              }`}
            >
              {isPaid ? "Đã thanh toán" : "Chưa thanh toán (giữ chỗ)"}
            </span>
          </div>
        </header>

        {/* Form Body: Chia làm 2 cột chính */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start">
            {/* CỘT TRÁI: Phần đầu (Đếm ngược thời gian, 3 ô chi phí, Bảng quy định hoàn hủy tour) */}
            <BookingCancelPolicySection
              estimate={estimate}
              isPaid={isPaid}
              totalAmount={totalAmount}
              theme={theme}
              refundLabel="Số tiền thực nhận"
            />

            {/* CỘT PHẢI: Từ lý do hủy tour trở xuống */}
            <div className="space-y-4">
              {/* Chọn lý do hủy tour */}
              <BookingCancelReasonPicker
                reasons={CANCELLATION_REASONS}
                selectedReason={selectedReason}
                onSelectReason={setSelectedReason}
                customReason={customReason}
                onCustomReasonChange={setCustomReason}
                label="Lý do hủy tour"
                placeholder="Vui lòng chia sẻ thêm lý do bạn muốn hủy tour..."
              />

              {/* Form nhập thông tin ngân hàng nhận tiền hoàn (khi đơn đã thanh toán & số tiền hoàn > 0) */}
              {isPaid && estimate.refundAmount > 0 && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-3.5 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900 border-b border-blue-100 pb-2">
                    <Banknote size={17} className="text-blue-600" />
                    <span>Thông tin nhận chuyển khoản hoàn tiền</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Ngân hàng thụ hưởng <span className="text-rose-500">*</span>
                      </label>
                      <CustomDropdown
                        ariaLabel="Ngân hàng thụ hưởng"
                        selectedValue={bankName}
                        onSelect={setBankName}
                        options={POPULAR_VIETNAMESE_BANKS.map((bank) => ({ value: bank, label: bank }))}
                        variant="compact"
                        matchTriggerWidth
                        className="[&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:h-9 [&_button[aria-haspopup=listbox]]:rounded-xl [&_button[aria-haspopup=listbox]]:bg-white [&_button[aria-haspopup=listbox]]:px-2.5 [&_button[aria-haspopup=listbox]]:py-1.5 [&_button[aria-haspopup=listbox]]:text-xs [&_button[aria-haspopup=listbox]]:font-semibold [&_button[aria-haspopup=listbox]]:shadow-2xs"
                      />
                      {bankName === "Khác" && (
                        <input
                          type="text"
                          value={customBankName}
                          onChange={(e) => setCustomBankName(e.target.value)}
                          placeholder="Nhập tên ngân hàng..."
                          required
                          className="mt-1 w-full h-8 rounded-xl border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                        />
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Số tài khoản ngân hàng <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        placeholder="Ví dụ: 0123456789"
                        required
                        className="w-full h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-mono font-bold text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition shadow-2xs"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Tên chủ tài khoản (In hoa không dấu) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={bankAccountName}
                        onChange={(e) => setBankAccountName(e.target.value.toUpperCase())}
                        placeholder="Ví dụ: NGUYEN VAN A"
                        required
                        className="w-full h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition shadow-2xs tracking-wide"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Dòng lưu ý xử lý */}
              <p className="text-[11px] text-slate-500 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                {isPaid
                  ? "* Sau khi bạn gửi yêu cầu, ban quản trị sẽ đối soát và xử lý chuyển khoản hoàn tiền trong vòng 24 - 48 giờ làm việc. Chúng tôi sẽ gửi email thông báo ngay khi giao dịch hoàn tất."
                  : "* Yêu cầu hủy đơn sẽ được gửi đến ban quản trị để xem xét và xử lý giải phóng chỗ. Chúng tôi sẽ gửi email thông báo ngay khi yêu cầu được duyệt."}
              </p>
            </div>
          </div>

          {/* Footer Buttons: Phía dưới cùng dàn hàng ngang */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
            >
              Giữ lại đơn
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition disabled:opacity-50 cursor-pointer ${theme.submitBtnClass}`}
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={15} />
                  <span>{theme.submitText}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
