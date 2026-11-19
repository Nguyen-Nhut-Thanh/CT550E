"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
    allowedOptions?: AdminCancelResolution[];
    newScheduleId?: number;
    waiveDifference?: boolean;
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
  const [allowedOptions, setAllowedOptions] =
    useState<AdminCancelResolution[]>(["full_refund", "reschedule"]);
  const [newScheduleId, setNewScheduleId] = useState<number | undefined>();
  const [selectedSchedule, setSelectedSchedule] = useState<any | null>(null);
  const [waiveDifference, setWaiveDifference] = useState<boolean>(true);

  const totalGuests =
    (booking?.adult_count || 0) +
    (booking?.child_count || 0) +
    (booking?.infant_count || 0);

  const tourId =
    booking?.tour_schedules?.tour_id ||
    booking?.tour_schedules?.tours?.tour_id;
  const currentScheduleId =
    booking?.tour_schedule_id || booking?.tour_schedules?.tour_schedule_id;
  const cutOffHours =
    booking?.tour_schedules?.tours?.cut_off_hours ??
    booking?.cut_off_hours ??
    24;

  const reasonsList = useMemo(() => {
    if (isPendingHold) return ADMIN_PENDING_CANCEL_REASONS;
    if (cancelType === "operator_fault") return ADMIN_OPERATOR_CANCEL_REASONS;
    return ADMIN_CUSTOMER_CANCEL_REASONS;
  }, [isPendingHold, cancelType]);

  const [selectedReason, setSelectedReason] = useState<string>(reasonsList[0]);
  const [customReason, setCustomReason] = useState("");
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [adminNote, setAdminNote] = useState("");

  const prevOpenRef = useRef(false);
  const prevCancelTypeRef = useRef<AdminCancelSourceType | null>(null);

  const handleSelectSchedule = useCallback((id: number, schedule?: any) => {
    setNewScheduleId(id);
    setSelectedSchedule(schedule || null);
  }, []);

  const handleCancelTypeChange = useCallback((val: AdminCancelSourceType) => {
    setCancelType(val);
  }, []);

  const handleAllowedOptionsChange = useCallback((options: AdminCancelResolution[]) => {
    setAllowedOptions(options);
  }, []);

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

  const priceDifference = useMemo(() => {
    if (!selectedSchedule || !booking) return null;
    const currentAmount = Number(booking.total_amount || 0);
    const adultCount = Number(booking.adult_count || 0);
    const childCount = Number(booking.child_count || 0);
    const infantCount = Number(booking.infant_count || 0);
    const adultPrice = Number(
      selectedSchedule.price_adult || selectedSchedule.price || 0,
    );
    const childPrice = Number(
      selectedSchedule.price_child || Math.round(adultPrice * 0.7),
    );
    const infantPrice = Number(selectedSchedule.price_infant || 0);
    const newTotal =
      adultCount * adultPrice +
      childCount * childPrice +
      infantCount * infantPrice;
    return newTotal - currentAmount;
  }, [selectedSchedule, booking]);

  // Cập nhật giá trị mặc định khi mở modal hoặc khi chủ động đổi loại hủy, tránh đè lựa chọn khi đang thao tác
  useEffect(() => {
    if (open && booking) {
      const isNewlyOpened = !prevOpenRef.current;
      const isTypeChanged = prevCancelTypeRef.current !== cancelType;

      if (isNewlyOpened || isTypeChanged) {
        if (isPendingHold) {
          setSelectedReason(ADMIN_PENDING_CANCEL_REASONS[0]);
          setCustomReason("");
          setRefundAmount("0");
          setAdminNote("Nhân viên hủy do khách xác nhận không đi / quá hạn giữ chỗ");
        } else if (cancelType === "operator_fault") {
          setSelectedReason(ADMIN_OPERATOR_CANCEL_REASONS[0]);
          setCustomReason("");
          setRefundAmount(String(totalAmount));
          setAdminNote("Đề xuất phương án giải quyết do sự cố vận hành / thời tiết bất khả kháng");
        } else {
          setSelectedReason(ADMIN_CUSTOMER_CANCEL_REASONS[0]);
          setCustomReason("");
          setRefundAmount(String(isPaid ? estimate.refundAmount : "0"));
          setAdminNote("Hủy đơn booking theo yêu cầu của khách hàng");
        }
        prevCancelTypeRef.current = cancelType;
      }
    }
    prevOpenRef.current = open;
  }, [
    open,
    booking,
    isPaid,
    isPendingHold,
    cancelType,
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
      allowedOptions.includes("reschedule") &&
      !newScheduleId
    ) {
      return;
    }

    if (!isPendingHold && cancelType === "operator_fault" && allowedOptions.length === 0) {
      return;
    }

    const defaultFallback = isPendingHold
      ? "Nhân viên hủy đơn giữ chỗ theo quy định"
      : cancelType === "operator_fault"
        ? "Đề xuất giải quyết do sự cố công ty / thời tiết"
        : "Khách hàng yêu cầu hủy tour";

    const finalReason =
      selectedReason === "Lý do khác"
        ? customReason.trim() || defaultFallback
        : selectedReason;

    const numericRefund =
      !isPendingHold && cancelType === "customer_request" && refundAmount.trim()
        ? Number(refundAmount.replace(/[^\d]/g, ""))
        : undefined;

    await onConfirm({
      reason: finalReason,
      refundAmount: isPendingHold ? undefined : numericRefund,
      note: adminNote.trim() || finalReason,
      cancelType: isPendingHold ? undefined : cancelType,
      resolutionOption: allowedOptions[0],
      allowedOptions: isPendingHold
        ? undefined
        : cancelType === "operator_fault"
          ? allowedOptions
          : ["full_refund"],
      newScheduleId:
        !isPendingHold &&
        cancelType === "operator_fault" &&
        allowedOptions.includes("reschedule")
          ? newScheduleId
          : undefined,
      waiveDifference:
        !isPendingHold && cancelType === "operator_fault"
          ? waiveDifference
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
      <div className="relative z-10 my-auto flex max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl lg:max-w-5xl flex-col overflow-hidden rounded-[20px] bg-white shadow-2xl border border-[#e1edfc] text-[#0b1747] sm:max-h-[calc(100dvh-2.5rem)]">
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
              : cancelType === "operator_fault"
                ? "border-emerald-200 bg-[linear-gradient(135deg,#f0fdf4_0%,#ecfeff_60%,#dbeafe_100%)]"
                : "border-rose-200 bg-[linear-gradient(135deg,#fff1f2_0%,#ffe4e6_60%,#fecdd3_100%)]"
          }`}
        >
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-xs ${
                isPendingHold
                  ? "bg-sky-600"
                  : cancelType === "operator_fault"
                    ? "bg-emerald-600"
                    : "bg-rose-600"
              }`}
            >
              {isPendingHold ? (
                <Trash2 size={18} />
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
                  : cancelType === "operator_fault"
                    ? "bg-white/95 text-emerald-800 border-emerald-300"
                    : "bg-white/95 text-rose-800 border-rose-300"
              }`}
            >
              {isPendingHold
                ? "HỦY ĐƠN GIỮ CHỖ"
                : cancelType === "operator_fault"
                  ? "ĐỀ XUẤT PHƯƠNG ÁN GIẢI QUYẾT (SỰ CỐ VẬN HÀNH)"
                  : "HỦY ĐƠN TOUR THEO YÊU CẦU KHÁCH"}
            </span>
            <span className="text-xs font-semibold text-[#7387aa]">
              #{booking.booking_id || booking.id}
            </span>
          </div>

          <h2
            id="admin-cancel-modal-title"
            className="text-lg sm:text-xl font-extrabold text-[#07123e] truncate"
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
          className="flex-1 overflow-y-auto p-4.5 sm:p-5 space-y-3.5"
        >
          {/* CẢNH BÁO NẾU TOUR ĐÃ KHỞI HÀNH HOẶC ĐANG TRONG THỜI GIAN KHỞI HÀNH */}
          {isDeparted && (
            <div className="rounded-[14px] border border-rose-300 bg-rose-50 p-4 text-rose-900 flex items-start gap-3 shadow-2xs">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-start">
            {/* CỘT TRÁI: Thẻ tóm tắt tour + Đếm ngược hoặc Chính sách tương ứng */}
            <div className="space-y-3.5">
              <BookingTourSummaryCard
                booking={booking}
                totalAmount={totalAmount}
                isPaid={isPaid}
              />

              {/* Nếu hủy do công ty / sự cố */}
              {!isPendingHold && cancelType === "operator_fault" ? (
                allowedOptions.length === 2 ? (
                  <div className="rounded-[14px] border border-emerald-200 bg-[linear-gradient(135deg,#f0fdf4_0%,#eff6ff_100%)] p-4.5 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck size={17} className="text-emerald-600" />
                      <span>Đề xuất giải quyết linh hoạt</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Do chuyến đi có sự cố khách quan / thời tiết, hệ thống sẽ gửi thông báo và cho phép khách hàng <strong>tự chọn 1 trong 2 phương án</strong>:
                    </p>
                    <ul className="text-xs space-y-1.5 text-slate-700 list-disc list-inside">
                      <li>
                        <strong>Hoàn tiền 100%:</strong> Hoàn đủ{" "}
                        <strong className="text-emerald-700">{formatVND(totalAmount)}</strong> về tài khoản ngân hàng của khách.
                      </li>
                      <li>
                        <strong>Dời sang đợt khác:</strong> Chuyển danh sách hành khách sang ngày khởi hành mới.
                      </li>
                    </ul>
                  </div>
                ) : allowedOptions.includes("full_refund") ? (
                  <div className="rounded-[14px] border border-emerald-200 bg-emerald-50/70 p-4.5 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                      <ShieldCheck size={17} className="text-emerald-600" />
                      <span>Chính sách hoàn tiền sự cố / thiên tai</span>
                    </div>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Do chuyến đi bị gián đoạn vì lý do khách quan (thời tiết bão lũ, sự cố phương tiện hoặc vận hành), khách hàng được{" "}
                      <strong>bảo lưu và hoàn trả 100%</strong> toàn bộ số tiền đã thanh toán.
                    </p>
                    <div className="pt-2 border-t border-emerald-200/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Phí phạt hủy:</span>
                        <strong className="text-emerald-700 font-bold">0 đ (Miễn phạt 100%)</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Số tiền hoàn trả:</span>
                        <strong className="text-emerald-900 text-sm font-black">
                          {formatVND(totalAmount)}
                        </strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[14px] border border-blue-200 bg-blue-50/70 p-4.5 space-y-3 shadow-2xs">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                      <CalendarSync size={17} className="text-blue-600" />
                      <span>Chính sách dời lịch khởi hành</span>
                    </div>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      Toàn bộ danh sách <strong>{totalGuests} khách hàng</strong> và số tiền đã thanh toán ({formatVND(totalAmount)}) sẽ được đề xuất chuyển sang đợt khởi hành mới.
                    </p>
                  </div>
                )
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
            <div className="space-y-3.5">
              {/* 1. Bộ chọn loại hủy (Do công ty vs Do khách) - Chỉ áp dụng cho đơn đã thanh toán */}
              {!isPendingHold && (
                <AdminCancelTypeSelector
                  value={cancelType}
                  onChange={handleCancelTypeChange}
                  disabled={disabledOrLoading(loading, isDeparted)}
                />
              )}

              {/* 2. Phương án giải quyết (Nếu chọn Do công ty) */}
              {!isPendingHold && cancelType === "operator_fault" && (
                <AdminCancelResolutionSelector
                  allowedOptions={allowedOptions}
                  onChange={handleAllowedOptionsChange}
                  disabled={disabledOrLoading(loading, isDeparted)}
                />
              )}

              {/* 3. Dropdown chọn đợt khởi hành mới (Nếu phương án có Dời lịch) */}
              {!isPendingHold &&
              cancelType === "operator_fault" &&
              allowedOptions.includes("reschedule") ? (
                <div className="space-y-3">
                  <AdminRescheduleSchedulePicker
                    tourId={tourId}
                    currentScheduleId={currentScheduleId}
                    totalGuests={totalGuests}
                    cutOffHours={cutOffHours}
                    selectedScheduleId={newScheduleId}
                    onSelectSchedule={handleSelectSchedule}
                    disabled={disabledOrLoading(loading, isDeparted)}
                  />

                  {priceDifference !== null && (
                    <div className="space-y-2">
                      {priceDifference > 0 ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-amber-900 font-bold">Chênh lệch giá đợt mới:</span>
                            <strong className="text-rose-600 font-extrabold">+{formatVND(priceDifference)}</strong>
                          </div>
                          <label className="flex items-start gap-2 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={waiveDifference}
                              onChange={(e) => setWaiveDifference(e.target.checked)}
                              className="mt-0.5 rounded border-amber-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[11.5px] text-amber-950 leading-snug">
                              <strong>Miễn phí phụ thu chênh lệch cho khách hàng</strong> (Công ty hỗ trợ khoản chênh lệch này do sự cố từ phía công ty)
                            </span>
                          </label>
                        </div>
                      ) : priceDifference < 0 ? (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-emerald-900 font-bold">Chênh lệch giá đợt mới:</span>
                            <strong className="text-emerald-700 font-extrabold">−{formatVND(Math.abs(priceDifference))}</strong>
                          </div>
                          <p className="text-[11.5px] text-emerald-800 leading-snug">
                            Đợt mới có giá thấp hơn. Khoản chênh lệch thừa này sẽ được hoàn lại vào tài khoản ngân hàng của khách sau khi khách xác nhận dời lịch.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs flex items-center justify-between">
                          <span className="text-blue-900 font-medium">Chênh lệch giá đợt mới:</span>
                          <strong className="text-blue-700 font-bold">0 đ (Giá tương đương)</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>
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
                    : cancelType === "operator_fault"
                      ? "Lý do hủy / đề xuất đổi lịch"
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

              {/* 5. Số tiền hoàn lại (Chỉ hiển thị khi hủy theo yêu cầu khách) */}
              {!isPendingHold && cancelType === "customer_request" && (
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
                    inputClassName="w-full h-9.5 rounded-lg border border-slate-200 bg-white px-3.5 pr-9 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none transition shadow-2xs"
                  />

                  {/* Nút bấm áp dụng nhanh mức tiền hoàn */}
                  {isPaid && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setRefundAmount(String(estimate.refundAmount))
                        }
                        className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                      >
                        Theo quy định ({formatVND(estimate.refundAmount)})
                      </button>
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
                cancelType === "customer_request" && (
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
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-rose-500 focus:outline-none transition shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Footer nút hành động */}
          <footer className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-4 border-t border-[#edf2fb]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto min-h-10 px-5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
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
                  allowedOptions.length === 0) ||
                (!isPendingHold &&
                  cancelType === "operator_fault" &&
                  allowedOptions.includes("reschedule") &&
                  !newScheduleId)
              }
              className={`w-full sm:w-auto min-h-10 inline-flex items-center justify-center gap-2 px-6 rounded-[12px] text-xs font-[650] text-white transition-colors shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isPendingHold
                  ? "bg-sky-600 hover:bg-sky-700"
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
              ) : cancelType === "operator_fault" ? (
                <span>Gửi đề xuất giải quyết cho khách hàng</span>
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
