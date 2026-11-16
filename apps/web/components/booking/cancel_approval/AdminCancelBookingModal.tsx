"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  Building2,
  CalendarSync,
  Check,
  CircleDollarSign,
  Copy,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { formatVND } from "@/lib/utils/currency";
import { PriceInput } from "@/components/common/form_controls/PriceInput";
import {
  ADMIN_CUSTOMER_CANCEL_REASONS,
  ADMIN_OPERATOR_CANCEL_REASONS,
  ADMIN_PENDING_CANCEL_REASONS,
} from "shared";
import { useBookingCancelPolicy } from "@/lib/booking/client/useBookingCancelPolicy";
import { BookingCancelPolicySection } from "@/components/booking/cancel_request/UserBookingCancelPolicySection";
import { BookingCancelReasonPicker } from "@/components/booking/cancel_request/UserBookingCancelReasonPicker";
import { BookingTourSummaryCard } from "@/components/booking/cancel_request/UserBookingTourSummaryCard";
import {
  AdminCancelTypeSelector,
  type AdminCancelSourceType,
} from "@/components/booking/cancel_approval/AdminCancelTypeSelector";
import {
  AdminCancelResolutionSelector,
  type AdminCancelResolution,
} from "@/components/booking/cancel_approval/AdminCancelResolutionSelector";
import { AdminRescheduleSchedulePicker } from "@/components/booking/cancel_approval/AdminRescheduleSchedulePicker";

export interface AdminCancelBookingModalProps {
  booking: any | null;
  open: boolean;
  type?: "cancel-booking" | "cancel-pending";
  loading?: boolean;
  onClose: () => void;
  onConfirm: (data: {
    reason: string;
    refundAmount?: number;
    note?: string;
    cancelType?: AdminCancelSourceType;
    resolutionOption?: AdminCancelResolution;
    newScheduleId?: number;
  }) => Promise<void> | void;
}

