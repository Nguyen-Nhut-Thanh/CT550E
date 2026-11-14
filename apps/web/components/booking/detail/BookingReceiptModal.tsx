"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FileText,
  Printer,
  X,
  XCircle,
} from "lucide-react";
import { formatVND } from "@/lib/utils/currency";
import { parseBookingNote, type BookingDetail } from "shared";

export interface BookingReceiptModalProps {
  open: boolean;
  onClose: () => void;
  booking: BookingDetail;
  mode?: "auto" | "payment" | "refund";
}

const money = (val: number | string | null | undefined) => formatVND(Number(val) || 0);

function formatDate(val?: string | null, withTime = false) {
  if (!val || Number.isNaN(new Date(val).getTime())) return "Chưa cập nhật";
  return new Date(val).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function BookingReceiptModal({
  open,
  onClose,
  booking: b,
  mode = "auto",
}: BookingReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const isCancelled =
    mode === "refund" || (mode === "auto" && b.status === "cancelled");

  const parsedNote = parseBookingNote(b.note);
  const tour = b.tour_schedules?.tours;
  const tourName = tour?.name || `Đơn đặt tour #${b.booking_id}`;

  // Danh sách giao dịch
  const payments = [...(b.payments || [])].sort(
    (a, z) => new Date(z.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const payment =
    payments.find(p => ["success", "paid", "completed"].includes(p.status.toLowerCase())) ||
    payments[0];

  const transactionCode = payment?.transaction_code || `BK${String(b.booking_id).padStart(6, "0")}`;
  const paymentMethod = payment
    ? {
        vnpay: "VNPay",
        momo: "MoMo",
        bank: "Chuyển khoản",
        bank_transfer: "Chuyển khoản",
      }[payment.method.toLowerCase()] || payment.method
    : "VNPay";

  const paymentDate = payment?.paid_at
    ? formatDate(payment.paid_at, true)
    : formatDate(b.created_at, true);

  // Chi tiết giá vé
  const rows = [
    { label: "Người lớn", quantity: b.adult_count, price: Number(b.adult_unit_price) || 0 },
    { label: "Trẻ em", quantity: b.child_count, price: Number(b.child_unit_price) || 0 },
    { label: "Em bé", quantity: b.infant_count, price: Number(b.infant_unit_price) || 0 },
  ];
  const tickets = rows.reduce((sum, row) => sum + row.quantity * row.price, 0);
  const discount = Number(b.discount_amount) || 0;
  const services = Number(b.services_total) || 0;
  const surcharge = Math.max(
    0,
    Math.round((Number(b.total_amount) + discount - tickets - services) * 100) / 100,
  );
  const extras = Array.isArray(b.additional_services) ? b.additional_services : [];
  const subtotal = tickets + services + surcharge;

  // Xử lý hoàn tiền khi hủy
  const cancelReq = parsedNote.cancelRequest;
  const cancelApproval = parsedNote.adminApproval;
  const cancellationData = parsedNote.cancellation;

  let refundAmount = 0;
  if (cancelApproval?.refundAmount) {
    const raw = cancelApproval.refundAmount.replace(/[^\d]/g, "");
    if (raw) refundAmount = Number(raw);
  } else if (cancellationData?.refundAmount) {
    const raw = cancellationData.refundAmount.replace(/[^\d]/g, "");
    if (raw) refundAmount = Number(raw);
  } else if (cancelReq?.numericRefundAmount) {
    refundAmount = cancelReq.numericRefundAmount;
  }

  const cancellationFee = Math.max(0, Number(b.total_amount) - refundAmount);

  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div
      className="receipt-modal-root fixed inset-0 z-[200] flex items-start sm:items-center justify-center overflow-y-auto bg-slate-900/75 p-2 sm:p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {/* Print CSS Rules */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @page {
              size: A4 portrait;
              margin: 12mm 12mm;
            }
            @media print {
              html,
              body {
                width: 100% !important;
                height: auto !important;
                margin: 0 !important;
                overflow: visible !important;
              }
              body > *:not(.receipt-modal-root) {
                display: none !important;
              }
              .receipt-modal-root,
              .receipt-modal-root * {
                visibility: visible !important;
              }
              #printable-booking-receipt {
                display: block !important;
                position: static !important;
                width: 100% !important;
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                flex: none !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
              }
              .receipt-modal-root {
                position: static !important;
                display: block !important;
                inset: auto !important;
                width: 100% !important;
                height: auto !important;
                max-height: none !important;
                overflow: visible !important;
                padding: 0 !important;
                background: #ffffff !important;
                backdrop-filter: none !important;
              }
              .receipt-modal-panel {
                position: static !important;
                display: block !important;
                width: 100% !important;
                height: auto !important;
                max-width: none !important;
                max-height: none !important;
                overflow: visible !important;
                margin: 0 !important;
                border: 0 !important;
                border-radius: 0 !important;
                background: #ffffff !important;
                box-shadow: none !important;
              }
              .receipt-paper {
                border: 1.5px solid #94b8e8 !important;
                border-radius: 14px !important;
                padding: 22px 24px !important;
                margin: 0 auto !important;
                max-width: 100% !important;
                box-sizing: border-box !important;
                background: #ffffff !important;
                box-shadow: none !important;
                page-break-inside: auto !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `,
        }}
      />

      {/* Container card của Modal: Giới hạn chiều cao vừa vặn màn hình (không bao giờ bị tràn/mất mép trên) */}
      <div className="receipt-modal-panel relative my-auto flex max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] w-full max-w-[820px] flex-col rounded-2xl bg-slate-50/95 shadow-2xl overflow-hidden border border-slate-200">
        {/* Thanh công cụ Modal Header (In & Đóng) - CỐ ĐỊNH TRÊN CÙNG - ẨN KHI IN */}
        <div className="no-print flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2">
            <FileText className="text-blue-600" size={17} />
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              {isCancelled ? "Biên nhận hủy tour & Quyết toán hoàn tiền" : "Biên lai thanh toán điện tử"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white transition shadow-xs cursor-pointer"
            >
              <Printer size={14} />
              <span>In / Lưu PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
              aria-label="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* NỘI DUNG BIÊN LAI (PRINTABLE SECTION)                   */}
        {/* ======================================================== */}
        <div
          id="printable-booking-receipt"
          ref={receiptRef}
          className="flex-1 overflow-y-auto p-3 sm:p-5 custom-scrollbar text-[#0f294d] print:overflow-visible print:p-0 print:bg-white"
        >
          {/* KHUNG GIẤY BIÊN LAI (VIỀN CHỐNG SÁT RÌA & CÁCH LỀ GIẤY KHI IN) */}
          <div className="receipt-paper mx-auto w-full max-w-[760px] rounded-2xl border-2 border-[#cfe2fe] bg-white p-4.5 sm:p-6 shadow-sm">
            {/* HEADER CHÍNH */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3.5 border-b border-slate-100">
              <div>
                <h1 className="text-2xl sm:text-[25px] font-black tracking-tight text-[#003580] uppercase">
                  JOURNITRIP
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Khám phá thế giới cùng bạn
                </p>
              </div>
              <div className="sm:text-right">
                <h2 className="text-xl sm:text-[22px] font-black tracking-tight text-[#003580] uppercase">
                  {isCancelled ? "BIÊN NHẬN HỦY TOUR" : "BIÊN LAI THANH TOÁN"}
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {isCancelled
                    ? "Xác nhận hủy booking và quyết toán hoàn tiền"
                    : "Xác nhận booking đã thanh toán thành công"}
                </p>
              </div>
            </div>

            {/* DÒNG TÓM TẮT TRẠNG THÁI & GIAO DỊCH (4 CỘT) */}
            <div className="mt-3.5 rounded-xl border border-[#cfe2fe] bg-[#f0f7ff] p-3 sm:px-4 sm:py-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Trạng thái
                  </span>
                  <span
                    className={`mt-0.5 flex items-center gap-1.5 text-xs sm:text-[13px] font-bold ${
                      isCancelled ? "text-rose-600" : "text-emerald-700"
                    }`}
                  >
                    {isCancelled ? (
                      <>
                        <XCircle size={14} className="shrink-0 text-rose-500" />
                        <span>ĐÃ HỦY TOUR</span>
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-600" />
                        <span>ĐÃ THANH TOÁN</span>
                      </>
                    )}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Phương thức
                  </span>
                  <span className="mt-0.5 block text-xs sm:text-[13px] font-bold text-slate-800">
                    {isCancelled ? "Hoàn tiền chuyển khoản" : paymentMethod}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Mã giao dịch
                  </span>
                  <span className="mt-0.5 block text-xs sm:text-[13px] font-bold text-slate-800 truncate">
                    {transactionCode}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {isCancelled ? "Ngày duyệt hủy" : "Ngày đặt / Thanh toán"}
                  </span>
                  <span className="mt-0.5 block text-xs sm:text-[13px] font-bold text-slate-800">
                    {isCancelled
                      ? cancellationData?.time || parsedNote.cancellationTime || formatDate(new Date().toISOString(), true)
                      : paymentDate}
                  </span>
                </div>
              </div>
            </div>

            {/* THÔNG TIN NGƯỜI ĐẶT & THÔNG TIN TOUR (2 CỘT CÓ VIỀN) */}
            <div className="mt-3.5 overflow-hidden rounded-xl border border-[#cfe2fe] bg-white">
              <div className="grid grid-cols-1 divide-y divide-[#cfe2fe] sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
                {/* Cột 1: Thông tin người đặt tour */}
                <div className="p-3.5 space-y-1.5 text-xs leading-relaxed">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#003580] pb-0.5">
                    Thông tin người đặt tour
                  </h3>
                  <p>
                    <strong className="text-slate-600 font-semibold">Họ và tên:</strong>{" "}
                    <span className="font-bold text-slate-900">{b.contact_name}</span>
                  </p>
                  <p>
                    <strong className="text-slate-600 font-semibold">Số điện thoại:</strong>{" "}
                    <span className="text-slate-800">{b.contact_phone}</span>
                  </p>
                  <p>
                    <strong className="text-slate-600 font-semibold">Email:</strong>{" "}
                    <span className="text-slate-800">{b.contact_email}</span>
                  </p>
                </div>

                {/* Cột 2: Thông tin tour */}
                <div className="p-3.5 space-y-1.5 text-xs leading-relaxed">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#003580] pb-0.5">
                    Thông tin tour
                  </h3>
                  <p>
                    <strong className="text-slate-600 font-semibold">Tên tour:</strong>{" "}
                    <span className="font-bold text-slate-900">{tourName}</span>
                  </p>
                  <p>
                    <strong className="text-slate-600 font-semibold">Mã tour:</strong>{" "}
                    <span className="text-slate-800">{tour?.code || "Chưa cập nhật"}</span>
                  </p>
                  <p>
                    <strong className="text-slate-600 font-semibold">Ngày khởi hành:</strong>{" "}
                    <span className="text-slate-800">{formatDate(b.tour_schedules?.start_date)}</span>
                  </p>
                  <p>
                    <strong className="text-slate-600 font-semibold">Thời gian:</strong>{" "}
                    <span className="text-slate-800">
                      {tour ? `${tour.duration_days} ngày ${tour.duration_nights} đêm` : "Chưa cập nhật"}
                    </span>
                  </p>
                  <p>
                    <strong className="text-slate-600 font-semibold">Điểm khởi hành:</strong>{" "}
                    <span className="text-slate-800">
                      {b.departure_name || b.tour_schedules?.departure_location?.name || "Chưa cập nhật"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* DANH SÁCH HÀNH KHÁCH */}
            <div className="mt-3.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#003580] mb-1.5">
                Thông tin hành khách
              </h3>
              <div className="overflow-hidden rounded-xl border border-[#cfe2fe]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f0f7ff] text-[#003580]">
                    <tr>
                      <th className="px-3.5 py-2 font-bold uppercase text-[10px] tracking-wider">Họ tên</th>
                      <th className="px-3.5 py-2 font-bold uppercase text-[10px] tracking-wider">Ngày sinh</th>
                      <th className="px-3.5 py-2 font-bold uppercase text-[10px] tracking-wider">Giới tính</th>
                      <th className="px-3.5 py-2 font-bold uppercase text-[10px] tracking-wider">Giấy tờ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#edf4fc] bg-white">
                    {b.booking_travelers && b.booking_travelers.length > 0 ? (
                      b.booking_travelers.map(traveler => (
                        <tr key={traveler.traveler_id}>
                          <td className="px-3.5 py-2 font-semibold text-slate-800">
                            {traveler.full_name}
                          </td>
                          <td className="px-3.5 py-2 text-slate-600">
                            {formatDate(traveler.dob)}
                          </td>
                          <td className="px-3.5 py-2 text-slate-600">
                            {{ male: "Nam", female: "Nữ", other: "Khác" }[
                              traveler.gender?.toLowerCase() || ""
                            ] || traveler.gender || "—"}
                          </td>
                          <td className="px-3.5 py-2 text-slate-600">
                            {traveler.id_number || "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-3.5 py-2 font-semibold text-slate-800">
                          {b.contact_name}
                        </td>
                        <td className="px-3.5 py-2 text-slate-600">—</td>
                        <td className="px-3.5 py-2 text-slate-600">—</td>
                        <td className="px-3.5 py-2 text-slate-600">—</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CHI TIẾT THANH TOÁN HOẶC QUYẾT TOÁN HỦY */}
            {!isCancelled ? (
              /* TRƯỜNG HỢP: ĐÃ THANH TOÁN (CHI TIẾT THANH TOÁN) */
              <div className="mt-3.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#003580] mb-1.5">
                  Chi tiết thanh toán
                </h3>
                <div className="overflow-hidden rounded-xl border border-[#cfe2fe]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f0f7ff] text-[#003580]">
                      <tr>
                        <th className="px-3.5 py-2 font-bold uppercase text-[10px] tracking-wider">Hạng mục</th>
                        <th className="px-3.5 py-2 text-center font-bold uppercase text-[10px] tracking-wider">Số lượng</th>
                        <th className="px-3.5 py-2 text-right font-bold uppercase text-[10px] tracking-wider">Đơn giá</th>
                        <th className="px-3.5 py-2 text-right font-bold uppercase text-[10px] tracking-wider">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf4fc] bg-white">
                      {rows.map(row => (
                        <tr key={row.label}>
                          <td className="px-3.5 py-2 font-medium text-slate-800">{row.label}</td>
                          <td className="px-3.5 py-2 text-center text-slate-600">{row.quantity}</td>
                          <td className="px-3.5 py-2 text-right text-slate-600">{money(row.price)}</td>
                          <td className="px-3.5 py-2 text-right font-bold text-slate-900">
                            {money(row.quantity * row.price)}
                          </td>
                        </tr>
                      ))}
                      {extras.map((item, index) => (
                        <tr key={`${item.id}-${index}`}>
                          <td className="px-3.5 py-2 font-medium text-slate-800">{item.name}</td>
                          <td className="px-3.5 py-2 text-center text-slate-600">{item.quantity}</td>
                          <td className="px-3.5 py-2 text-right text-slate-600">{money(item.unit_price)}</td>
                          <td className="px-3.5 py-2 text-right font-bold text-slate-900">
                            {money(item.amount)}
                          </td>
                        </tr>
                      ))}
                      {services > 0 && !extras.length && (
                        <tr>
                          <td className="px-3.5 py-2 font-medium text-slate-800">Dịch vụ bổ sung</td>
                          <td className="px-3.5 py-2 text-center text-slate-600">1</td>
                          <td className="px-3.5 py-2 text-right text-slate-600">{money(services)}</td>
                          <td className="px-3.5 py-2 text-right font-bold text-slate-900">{money(services)}</td>
                        </tr>
                      )}
                      {surcharge > 0 && (
                        <tr>
                          <td className="px-3.5 py-2 font-medium text-slate-800">Phụ thu phòng đơn</td>
                          <td className="px-3.5 py-2 text-center text-slate-600">1</td>
                          <td className="px-3.5 py-2 text-right text-slate-600">{money(surcharge)}</td>
                          <td className="px-3.5 py-2 text-right font-bold text-slate-900">{money(surcharge)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* TRƯỜNG HỢP: HỦY TOUR (BẢNG QUYẾT TOÁN HOÀN TIỀN) */
              <div className="mt-3.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#003580] mb-1.5">
                  Chi tiết quyết toán hoàn tiền
                </h3>
                <div className="overflow-hidden rounded-xl border border-[#cfe2fe]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f0f7ff] text-[#003580]">
                      <tr>
                        <th className="px-3.5 py-2 font-bold uppercase text-[10px] tracking-wider">Hạng mục quyết toán</th>
                        <th className="px-3.5 py-2 font-bold uppercase text-[10px] tracking-wider">Căn cứ / Chi tiết</th>
                        <th className="px-3.5 py-2 text-right font-bold uppercase text-[10px] tracking-wider">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf4fc] bg-white">
                      <tr>
                        <td className="px-3.5 py-2 font-semibold text-slate-800">
                          1. Tổng số tiền đã thanh toán
                        </td>
                        <td className="px-3.5 py-2 text-slate-600">
                          Theo giao dịch {transactionCode} qua {paymentMethod}
                        </td>
                        <td className="px-3.5 py-2 text-right font-bold text-slate-900">
                          +{money(b.total_amount)}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-3.5 py-2 font-semibold text-rose-700">
                          2. Phí hủy tour theo quy định
                        </td>
                        <td className="px-3.5 py-2 text-slate-600">
                          {cancelReq?.tierPenalty || "Theo chính sách hủy tour của JourniTrip"}
                        </td>
                        <td className="px-3.5 py-2 text-right font-bold text-rose-600">
                          -{money(cancellationFee)}
                        </td>
                      </tr>
                      <tr className="bg-emerald-50/50">
                        <td className="px-3.5 py-2 font-bold text-emerald-800">
                          3. Số tiền hoàn thực nhận (1 - 2)
                        </td>
                        <td className="px-3.5 py-2 text-xs text-emerald-700 font-medium">
                          Chuyển khoản về tài khoản ngân hàng của khách
                        </td>
                        <td className="px-3.5 py-2 text-right font-extrabold text-emerald-700">
                          ={money(refundAmount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* KHỐI THÔNG TIN BỔ SUNG & TỔNG KẾT (2 CỘT CÓ VIỀN) */}
            <div className="mt-3.5 overflow-hidden rounded-xl border border-[#cfe2fe]">
              <div className="grid grid-cols-1 divide-y divide-[#cfe2fe] sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
                {/* Vế trái: Thông tin bổ sung */}
                <div className="p-3.5 space-y-1.5 text-xs bg-white">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#003580] pb-0.5">
                    {isCancelled ? "Thông tin hoàn tiền & Lý do" : "Thông tin bổ sung"}
                  </h3>
                  {!isCancelled ? (
                    <>
                      <p>
                        <strong className="text-slate-600 font-semibold">Voucher:</strong>{" "}
                        <span className="text-slate-800">
                          {b.vouchers?.code || "Không áp dụng"}
                        </span>
                      </p>
                      <p>
                        <strong className="text-slate-600 font-semibold">Loại phòng:</strong>{" "}
                        <span className="text-slate-800">
                          {parsedNote.roomType || "Ghép phòng theo tiêu chuẩn đoàn"}
                        </span>
                      </p>
                      <p>
                        <strong className="text-slate-600 font-semibold">Phụ thu phòng đơn:</strong>{" "}
                        <span className="text-slate-800">{money(surcharge)}</span>
                      </p>
                      <p className="line-clamp-2">
                        <strong className="text-slate-600 font-semibold">Điểm đón:</strong>{" "}
                        <span className="text-slate-800">
                          {b.pickup_snapshot?.address
                            ? `${b.pickup_snapshot.name} — ${b.pickup_snapshot.address}`
                            : b.pickup_snapshot?.name || "Điểm đón mặc định của đoàn"}
                        </span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong className="text-slate-600 font-semibold">Lý do hủy:</strong>{" "}
                        <span className="text-slate-800">
                          {cancellationData?.reason ||
                            cancelReq?.reason ||
                            parsedNote.cancellationReason ||
                            "Hủy theo yêu cầu của khách"}
                        </span>
                      </p>
                      {cancelReq?.bankName && (
                        <p>
                          <strong className="text-slate-600 font-semibold">Ngân hàng nhận:</strong>{" "}
                          <span className="text-slate-800">{cancelReq.bankName}</span>
                        </p>
                      )}
                      {cancelReq?.bankAccountNumber && (
                        <p>
                          <strong className="text-slate-600 font-semibold">Số tài khoản:</strong>{" "}
                          <span className="font-bold text-slate-800">{cancelReq.bankAccountNumber}</span>
                        </p>
                      )}
                      {cancelReq?.bankAccountName && (
                        <p>
                          <strong className="text-slate-600 font-semibold">Chủ tài khoản:</strong>{" "}
                          <span className="text-slate-800 uppercase font-semibold">{cancelReq.bankAccountName}</span>
                        </p>
                      )}
                      <p>
                        <strong className="text-slate-600 font-semibold">Ghi chú đối soát:</strong>{" "}
                        <span className="text-slate-800">
                          {cancelApproval?.note || "Đã phê duyệt hoàn tất theo quy chế"}
                        </span>
                      </p>
                    </>
                  )}
                </div>

                {/* Vế phải: Tổng kết tài chính */}
                <div className="flex flex-col justify-between p-3.5 bg-[#f0f7ff] text-right">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#003580] pb-0.5 text-left sm:text-right">
                    Tổng kết
                  </h3>
                  <div className="space-y-1 text-xs text-slate-600 my-auto py-1.5">
                    {!isCancelled ? (
                      <>
                        <div className="flex justify-between sm:justify-end gap-4">
                          <span>Tạm tính:</span>
                          <strong className="text-slate-800">{money(subtotal)}</strong>
                        </div>
                        <div className="flex justify-between sm:justify-end gap-4">
                          <span>Giảm giá:</span>
                          <span className="font-semibold text-rose-600">
                            {discount > 0 ? `-${money(discount)}` : "0 đ"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between sm:justify-end gap-4">
                          <span>Số tiền đã thanh toán:</span>
                          <strong className="text-slate-800">{money(b.total_amount)}</strong>
                        </div>
                        <div className="flex justify-between sm:justify-end gap-4">
                          <span>Phí hủy tour:</span>
                          <span className="font-semibold text-rose-600">
                            -{money(cancellationFee)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#cfe2fe]">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {isCancelled ? "Tổng tiền thực hoàn" : "Tổng thanh toán"}
                    </span>
                    <div
                      className={`text-xl sm:text-[24px] font-black tracking-tight ${
                        isCancelled ? "text-emerald-600" : "text-[#0284c7]"
                      }`}
                    >
                      {isCancelled ? money(refundAmount) : money(b.total_amount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER & LỜI CẢM ƠN */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-center sm:text-left space-y-1">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#003580]">
                CẢM ƠN BẠN ĐÃ ĐỒNG HÀNH CÙNG JOURNITRIP!
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-500">
                {isCancelled
                  ? "JourniTrip rất tiếc vì chuyến đi chưa thể diễn ra như dự định. Tiền hoàn sẽ được chuyển về tài khoản ngân hàng của bạn theo quy định."
                  : "Biên lai này xác nhận JourniTrip đã ghi nhận khoản thanh toán cho booking trên. Vui lòng lưu email này để đối chiếu khi cần hỗ trợ."}
              </p>
              <p className="text-[10px] italic text-slate-400 pt-0.5">
                Lưu ý: Đây là biên lai xác nhận thanh toán, không thay thế hóa đơn giá trị gia tăng (VAT).
              </p>
            </div>
          </div>
        </div>

        {/* Thanh công cụ Modal Footer (In & Đóng) - CỐ ĐỊNH CHÂN MODAL - ẨN KHI IN */}
        <div className="no-print flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-white px-4 py-2.5 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-700 transition shadow-2xs cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-xs font-bold text-white transition shadow-xs cursor-pointer"
          >
            <Printer size={14} />
            <span>In biên lai / Lưu PDF</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
