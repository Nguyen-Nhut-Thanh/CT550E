"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarSync,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  HelpCircle,
  Loader2,
  MessageSquare,
  PhoneCall,
  Send,
} from "lucide-react";
import { formatVND } from "@/lib/utils/currency";
import { resolveBookingProposal } from "@/lib/booking/client/api";
import { useToast } from "@/lib/notifications/useToast";
import { POPULAR_VIETNAMESE_BANKS, type BookingDetail } from "shared";

function formatDateVi(dateStr?: string | null) {
  if (!dateStr || Number.isNaN(new Date(dateStr).getTime())) return "Chưa cập nhật";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export interface UserBookingResolutionProposalCardProps {
  booking: BookingDetail;
  onSuccess?: () => void;
}

export function UserBookingResolutionProposalCard({
  booking: b,
  onSuccess,
}: UserBookingResolutionProposalCardProps) {
  const toast = useToast();
  const proposal = (b.cancellation_meta as any)?.resolutionProposal;

  const allowedOptions: ("full_refund" | "reschedule")[] =
    proposal?.allowedOptions || ["full_refund"];

  // Lựa chọn phương án mặc định
  const [selectedOption, setSelectedOption] = useState<
    "full_refund" | "reschedule"
  >(allowedOptions.includes("full_refund") ? "full_refund" : "reschedule");

  // Thông tin tài khoản ngân hàng nhận tiền hoàn
  const [bankName, setBankName] = useState(POPULAR_VIETNAMESE_BANKS[0]);
  const [customBankName, setCustomBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankAccountName, setBankAccountName] = useState("");

  // Hỗ trợ phương án khác
  const [showSupportBox, setShowSupportBox] = useState(false);
  const [supportNote, setSupportNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!proposal) return null;

  const status = proposal.status;
  const refundAmount = proposal.refundAmount ?? Number(b.total_amount);
  const priceDiff = proposal.priceDifference || 0;
  const isDiffWaived = Boolean(proposal.waiveDifference);
  const isExcessRefund = priceDiff < 0;

  // Xử lý gửi lựa chọn phương án
  const handleResolve = async (
    decision: "full_refund" | "reschedule" | "contact_support",
  ) => {
    try {
      setLoading(true);
      setErrorMessage("");

      const finalBank = bankName === "Khác" ? customBankName.trim() : bankName;

      // Validate ngân hàng nếu chọn hoàn tiền hoặc nếu chọn dời lịch có tiền hoàn thừa
      if (
        decision === "full_refund" ||
        (decision === "reschedule" && isExcessRefund)
      ) {
        if (!finalBank) {
          throw new Error("Vui lòng chọn hoặc nhập tên ngân hàng.");
        }
        if (!bankAccountNumber.trim()) {
          throw new Error("Vui lòng nhập số tài khoản ngân hàng.");
        }
        if (!bankAccountName.trim()) {
          throw new Error("Vui lòng nhập tên chủ tài khoản.");
        }
      }

      await resolveBookingProposal(b.booking_id, {
        decision,
        bankName:
          decision === "full_refund" ||
          (decision === "reschedule" && isExcessRefund)
            ? finalBank
            : undefined,
        bankAccountNumber:
          decision === "full_refund" ||
          (decision === "reschedule" && isExcessRefund)
            ? bankAccountNumber.trim()
            : undefined,
        bankAccountName:
          decision === "full_refund" ||
          (decision === "reschedule" && isExcessRefund)
            ? bankAccountName.trim().toUpperCase()
            : undefined,
        supportNote:
          decision === "contact_support" ? supportNote.trim() : undefined,
      });

      if (decision === "full_refund") {
        toast.success("Đã ghi nhận yêu cầu hoàn tiền 100%!");
      } else if (decision === "reschedule") {
        toast.success("Đã dời sang đợt khởi hành mới thành công!");
      } else {
        toast.success("Đã gửi yêu cầu hỗ trợ khác đến ban quản trị!");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Thao tác thất bại.";
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 1. TRƯỜNG HỢP: ĐÃ HOÀN TIỀN THÀNH CÔNG (CÓ MÃ GIAO DỊCH CHUYỂN KHOẢN)
  if (proposal.refundTransfer) {
    return (
      <div className="w-[min(1430px,_93%)] mx-auto mt-4 mb-2 rounded-2xl border border-emerald-300 bg-emerald-50/95 p-4.5 shadow-sm text-emerald-950">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <CheckCircle2 size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-emerald-950">
                Đã hoàn tiền 100% thành công
              </h3>
              <span className="inline-flex items-center rounded-full bg-emerald-200/90 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-900">
                Đã thanh toán {formatVND(proposal.refundTransfer.amount)}
              </span>
            </div>
            <p className="mt-1 text-xs text-emerald-800 leading-relaxed">
              Số tiền <strong>{formatVND(proposal.refundTransfer.amount)}</strong> đã được chuyển hoàn vào tài khoản ngân hàng của quý khách.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] text-emerald-900 bg-white/70 p-2.5 rounded-xl border border-emerald-200">
              <span>
                Mã giao dịch:{" "}
                <strong className="font-mono text-emerald-800 font-bold">
                  {proposal.refundTransfer.transactionCode || "—"}
                </strong>
              </span>
              <span>·</span>
              <span>
                Thời gian:{" "}
                <strong>
                  {formatDateVi(proposal.refundTransfer.transferredAt)}
                </strong>
              </span>
              {proposal.refundTransfer.note && (
                <>
                  <span>·</span>
                  <span>
                    Ghi chú: <em>{proposal.refundTransfer.note}</em>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. TRƯỜNG HỢP: KHÁCH ĐÃ CHỌN HOÀN TIỀN, ĐANG CHỜ KẾ TOÁN CHUYỂN KHOẢN
  if (status === "accepted_refund" || b.status === "refund_pending") {
    return (
      <div className="w-[min(1430px,_93%)] mx-auto mt-4 mb-2 rounded-2xl border border-amber-300 bg-amber-50/95 p-4.5 shadow-sm text-amber-950">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <Clock size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-amber-950">
                Đã tiếp nhận yêu cầu hoàn tiền 100%
              </h3>
              <span className="inline-flex items-center rounded-full bg-amber-200/90 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-900">
                Chờ chuyển khoản
              </span>
            </div>
            <p className="mt-1 text-xs text-amber-900 leading-relaxed">
              Yêu cầu hoàn tiền của bạn đã được ghi nhận. Bộ phận kế toán đang tiến hành giải ngân chuyển khoản về tài khoản ngân hàng đã đăng ký. Quý khách vui lòng kiểm tra biến động số dư trong vòng 1-3 ngày làm việc.
            </p>
            {proposal.customerBankInfo && (
              <div className="mt-2.5 rounded-xl bg-white/80 p-3 border border-amber-200/90 text-xs space-y-1">
                <span className="text-[10.5px] uppercase font-bold text-slate-500 block">
                  Tài khoản nhận tiền hoàn:
                </span>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px]">
                  <span>
                    Ngân hàng:{" "}
                    <strong>{proposal.customerBankInfo.bankName}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Số TK:{" "}
                    <strong className="font-mono text-blue-700">
                      {proposal.customerBankInfo.bankAccountNumber}
                    </strong>
                  </span>
                  <span>·</span>
                  <span>
                    Chủ TK:{" "}
                    <strong className="uppercase">
                      {proposal.customerBankInfo.bankAccountName}
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. TRƯỜNG HỢP: KHÁCH ĐÃ CHỌN DỜI LỊCH THÀNH CÔNG
  if (status === "accepted_reschedule") {
    return (
      <div className="w-[min(1430px,_93%)] mx-auto mt-4 mb-2 rounded-2xl border border-blue-200 bg-blue-50/95 p-4.5 shadow-sm text-blue-950">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <CheckCircle2 size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-blue-950">
                Đã dời lịch tour thành công
              </h3>
              <span className="inline-flex items-center rounded-full bg-blue-200/90 px-2.5 py-0.5 text-[11px] font-extrabold text-blue-900">
                Lịch mới đã cập nhật
              </span>
            </div>
            <p className="mt-1 text-xs text-blue-800 leading-relaxed">
              Bạn đã đồng ý chuyển chuyến đi sang đợt khởi hành:{" "}
              <strong>
                {formatDateVi(proposal.newScheduleStart)} –{" "}
                {formatDateVi(proposal.newScheduleEnd)}
              </strong>
              . Toàn bộ thông tin hành khách đã được cập nhật sang đợt khởi hành mới.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. TRƯỜNG HỢP: KHÁCH YÊU CẦU HỖ TRỢ ĐỔI PHƯƠNG ÁN KHÁC
  if (status === "contact_support") {
    return (
      <div className="w-[min(1430px,_93%)] mx-auto mt-4 mb-2 rounded-2xl border border-amber-300 bg-amber-50/95 p-4.5 shadow-sm text-amber-950">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
            <PhoneCall size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-amber-950">
              Đã ghi nhận yêu cầu hỗ trợ đổi phương án
            </h3>
            <p className="mt-1 text-xs text-amber-900 leading-relaxed">
              Nhân viên tư vấn sẽ liên hệ trực tiếp qua số điện thoại{" "}
              <strong>{b.contact_phone}</strong> để hỗ trợ đổi sang lịch trình phù hợp hơn cho quý khách.
            </p>
            {proposal.supportNote && (
              <p className="mt-2 text-xs italic text-amber-900 bg-white/70 p-2 rounded-lg border border-amber-200">
                Ghi chú của bạn: &ldquo;{proposal.supportNote}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 5. TRƯỜNG HỢP CHÍNH: PENDING CUSTOMER -> HIỂN THỊ HỘP THOẠI ĐỀ XUẤT ĐỂ KHÁCH HÀNG TỰ CHỌN
  return (
    <div className="w-[min(1430px,_93%)] mx-auto mt-4 mb-3 rounded-2xl border-2 border-emerald-400 bg-[linear-gradient(135deg,#f0fdf4_0%,#eff6ff_50%,#f5f3ff_100%)] p-5 shadow-md text-slate-900">
      {/* Header Thông báo */}
      <div className="flex items-start gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
          <CalendarSync size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-black text-slate-900">
              Thông báo điều chỉnh chuyến đi từ Ban quản trị
            </h3>
            <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-extrabold">
              Cần bạn xác nhận
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-700 leading-relaxed">
            Do nguyên nhân khách quan / thời tiết hoặc sự cố vận hành, chuyến đi ban đầu không thể thực hiện theo đúng kế hoạch. Ban tổ chức đã gửi các phương án giải quyết dưới đây để bảo lưu quyền lợi trọn vẹn của bạn. Vui lòng xem và chọn phương án phù hợp:
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-medium">
          {errorMessage}
        </div>
      )}

      {/* Bộ nút lựa chọn phương án (Nếu Admin cho phép cả 2 phương án) */}
      <div className="mt-4 space-y-4">
        {allowedOptions.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Lựa chọn 1: Hoàn tiền 100% */}
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setSelectedOption("full_refund");
                setShowSupportBox(false);
              }}
              className={`p-3.5 rounded-xl border-2 text-left transition cursor-pointer flex items-start gap-3 ${
                selectedOption === "full_refund" && !showSupportBox
                  ? "border-emerald-500 bg-white shadow-sm ring-2 ring-emerald-500/20"
                  : "border-slate-200 bg-white/70 hover:bg-white text-slate-700"
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  selectedOption === "full_refund" && !showSupportBox
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <CircleDollarSign size={20} />
              </div>
              <div>
                <strong className="block text-xs font-bold text-slate-900">
                  Phương án 1: Hoàn tiền 100%
                </strong>
                <span className="block text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Nhận lại <strong>{formatVND(refundAmount)}</strong> về tài khoản ngân hàng, không mất bất kỳ khoản phí nào.
                </span>
              </div>
            </button>

            {/* Lựa chọn 2: Dời sang đợt khác */}
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setSelectedOption("reschedule");
                setShowSupportBox(false);
              }}
              className={`p-3.5 rounded-xl border-2 text-left transition cursor-pointer flex items-start gap-3 ${
                selectedOption === "reschedule" && !showSupportBox
                  ? "border-blue-500 bg-white shadow-sm ring-2 ring-blue-500/20"
                  : "border-slate-200 bg-white/70 hover:bg-white text-slate-700"
              }`}
            >
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  selectedOption === "reschedule" && !showSupportBox
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                <CalendarSync size={20} />
              </div>
              <div>
                <strong className="block text-xs font-bold text-slate-900">
                  Phương án 2: Dời sang đợt khởi hành khác
                </strong>
                <span className="block text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Khởi hành: <strong>{formatDateVi(proposal.newScheduleStart)}</strong> – <strong>{formatDateVi(proposal.newScheduleEnd)}</strong>.
                </span>
              </div>
            </button>
          </div>
        )}

        {/* CHI TIẾT THEO PHƯƠNG ÁN ĐƯỢC CHỌN */}

        {/* PHƯƠNG ÁN 1: HOÀN TIỀN 100% */}
        {selectedOption === "full_refund" && !showSupportBox && (
          <div className="rounded-xl border border-emerald-300 bg-white p-4.5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900">
                Xác nhận nhận hoàn trả 100% số tiền ({formatVND(refundAmount)})
              </span>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Miễn phí phạt 100%
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Vui lòng điền thông tin tài khoản ngân hàng chính chủ của bạn để ban tổ chức thực hiện lệnh chuyển khoản hoàn tiền:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Ngân hàng */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Ngân hàng <span className="text-rose-500">*</span>
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full h-9 rounded-xl border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none"
                >
                  {POPULAR_VIETNAMESE_BANKS.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
                {bankName === "Khác" && (
                  <input
                    type="text"
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    placeholder="Nhập tên ngân hàng..."
                    className="mt-1.5 w-full h-8.5 rounded-xl border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                  />
                )}
              </div>

              {/* Số tài khoản */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Số tài khoản <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="Ví dụ: 190368291..."
                  className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 font-mono text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Tên chủ tài khoản */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Chủ tài khoản <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={(e) =>
                    setBankAccountName(e.target.value.toUpperCase())
                  }
                  placeholder="NGUYEN VAN A"
                  className="w-full h-9 rounded-xl border border-slate-300 bg-white px-3 text-xs font-bold uppercase text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleResolve("full_refund")}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Đang gửi xác nhận...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Xác nhận nhận hoàn tiền 100%</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* PHƯƠNG ÁN 2: DỜI SANG ĐỢT KHÁC */}
        {selectedOption === "reschedule" && !showSupportBox && (
          <div className="rounded-xl border border-blue-300 bg-white p-4.5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-900">
                Xác nhận dời lịch sang đợt khởi hành mới
              </span>
              <span className="text-[11px] text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Bảo lưu quyền lợi
              </span>
            </div>

            {/* Thông tin đợt khởi hành thay thế */}
            <div className="rounded-xl bg-blue-50/70 border border-blue-200 p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-slate-500 text-[11px] block font-medium">
                    Ngày khởi hành mới đề xuất:
                  </span>
                  <strong className="text-blue-950 text-sm font-black">
                    {formatDateVi(proposal.newScheduleStart)} –{" "}
                    {formatDateVi(proposal.newScheduleEnd)}
                  </strong>
                </div>

                {/* Khoản chênh lệch */}
                <div className="text-right">
                  <span className="text-slate-500 text-[11px] block font-medium">
                    Chênh lệch chi phí:
                  </span>
                  {isDiffWaived ? (
                    <span className="text-emerald-700 font-bold">
                      0 đ (Công ty hỗ trợ toàn bộ phần chênh lệch)
                    </span>
                  ) : priceDiff > 0 ? (
                    <span className="text-rose-600 font-bold">
                      +{formatVND(priceDiff)} (Thanh toán bổ sung)
                    </span>
                  ) : priceDiff < 0 ? (
                    <span className="text-emerald-700 font-bold">
                      −{formatVND(Math.abs(priceDiff))} (Được hoàn lại tiền thừa)
                    </span>
                  ) : (
                    <span className="text-blue-700 font-bold">
                      0 đ (Không phát sinh chi phí)
                    </span>
                  )}
                </div>
              </div>

              {/* Nếu đợt mới rẻ hơn: khách nhập tài khoản để nhận hoàn lại tiền thừa */}
              {isExcessRefund && (
                <div className="pt-2 border-t border-blue-200/80 space-y-2">
                  <span className="text-[11px] font-bold text-blue-950 block">
                    Đợt khởi hành mới có giá thấp hơn. Quý khách vui lòng nhập tài khoản để nhận khoản hoàn lại thừa{" "}
                    <strong className="text-emerald-700">
                      {formatVND(Math.abs(priceDiff))}
                    </strong>
                    :
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full h-8.5 rounded-lg border border-slate-300 bg-white px-2.5 text-xs text-slate-800 focus:outline-none"
                      >
                        {POPULAR_VIETNAMESE_BANKS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={bankAccountNumber}
                        onChange={(e) => setBankAccountNumber(e.target.value)}
                        placeholder="Số tài khoản..."
                        className="w-full h-8.5 rounded-lg border border-slate-300 bg-white px-2.5 font-mono text-xs font-bold text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={bankAccountName}
                        onChange={(e) =>
                          setBankAccountName(e.target.value.toUpperCase())
                        }
                        placeholder="TÊN CHỦ TÀI KHOẢN"
                        className="w-full h-8.5 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-bold uppercase text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Các nút hành động */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowSupportBox(true)}
                className="text-xs font-bold text-slate-600 hover:text-blue-600 transition underline underline-offset-4 cursor-pointer"
              >
                Không phù hợp ngày này? Yêu cầu hỗ trợ phương án khác
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleResolve("reschedule")}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Đang xử lý dời lịch...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Xác nhận dời sang lịch này</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* HỘP THOẠI YÊU CẦU HỖ TRỢ PHƯƠNG ÁN KHÁC */}
        {showSupportBox && (
          <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <MessageSquare size={16} className="text-amber-600" />
                <span>Liên hệ tư vấn đổi phương án khác</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSupportBox(false)}
                className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Quay lại
              </button>
            </div>

            <p className="text-xs text-amber-900 leading-relaxed">
              Nếu bạn không thuận tiện đi vào ngày khởi hành đề xuất ở trên hoặc có nguyện vọng khác, hãy để lại ghi chú. Nhân viên hỗ trợ sẽ gọi điện cho bạn qua số{" "}
              <strong>{b.contact_phone}</strong>:
            </p>

            <textarea
              value={supportNote}
              onChange={(e) => setSupportNote(e.target.value)}
              rows={2}
              placeholder="Ví dụ: Tôi bận công tác vào ngày này, mong muốn đổi sang đợt khởi hành cuối tháng sau..."
              className="w-full rounded-xl border border-amber-300 bg-white p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowSupportBox(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleResolve("contact_support")}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    <span>Gửi yêu cầu hỗ trợ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