export function AdminCancelBookingModal({
  booking,
  open,
  type = "cancel-booking",
  loading = false,
  onClose,
  onConfirm,
}: AdminCancelBookingModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { isPaid, startDate, totalAmount, estimate, theme } =
    useBookingCancelPolicy(booking);

  // Phân biệt hủy đơn giữ chỗ (pending) hay hủy đơn đặt tour đã thanh toán/xác nhận
  const isPendingHold =
    type === "cancel-pending" ||
    (!type && String(booking?.status).toLowerCase() === "pending");

  // Kiểm tra tour đã khởi hành hoặc đang diễn ra hay chưa
  const isDeparted = Boolean(
    startDate && new Date(startDate).getTime() <= Date.now(),
  );

  const [cancelType, setCancelType] =
    useState<AdminCancelSourceType>("operator_fault");
  const [resolutionOption, setResolutionOption] =
    useState<AdminCancelResolution>("full_refund");
  const [newScheduleId, setNewScheduleId] = useState<number | undefined>();

  const totalGuests =
    (booking?.adult_count || 0) +
    (booking?.child_count || 0) +
    (booking?.infant_count || 0);

  const tourId =
    booking?.tour_schedules?.tour_id ||
    booking?.tour_schedules?.tours?.tour_id;
  const currentScheduleId =
    booking?.tour_schedule_id || booking?.tour_schedules?.tour_schedule_id;

  const reasonsList = useMemo(() => {
    if (isPendingHold) return ADMIN_PENDING_CANCEL_REASONS;
    if (cancelType === "operator_fault") return ADMIN_OPERATOR_CANCEL_REASONS;
    return ADMIN_CUSTOMER_CANCEL_REASONS;
  }, [isPendingHold, cancelType]);

  const [selectedReason, setSelectedReason] = useState<string>(reasonsList[0]);
  const [customReason, setCustomReason] = useState("");
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => setMounted(true), []);

  // Parse thông tin tài khoản nếu khách có gửi yêu cầu hủy trước đó
  const customerCancelInfo = useMemo(() => {
    if (booking?.cancellation_meta?.cancelRequest) {
      const cr = booking.cancellation_meta.cancelRequest;
      return {
        bankName: cr.bankName,
        bankAccountNumber: cr.bankAccountNumber,
        bankAccountName: cr.bankAccountName,
        customerReason: cr.reason,
      };
    }
    if (!booking?.note) return null;
    const match = String(booking.note).match(
      /\[CUSTOMER_CANCEL_REQUEST\]([\s\S]*?)(?:\n\[|$)/i,
    );
    if (!match) return null;
    const text = match[1];
    const bankName = text.match(/-\s*Ng[âa]n\s*h[àa]ng:\s*([^\n]+)/i)?.[1]?.trim();
    const bankAccountNumber = text
      .match(/-\s*S[ốo]\s*t[àa]i\s*kho[ảa]n:\s*([^\n]+)/i)?.[1]
      ?.trim();
    const bankAccountName = text
      .match(/-\s*Ch[ủu]\s*t[àa]i\s*kho[ảa]n:\s*([^\n]+)/i)?.[1]
      ?.trim();
    const customerReason = text.match(/L[ýy]\s*do:\s*([^\n]+)/i)?.[1]?.trim();

    return {
      bankName,
      bankAccountNumber,
      bankAccountName,
      customerReason,
    };
  }, [booking]);

  // Cập nhật giá trị mặc định khi đổi loại hủy hoặc mở modal
  useEffect(() => {
    if (open && booking) {
      if (isPendingHold) {
        setSelectedReason(ADMIN_PENDING_CANCEL_REASONS[0]);
        setCustomReason("");
        setRefundAmount("0");
        setAdminNote("Nhân viên hủy do khách xác nhận không đi / quá hạn giữ chỗ");
      } else {
        if (cancelType === "operator_fault") {
          setSelectedReason(ADMIN_OPERATOR_CANCEL_REASONS[0]);
          setCustomReason("");
          if (resolutionOption === "full_refund") {
            setRefundAmount(String(totalAmount));
            setAdminNote("Công ty hoàn tiền 100% do sự cố vận hành / thời tiết bất khả kháng");
          } else {
            setRefundAmount("0");
            setAdminNote("Chuyển lịch khởi hành sang đợt mới, bảo lưu 100% quyền lợi khách hàng");
          }
        } else {
          setSelectedReason(ADMIN_CUSTOMER_CANCEL_REASONS[0]);
          setCustomReason("");
          setRefundAmount(String(isPaid ? estimate.refundAmount : "0"));
          setAdminNote("Hủy đơn booking theo yêu cầu của khách hàng");
        }
      }
      setCopiedField(null);
    }
  }, [
    open,
    booking,
    isPaid,
    isPendingHold,
    cancelType,
    resolutionOption,
    totalAmount,
    estimate.refundAmount,
  ]);

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

    if (isDeparted) return;

    if (
      !isPendingHold &&
      cancelType === "operator_fault" &&
      resolutionOption === "reschedule" &&
      !newScheduleId
    ) {
      return;
    }

    const defaultFallback = isPendingHold
      ? "Nhân viên hủy đơn giữ chỗ theo quy định"
      : cancelType === "operator_fault"
        ? "Hủy do sự cố công ty / thời tiết"
        : "Khách hàng yêu cầu hủy tour";

    const finalReason =
      selectedReason === "Lý do khác"
        ? customReason.trim() || defaultFallback
        : selectedReason;

    const numericRefund =
      !isPendingHold && resolutionOption !== "reschedule" && refundAmount.trim()
        ? Number(refundAmount.replace(/[^\d]/g, ""))
        : undefined;

    await onConfirm({
      reason: finalReason,
      refundAmount: isPendingHold ? undefined : numericRefund,
      note: adminNote.trim() || finalReason,
      cancelType: isPendingHold ? undefined : cancelType,
      resolutionOption: isPendingHold
        ? undefined
        : cancelType === "operator_fault"
          ? resolutionOption
          : "full_refund",
      newScheduleId:
        !isPendingHold &&
        cancelType === "operator_fault" &&
        resolutionOption === "reschedule"
          ? newScheduleId
          : undefined,
    });
  };

  const handleCopy = (text: string, field: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-cancel-modal-title"
      className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Container: Rộng max-w-5xl 2 cột đồng bộ */}
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
          className={`relative isolate shrink-0 pt-6 pb-5 px-6 sm:px-7 overflow-hidden border-b ${
            isPendingHold
              ? "border-sky-200 bg-[linear-gradient(135deg,#f0f7ff_0%,#e8f3ff_60%,#dcecff_100%)]"
              : cancelType === "operator_fault" && resolutionOption === "reschedule"
                ? "border-blue-200 bg-[linear-gradient(135deg,#eff6ff_0%,#dbeafe_60%,#bfdbfe_100%)]"
                : cancelType === "operator_fault"
                  ? "border-emerald-200 bg-[linear-gradient(135deg,#f0fdf4_0%,#dcfce7_60%,#bbf7d0_100%)]"
                  : "border-rose-200 bg-[linear-gradient(135deg,#fff1f2_0%,#ffe4e6_60%,#fecdd3_100%)]"
          }`}
        >
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-xs ${
                isPendingHold
                  ? "bg-sky-600"
                  : cancelType === "operator_fault" && resolutionOption === "reschedule"
                    ? "bg-blue-600"
                    : cancelType === "operator_fault"
                      ? "bg-emerald-600"
                      : "bg-rose-600"
              }`}
            >
              {isPendingHold ? (
                <Trash2 size={18} />
              ) : cancelType === "operator_fault" && resolutionOption === "reschedule" ? (
                <CalendarSync size={18} />
              ) : cancelType === "operator_fault" ? (
                <ShieldCheck size={18} />
              ) : (
                <ShieldAlert size={18} />
              )}
            </span>
            <span
              className={`uppercase text-[11px] tracking-wider font-extrabold px-3 py-1 rounded-full border shadow-2xs ${
                isPendingHold
                  ? "bg-white/95 text-sky-800 border-sky-300"
                  : cancelType === "operator_fault" && resolutionOption === "reschedule"
                    ? "bg-white/95 text-blue-800 border-blue-300"
                    : cancelType === "operator_fault"
                      ? "bg-white/95 text-emerald-800 border-emerald-300"
                      : "bg-white/95 text-rose-800 border-rose-300"
              }`}
            >
              {isPendingHold
                ? "HỦY ĐƠN GIỮ CHỖ"
                : cancelType === "operator_fault" && resolutionOption === "reschedule"
                  ? "DỜI LỊCH TOUR (SỰ CỐ VẬN HÀNH)"
                  : cancelType === "operator_fault"
                    ? "HỦY TOUR & HOÀN TIỀN 100% (SỰ CỐ VẬN HÀNH)"
                    : "HỦY ĐƠN TOUR THEO YÊU CẦU KHÁCH"}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              #{booking.booking_id || booking.id}
            </span>
          </div>

          <h2
            id="admin-cancel-modal-title"
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
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5"
        >
          {/* CẢNH BÁO NẾU TOUR ĐÃ KHỞI HÀNH HOẶC ĐANG TRONG THỜI GIAN KHỞI HÀNH */}
          {isDeparted && (
            <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-rose-900 flex items-start gap-3 shadow-2xs">
              <AlertTriangle size={20} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-800">
                  Tour đã hoặc đang trong thời gian khởi hành
                </h3>
                <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                  Ngày khởi hành của tour là{" "}
                  <strong>{startDate.toLocaleDateString("vi-VN")}</strong>. Hệ
                  thống đã khóa tính năng hủy đơn đối với chuyến đi đang diễn ra
                  hoặc đã hoàn tất để bảo vệ tính toàn vẹn dữ liệu.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start">
            {/* CỘT TRÁI: Thẻ tóm tắt tour + Đếm ngược hoặc Chính sách tương ứng */}
            <div className="space-y-4">
              <BookingTourSummaryCard
                booking={booking}
                totalAmount={totalAmount}
                isPaid={isPaid}
              />

              {/* Nếu hủy do công ty / sự cố và chọn Hoàn tiền 100% */}
              {!isPendingHold &&
              cancelType === "operator_fault" &&
              resolutionOption === "full_refund" ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4.5 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                    <ShieldCheck size={17} className="text-emerald-600" />
                    <span>Chính sách hoàn tiền sự cố / thiên tai</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Do chuyến đi bị gián đoạn vì lý do khách quan (thời tiết bão
                    lũ, sự cố phương tiện hoặc vận hành), khách hàng được{" "}
                    <strong>bảo lưu và hoàn trả 100%</strong> toàn bộ số tiền đã
                    thanh toán.
                  </p>
                  <div className="pt-2 border-t border-emerald-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Phí phạt hủy:</span>
                      <strong className="text-emerald-700 font-bold">
                        0 đ (Miễn phạt 100%)
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Số tiền hoàn trả:</span>
                      <strong className="text-emerald-900 text-sm font-black">
                        {formatVND(totalAmount)}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Nếu hủy do công ty / sự cố và chọn Dời lịch */}
              {!isPendingHold &&
              cancelType === "operator_fault" &&
              resolutionOption === "reschedule" ? (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4.5 space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                    <CalendarSync size={17} className="text-blue-600" />
                    <span>Chính sách dời lịch khởi hành</span>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Toàn bộ danh sách <strong>{totalGuests} khách hàng</strong>{" "}
                    và số tiền đã thanh toán ({formatVND(totalAmount)}) sẽ được
                    chuyển sang đợt khởi hành mới. Khách hàng{" "}
                    <strong>không phải bù thêm bất kỳ chi phí nào</strong>.
                  </p>
                </div>
              ) : null}

              {/* Nếu hủy theo yêu cầu khách hoặc đơn giữ chỗ: Áp dụng bảng chính sách hoàn hủy tiêu chuẩn */}
              {isPendingHold || cancelType === "customer_request" ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Căn cứ chính sách hoàn hủy
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Tính theo thời gian khởi hành
                    </span>
                  </div>
                  <BookingCancelPolicySection
                    estimate={estimate}
                    isPaid={isPaid}
                    totalAmount={totalAmount}
                    theme={theme}
                    refundLabel={
                      isPendingHold ? "Cần thanh toán" : "Hoàn theo quy định"
                    }
                  />
                </div>
              ) : null}
            </div>

            {/* CỘT PHẢI: Bộ chọn loại nguyên nhân + Phương án + Lý do + Form */}
            <div className="space-y-4">
              {/* 1. Bộ chọn loại hủy (Do công ty vs Do khách) - Chỉ áp dụng cho đơn đã thanh toán */}
              {!isPendingHold && (
                <AdminCancelTypeSelector
                  value={cancelType}
                  onChange={setCancelType}
                  disabled={disabledOrLoading(loading, isDeparted)}
                />
              )}

              {/* 2. Phương án giải quyết (Nếu chọn Do công ty) */}
              {!isPendingHold && cancelType === "operator_fault" && (
                <AdminCancelResolutionSelector
                  value={resolutionOption}
                  onChange={setResolutionOption}
                  disabled={disabledOrLoading(loading, isDeparted)}
                />
              )}

              {/* 3. Dropdown chọn đợt khởi hành mới (Nếu chọn Dời lịch) */}
              {!isPendingHold &&
              cancelType === "operator_fault" &&
              resolutionOption === "reschedule" ? (
                <AdminRescheduleSchedulePicker
                  tourId={tourId}
                  currentScheduleId={currentScheduleId}
                  totalGuests={totalGuests}
                  selectedScheduleId={newScheduleId}
                  onSelectSchedule={setNewScheduleId}
                  disabled={disabledOrLoading(loading, isDeparted)}
                />
              ) : null}

              {/* 4. Chọn lý do hủy / dời lịch */}
              <BookingCancelReasonPicker
                reasons={reasonsList}
                selectedReason={selectedReason}
                onSelectReason={setSelectedReason}
                customReason={customReason}
                onCustomReasonChange={setCustomReason}
                label={
                  isPendingHold
                    ? "Lý do hủy đơn giữ chỗ"
                    : cancelType === "operator_fault" && resolutionOption === "reschedule"
                      ? "Lý do dời lịch khởi hành"
                      : "Lý do hủy đơn booking"
                }
                placeholder={
                  isPendingHold
                    ? "Nhập lý do chi tiết nhân viên hủy đơn giữ chỗ..."
                    : cancelType === "operator_fault"
                      ? "Nhập chi tiết sự cố / nguyên nhân hủy hoặc dời lịch..."
                      : "Nhập lý do chi tiết admin hủy đơn booking..."
                }
              />

              {/* 5. Số tiền hoàn lại (Chỉ hiển thị khi KHÔNG phải dời lịch và không phải pending) */}
              {!isPendingHold && resolutionOption !== "reschedule" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Số tiền hoàn lại (VNĐ, nếu có)
                    </label>
                    {isPaid && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        Đã thanh toán:{" "}
                        <strong className="text-slate-800">
                          {formatVND(estimate.paidAmount)}
                        </strong>
                      </span>
                    )}
                  </div>

                  <PriceInput
                    label=""
                    value={refundAmount}
                    onChange={(value) => setRefundAmount(String(value))}
                    icon={null}
                    suffix="đ"
                    placeholder="Ví dụ: 9.325.000"
                    inputClassName="w-full h-10 rounded-xl border border-slate-200 bg-white px-3.5 pr-9 text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none transition shadow-2xs"
                  />

                  {/* Nút bấm áp dụng nhanh mức tiền hoàn */}
                  {isPaid && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {cancelType === "operator_fault" ? (
                        <button
                          type="button"
                          onClick={() => setRefundAmount(String(totalAmount))}
                          className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                        >
                          Hoàn 100% ({formatVND(totalAmount)})
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            setRefundAmount(String(estimate.refundAmount))
                          }
                          className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                        >
                          Theo quy định ({formatVND(estimate.refundAmount)})
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setRefundAmount("0")}
                        className="rounded-lg bg-slate-50 border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                      >
                        Không hoàn tiền (0 đ)
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Thông tin tài khoản nhận tiền hoàn của khách nếu có */}
              {customerCancelInfo?.bankAccountNumber &&
                resolutionOption !== "reschedule" && (
                  <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                      <Building2 size={14} className="text-blue-600" />
                      <span>Tài khoản khách cung cấp nhận tiền hoàn:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11.5px]">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Ngân hàng
                        </span>
                        <span className="font-bold text-slate-800">
                          {customerCancelInfo.bankName || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Số tài khoản
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-blue-700">
                            {customerCancelInfo.bankAccountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                customerCancelInfo.bankAccountNumber!,
                                "accountNumber",
                              )
                            }
                            className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                            title="Sao chép"
                          >
                            {copiedField === "accountNumber" ? (
                              <Check size={13} className="text-emerald-600" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Chủ tài khoản
                        </span>
                        <span className="font-bold uppercase text-slate-800">
                          {customerCancelInfo.bankAccountName || "—"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              {/* Ghi chú xử lý */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Ghi chú điều hành
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={2}
                  placeholder="Ghi chú nội bộ cho ban quản trị hoặc thông báo đến khách hàng..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none transition shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Footer nút hành động */}
          <footer className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            >
              Đóng
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                isDeparted ||
                (!isPendingHold &&
                  cancelType === "operator_fault" &&
                  resolutionOption === "reschedule" &&
                  !newScheduleId)
              }
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isPendingHold
                  ? "bg-sky-600 hover:bg-sky-700"
                  : cancelType === "operator_fault" && resolutionOption === "reschedule"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : cancelType === "operator_fault"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : isDeparted ? (
                <span>Đã khóa (Tour đã/đang khởi hành)</span>
              ) : isPendingHold ? (
                <span>Xác nhận hủy đơn giữ chỗ</span>
              ) : cancelType === "operator_fault" && resolutionOption === "reschedule" ? (
                <span>Xác nhận dời lịch khởi hành</span>
              ) : cancelType === "operator_fault" ? (
                <span>Xác nhận hủy & Hoàn tiền 100%</span>
              ) : (
                <span>Xác nhận hủy theo yêu cầu khách</span>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function disabledOrLoading(loading: boolean, isDeparted: boolean) {
  return loading || isDeparted;
}
