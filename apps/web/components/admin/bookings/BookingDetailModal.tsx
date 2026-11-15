"use client";

import { ImageWithFallback } from "@/components/common/media/ImageWithFallback";
import { BookingReceiptModal } from "@/components/booking/detail/BookingReceiptModal";
import { getAdminBookingDetail } from "@/lib/admin/bookings/api";
import { formatVND } from "@/lib/utils/currency";
import {
  AlertCircle,
  AlertTriangle,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  Loader2,
  MapPin,
  Plane,
  ReceiptText,
  Ticket,
  Trash2,
  UserRound,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { parseBookingNote, type AdminBooking } from "shared";

const money = (value: number | string | null | undefined) => formatVND(Number(value) || 0);

function date(value?: string | null, withTime = false) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "Chưa cập nhật";
  return new Date(value).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function bookingStatus(value?: string | null) {
  const status = (value || "").toLowerCase();
  if (["cancelled", "canceled", "đã hủy"].includes(status)) return { label: "Đã hủy", tone: "cancelled" };
  if (status === "cancel_requested") return { label: "Yêu cầu hủy", tone: "cancel_requested" };
  if (["completed", "đã hoàn thành"].includes(status)) return { label: "Đã hoàn thành", tone: "success" };
  if (["paid", "confirmed"].includes(status)) return { label: status === "paid" ? "Đã thanh toán" : "Đã xác nhận", tone: "success" };
  if (status === "pending") return { label: "Chờ thanh toán", tone: "pending" };
  return { label: value || "Chưa cập nhật", tone: "pending" };
}

function StatusBadge({ value }: { value?: string | null }) {
  const status = bookingStatus(value);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[30px] text-[12px] font-[750] whitespace-nowrap px-[13px] py-[6px] gap-[6px] ${
        status.tone === "cancelled"
          ? "bg-[#ffe6ec] text-[#f32750]"
          : status.tone === "cancel_requested"
            ? "bg-rose-100 text-rose-700 border border-rose-300"
            : status.tone === "success"
              ? "bg-[#def8ec] text-[#087e57]"
              : "bg-[#fff1cf] text-[#97600b]"
      }`}
    >
      <CalendarDays size={14} />
      {status.label}
    </span>
  );
}

function SectionTitle({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-center mb-4 gap-[14px]">
      <span className="grid place-items-center [background:linear-gradient(135deg,_#eaf5ff,_#e2f0ff)] text-[#0064ff] rounded-full w-11 h-11 shrink-0">
        {icon}
      </span>
      <div>
        <h3 className="text-[15px] font-extrabold tracking-[-.02em] text-[#092448] leading-[1.35]">
          {title}
        </h3>
        <p className="text-[11px] leading-[1.6] text-[#627fa3] mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <div
      className={`[background:linear-gradient(125deg,_#f3f8fd,_#f6faff)] rounded-[14px] min-w-0 px-4 py-[13px] ${
        wide ? "col-span-full" : ""
      }`}
    >
      <dt className="text-[10px] uppercase tracking-[.075em] text-[#6283af] mb-1 font-semibold">{label}</dt>
      <dd className="text-[13px] leading-[1.6] font-[650] text-[#092448] break-words">{children || "Chưa cập nhật"}</dd>
    </div>
  );
}

export function getDisplayBookingNote(note?: string | null, meta?: any) {
  if (!note && !meta) return "";
  const parsed = parseBookingNote(note, meta);
  return parsed.customerNote;
}

export interface BookingDetailModalProps {
  bookingId?: number | null;
  booking?: AdminBooking | null;
  open: boolean;
  onClose: () => void;
  onAction?: (
    booking: AdminBooking,
    type: "approve" | "reject" | "cancel-pending" | "cancel-booking",
  ) => void;
}

export function BookingDetailModal({
  bookingId,
  booking: initialBooking,
  open,
  onClose,
  onAction,
}: BookingDetailModalProps) {
  const [fetchedBooking, setFetchedBooking] = useState<AdminBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const b = (initialBooking || fetchedBooking) as (AdminBooking & Record<string, any>) | null;
  const activeId = initialBooking?.booking_id ?? bookingId;

  useEffect(() => {
    if (!open) {
      setFetchedBooking(null);
      setError(null);
      return;
    }

    if (initialBooking) {
      setFetchedBooking(null);
      return;
    }

    if (!bookingId) return;

    let active = true;
    setLoading(true);
    setError(null);

    getAdminBookingDetail<AdminBooking>(bookingId)
      .then((data) => {
        if (active) setFetchedBooking(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Không thể tải thông tin đơn hàng.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, bookingId, initialBooking]);

  // Đóng modal khi nhấn phím Escape (chỉ khi không mở modal biên lai con)
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (receiptModalOpen) return;
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, receiptModalOpen]);

  if (!open || (!bookingId && !initialBooking)) return null;

  const tour = b?.tour_schedules?.tours;
  const tourName = tour?.name || (b ? `Đơn đặt tour #${b.booking_id}` : "");
  const tourSummary = tour?.summary?.trim() || (tour?.description ? tour.description.replace(/<[^>]*>/g, "").trim() : "");

  const rows = b
    ? [
        { label: "Người lớn", quantity: b.adult_count || 0, price: Number(b.adult_unit_price) || 0 },
        { label: "Trẻ em", quantity: b.child_count || 0, price: Number(b.child_unit_price) || 0 },
        { label: "Em bé", quantity: b.infant_count || 0, price: Number(b.infant_unit_price) || 0 },
      ]
    : [];
  const tickets = rows.reduce((sum, row) => sum + row.quantity * row.price, 0);
  const discount = b ? Number(b.discount_amount) || 0 : 0;
  const services = b ? Number(b.services_total) || 0 : 0;
  const surcharge = b ? Math.max(0, Math.round((Number(b.total_amount) + discount - tickets - services) * 100) / 100) : 0;
  const extras = Array.isArray(b?.additional_services) ? b.additional_services : [];
  const payments = [...(b?.payments || [])].sort((a, z) => new Date(z.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  const payment = payments.find((item) => ["success", "paid", "completed"].includes((item.status || "").toLowerCase())) || payments[0];
  const paymentStatus = payment
    ? ({
        success: "Đã thanh toán",
        paid: "Đã thanh toán",
        completed: "Đã thanh toán",
        pending: "Chờ thanh toán",
        failed: "Thất bại",
        refunded: "Đã hoàn tiền",
        review: "Cần đối soát",
      }[(payment.status || "").toLowerCase()] || payment.status)
    : "Chưa có giao dịch";
  const method = payment
    ? ({
        vnpay: "VNPay",
        momo: "MoMo",
        bank: "Chuyển khoản",
        bank_transfer: "Chuyển khoản",
      }[(payment.method || "").toLowerCase()] || payment.method)
    : "Chưa cập nhật";

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto overflow-x-hidden p-3 sm:p-6 flex justify-center items-start sm:items-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative z-10 my-auto flex max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3.5rem)] w-full max-w-6xl xl:max-w-7xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl border border-[#dcecff] text-[#092448]">
        {/* Nút đóng nhanh ở góc trên */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng popup"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          <X size={18} />
        </button>

        {loading ? (
          <div className="flex h-80 flex-col items-center justify-center gap-3 p-8 text-slate-500">
            <Loader2 size={36} className="animate-spin text-blue-600" />
            <p className="text-sm font-semibold text-slate-600">Đang tải chi tiết đơn hàng #{activeId}...</p>
          </div>
        ) : error ? (
          <div className="flex h-72 flex-col items-center justify-center gap-3 p-8 text-center">
            <AlertCircle size={36} className="text-rose-500" />
            <h4 className="text-base font-bold text-slate-900">Không thể tải thông tin đơn</h4>
            <p className="text-sm text-slate-500 max-w-md">{error}</p>
            <button
              type="button"
              onClick={() => {
                if (!bookingId) return;
                setLoading(true);
                setError(null);
                getAdminBookingDetail<AdminBooking>(bookingId)
                  .then(setFetchedBooking)
                  .catch((err) => setError(err instanceof Error ? err.message : "Lỗi khi tải lại."))
                  .finally(() => setLoading(false));
              }}
              className="mt-2 rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        ) : b ? (
          <>
            {/* Header Banner - Giống hệt phong cách trang Booking bên User */}
            <header className="relative isolate shrink-0 pt-5 pb-3 px-6 overflow-hidden border-b border-[#dcecff] bg-[linear-gradient(135deg,#eaf5ff_0%,#f0f8ff_60%,#e1f3ff_100%)]">
              <div
                className="absolute inset-0 z-[-2] bg-[url('/images/about/travel-dreams-banner.png')] bg-cover bg-center opacity-25"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 z-[-1] bg-[linear-gradient(90deg,#e5f4fff7_0%,#e4f4fff0_40%,#e1f3ff99_75%,#e8f9ff12_100%)]"
                aria-hidden="true"
              />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 pr-8">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="uppercase text-[10px] tracking-wider text-[#4e709b] font-extrabold bg-white/70 px-2.5 py-0.5 rounded-full border border-blue-100">
                      Chi tiết booking
                    </span>
                    <span className="text-[12px] font-bold text-[#0064ff]">
                      #{String(b.booking_id).padStart(6, "0")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h2 className="text-xl sm:text-2xl font-black tracking-[-.025em] text-[#092448] leading-[1.3]">
                      {tourName}
                    </h2>
                    <StatusBadge value={b.status} />
                    {["paid", "confirmed", "completed"].includes(b.status) && (
                      <button
                        type="button"
                        onClick={() => setReceiptModalOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-blue-700 bg-white/95 border border-blue-200 hover:bg-blue-50 transition shadow-2xs cursor-pointer ml-auto sm:ml-2"
                      >
                        <FileText size={13} className="text-blue-600" />
                        <span>Xem / In biên lai</span>
                      </button>
                    )}
                    {b.status === "cancelled" && (
                      <button
                        type="button"
                        onClick={() => setReceiptModalOpen(true)}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-rose-700 bg-white/95 border border-rose-200 hover:bg-rose-50 transition shadow-2xs cursor-pointer ml-auto sm:ml-2"
                      >
                        <FileText size={13} className="text-rose-600" />
                        <span>Xem biên nhận hoàn tiền</span>
                      </button>
                    )}
                  </div>
                  {tourSummary && (
                    <p className="text-[12px] leading-relaxed text-[#4e709b] max-w-4xl line-clamp-2 font-normal">
                      {tourSummary}
                    </p>
                  )}
                </div>
                <Plane aria-hidden="true" className="text-blue-300/60 rotate-[-12deg] shrink-0 hidden sm:block mr-8" size={38} strokeWidth={1.5} />
              </div>
            </header>

            {/* Nội dung chi tiết - 2 cột cân xứng giống bên user */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[radial-gradient(ellipse_at_25%_40%,#f6fdff,transparent_65%),#eefaff]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                {/* CỘT TRÁI: Thông tin Tour + Thông tin người đặt */}
                <div className="space-y-5">
                  {/* Card Thông tin tour */}
                  <section className="bg-white/95 rounded-[19px] shadow-sm border border-[#dcecff] p-5" aria-label="Thông tin tour">
                    <div className="flex mb-3.5 gap-4">
                      <ImageWithFallback
                        src={tour?.tour_images?.[0]?.image_url || ""}
                        alt={tourName}
                        className="w-28 h-28 object-cover rounded-[14px] shrink-0 border border-blue-50"
                      />
                      <div className="flex-1 min-w-0">
                        <SectionTitle
                          icon={<Ticket size={20} />}
                          title="Thông tin tour"
                          description="Các thông tin cơ bản của chuyến đi."
                        />
                        <Field label="Tên tour">{tourName}</Field>
                      </div>
                    </div>

                    <dl className="grid grid-cols-2 gap-2.5">
                      {[
                        { icon: Plane, label: "Mã tour", value: tour?.code || "Chưa cập nhật" },
                        { icon: CalendarDays, label: "Ngày khởi hành", value: date(b.tour_schedules?.start_date) },
                        {
                          icon: Clock3,
                          label: "Thời gian",
                          value: tour?.duration_days ? `${tour.duration_days} ngày ${tour.duration_nights || tour.duration_days - 1} đêm` : "Chưa cập nhật",
                        },
                        {
                          icon: MapPin,
                          label: "Điểm khởi hành",
                          value: b.departure_name || b.tour_schedules?.departure_location?.name || "Chưa cập nhật",
                        },
                      ].map(({ icon: Icon, label, value }) => (
                        <div
                          key={label}
                          className="flex items-center min-w-0 rounded-[12px] [background:linear-gradient(125deg,#f3f8fd,#f6faff)] px-3 py-2.5 gap-2.5"
                        >
                          <span className="grid place-items-center [background:linear-gradient(135deg,#eaf5ff,#e2f0ff)] text-[#0064ff] rounded-full w-9 h-9 shrink-0">
                            <Icon size={18} />
                          </span>
                          <div className="min-w-0">
                            <dt className="text-[9px] uppercase tracking-[.06em] text-[#6283af] mb-0.5 font-semibold">{label}</dt>
                            <dd className="text-[12px] font-[750] leading-[1.4] text-[#092448] truncate">{value}</dd>
                          </div>
                        </div>
                      ))}
                    </dl>

                    {b.pickup_snapshot && (
                      <dl className="grid grid-cols-2 gap-2.5 mt-2.5 pt-2.5 border-t border-slate-100">
                        {[
                          {
                            icon: MapPin,
                            label: "Địa điểm đón",
                            value: b.pickup_snapshot.address
                              ? `${b.pickup_snapshot.name} — ${b.pickup_snapshot.address}`
                              : b.pickup_snapshot.name,
                          },
                          {
                            icon: Clock3,
                            label: "Thời gian đón",
                            value: date(b.pickup_snapshot.pickup_at, true),
                          },
                        ].map(({ icon: Icon, label, value }) => (
                          <div
                            key={label}
                            className="flex items-center min-w-0 rounded-[12px] [background:linear-gradient(125deg,#f3f8fd,#f6faff)] px-3 py-2.5 gap-2.5 col-span-2 sm:col-span-1"
                          >
                            <span className="grid place-items-center [background:linear-gradient(135deg,#eaf5ff,#e2f0ff)] text-[#0064ff] rounded-full w-9 h-9 shrink-0">
                              <Icon size={18} />
                            </span>
                            <div className="min-w-0">
                              <dt className="text-[9px] uppercase tracking-[.06em] text-[#6283af] mb-0.5 font-semibold">{label}</dt>
                              <dd className="text-[12px] font-[750] leading-[1.4] text-[#092448] break-words">{value}</dd>
                            </div>
                          </div>
                        ))}
                      </dl>
                    )}
                  </section>

                  {/* Card Thông tin người đặt tour */}
                  <section className="bg-white/95 rounded-[19px] shadow-sm border border-[#dcecff] p-5" aria-label="Thông tin người đặt">
                    <SectionTitle
                      icon={<UserRound size={22} />}
                      title="Thông tin người đặt"
                      description="Thông tin liên hệ của khách hàng."
                    />
                    <dl className="grid grid-cols-2 gap-3">
                      <Field label="Họ và tên">{b.contact_name}</Field>
                      <Field label="Số điện thoại">{b.contact_phone}</Field>
                      <Field label="Email" wide>{b.contact_email}</Field>
                      {b.users?.accounts?.email && (
                        <Field label="Tài khoản thành viên" wide>
                          <span className="font-semibold text-blue-600">
                            {b.users.full_name || "Thành viên"} ({b.users.accounts.email})
                          </span>
                        </Field>
                      )}
                    </dl>
                  </section>
                </div>

                {/* CỘT PHẢI: Danh sách hành khách + Chi tiết hóa đơn */}
                <div className="space-y-5">
                  {/* Card Danh sách hành khách */}
                  <section className="bg-white/95 rounded-[19px] shadow-sm border border-[#dcecff] p-5" aria-label="Danh sách hành khách">
                    <SectionTitle
                      icon={<UsersRound size={22} />}
                      title="Danh sách hành khách"
                      description="Các hành khách đi cùng trong booking này."
                    />
                    <div className="rounded-[15px] overflow-hidden border border-[#e0edff]">
                      <table className="w-full border-collapse text-left text-[11px]">
                        <thead className="bg-[#f3f8fe]">
                          <tr>
                            <th className="px-3.5 py-2.5 text-[9px] font-bold tracking-[.07em] text-[#6687b0] uppercase">Họ tên</th>
                            <th className="px-3.5 py-2.5 text-[9px] font-bold tracking-[.07em] text-[#6687b0] uppercase">Ngày sinh</th>
                            <th className="px-3.5 py-2.5 text-[9px] font-bold tracking-[.07em] text-[#6687b0] uppercase">Giới tính</th>
                            <th className="px-3.5 py-2.5 text-[9px] font-bold tracking-[.07em] text-[#6687b0] uppercase">Giấy tờ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#edf4fc]">
                          {b.booking_travelers?.length ? (
                            b.booking_travelers.map((traveler) => (
                              <tr key={traveler.traveler_id}>
                                <td className="px-3.5 py-2.5">
                                  <strong className="font-[650] text-[#092448]">{traveler.full_name}</strong>
                                  <small className="block text-[#8295ad] text-[10px] mt-0.5">
                                    {{ adult: "Người lớn", child: "Trẻ em", infant: "Em bé" }[(traveler.traveler_type || "").toLowerCase()] || traveler.traveler_type}
                                  </small>
                                </td>
                                <td className="px-3.5 py-2.5 text-slate-600">{date(traveler.dob)}</td>
                                <td className="px-3.5 py-2.5 text-slate-600">
                                  {{ male: "Nam", female: "Nữ", other: "Khác" }[(traveler.gender || "").toLowerCase()] || traveler.gender || "—"}
                                </td>
                                <td className="px-3.5 py-2.5 text-slate-600 font-mono text-[10px]">{traveler.id_number || "—"}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="text-center text-[#8295ad] py-4 italic">
                                Chưa có thông tin hành khách.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Card Chi tiết hóa đơn */}
                  <section className="bg-white/95 rounded-[19px] shadow-sm border border-[#dcecff] p-5" aria-label="Chi tiết hóa đơn">
                    <SectionTitle
                      icon={<ReceiptText size={22} />}
                      title="Chi tiết hóa đơn"
                      description="Bảng kê chi phí vé, phụ thu và dịch vụ kèm theo."
                    />
                    <div className="rounded-[15px] overflow-hidden border border-[#e0edff]">
                      <table className="w-full border-collapse text-left text-[11px]">
                        <thead className="bg-[#f3f8fe]">
                          <tr>
                            <th className="px-3 py-2.5 text-[9px] font-bold tracking-[.07em] text-[#6687b0] uppercase">Hạng mục</th>
                            <th className="px-3 py-2.5 text-[9px] font-bold tracking-[.07em] text-[#6687b0] uppercase text-center">SL</th>
                            <th className="px-3 py-2.5 text-[9px] font-bold tracking-[.07em] text-[#6687b0] uppercase text-right">Đơn giá</th>
                            <th className="px-3 py-2.5 text-[9px] font-bold tracking-[.07em] text-[#6687b0] uppercase text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#edf4fc]">
                          {rows
                            .filter((row) => row.quantity > 0)
                            .map((row) => (
                              <tr key={row.label}>
                                <td className="px-3 py-2 text-slate-800 font-medium">{row.label}</td>
                                <td className="px-3 py-2 text-slate-600 text-center">{row.quantity}</td>
                                <td className="px-3 py-2 text-slate-600 text-right">{money(row.price)}</td>
                                <td className="px-3 py-2 text-slate-900 font-semibold text-right">{money(row.quantity * row.price)}</td>
                              </tr>
                            ))}
                          {extras.map((item, index) => (
                            <tr key={`${item.id}-${index}`}>
                              <td className="px-3 py-2 text-slate-800 font-medium">{item.name}</td>
                              <td className="px-3 py-2 text-slate-600 text-center">{item.quantity}</td>
                              <td className="px-3 py-2 text-slate-600 text-right">{money(item.unit_price)}</td>
                              <td className="px-3 py-2 text-slate-900 font-semibold text-right">{money(item.amount)}</td>
                            </tr>
                          ))}
                          {services > 0 && !extras.length && (
                            <tr>
                              <td className="px-3 py-2 text-slate-800 font-medium">Dịch vụ bổ sung</td>
                              <td className="px-3 py-2 text-slate-600 text-center">1</td>
                              <td className="px-3 py-2 text-slate-600 text-right">{money(services)}</td>
                              <td className="px-3 py-2 text-slate-900 font-semibold text-right">{money(services)}</td>
                            </tr>
                          )}
                          {surcharge > 0 && (
                            <tr>
                              <td className="px-3 py-2 text-slate-800 font-medium">Phụ thu phòng / khác</td>
                              <td className="px-3 py-2 text-slate-600 text-center">1</td>
                              <td className="px-3 py-2 text-slate-600 text-right">{money(surcharge)}</td>
                              <td className="px-3 py-2 text-slate-900 font-semibold text-right">{money(surcharge)}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.1fr] mt-3.5 gap-3.5">
                      {/* Thẻ Voucher & Lời chúc */}
                      <div className="relative isolate overflow-hidden rounded-[15px] [background:linear-gradient(145deg,#f0f8fe,#f6fbff)] p-4 flex flex-col justify-between border border-[#e0edff]">
                        <dl className="space-y-2 relative z-[1]">
                          <div>
                            <dt className="text-[10px] uppercase tracking-[.075em] text-[#6283af] font-bold">Giảm giá</dt>
                            <dd className="text-[12px] font-semibold text-slate-800">
                              {discount > 0 ? `Giảm ${money(discount)}` : "Không áp dụng"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-[10px] uppercase tracking-[.075em] text-[#6283af] font-bold">Mã Voucher</dt>
                            <dd className="text-[12px] font-bold text-blue-600">
                              {b.vouchers?.code || "Không sử dụng"}
                            </dd>
                          </div>
                        </dl>
                        <span className="font-handwriting text-[21px] leading-tight text-[#4f8edb] text-right mt-3">
                          Good Trips<br />Better People ♥
                        </span>
                      </div>

                      {/* Khối Tổng tiền thanh toán */}
                      <div className="rounded-[16px] border border-[#dfebfc] bg-white p-4">
                        <dl className="space-y-1.5 text-[11px]">
                          <div className="flex justify-between">
                            <dt className="text-slate-500">Tạm tính:</dt>
                            <dd className="font-semibold text-slate-800">{money(tickets + services + surcharge)}</dd>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between text-rose-600">
                              <dt>Giảm giá:</dt>
                              <dd className="font-semibold">− {money(discount)}</dd>
                            </div>
                          )}
                        </dl>
                        <div className="border-y border-[#edf3fc] my-2.5 py-2 flex items-baseline justify-between">
                          <span className="text-[10px] uppercase tracking-[.06em] font-extrabold text-[#3d85ff]">
                            Tổng thanh toán
                          </span>
                          <strong className="text-2xl font-black text-[#0064ff]">
                            {money(b.total_amount)}
                          </strong>
                        </div>
                        <dl className="space-y-1 text-[11px] text-[#5c7aa2]">
                          <div className="flex justify-between">
                            <dt>Trạng thái:</dt>
                            <dd><StatusBadge value={b.status} /></dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Ngày đặt:</dt>
                            <dd className="font-medium text-slate-700">{date(b.created_at, true)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Mã GD:</dt>
                            <dd className="font-mono text-slate-700">{payment?.transaction_code || "—"}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Phương thức:</dt>
                            <dd className="font-medium text-slate-700">{method}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt>Thanh toán:</dt>
                            <dd className="font-semibold text-slate-800">{paymentStatus}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                  </section>
                </div>
              </div>

              {/* Ghi chú, Loại phòng & Thông tin hủy */}
              {(b.note || b.cancellation_meta || b.room_selection) && (() => {
                const parsed = parseBookingNote(b.note, b);
                const hasCancellation =
                  b.status === "cancel_requested" ||
                  b.status === "cancelled" ||
                  Boolean(parsed.cancellationReason || parsed.cancelRequest || parsed.adminApproval || parsed.adminAction);

                if (!parsed.customerNote && !parsed.roomType && !hasCancellation) return null;

                return (
                  <div className="mt-5 space-y-3">
                    {/* Loại phòng & phụ thu */}
                    {parsed.roomType && (
                      <div className="rounded-[16px] bg-slate-50 border border-slate-200/90 px-4 py-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <BedDouble size={16} className="text-blue-600 shrink-0" />
                          <span className="font-semibold text-slate-600">Loại phòng:</span>
                          <span className="font-bold text-slate-900">{parsed.roomType}</span>
                        </div>
                        {parsed.roomSurcharge && parsed.roomSurcharge !== "0đ" && (
                          <span className="font-semibold text-purple-700 bg-purple-50 border border-purple-200/70 rounded-lg px-2 py-0.5 text-[11px]">
                            Phụ thu: {parsed.roomSurcharge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Khối Yêu cầu hủy tour & Hoàn tiền đang chờ xử lý */}
                    {b.status === "cancel_requested" && (
                      <div className="rounded-[18px] bg-rose-50/90 border border-rose-200 p-4.5 space-y-3 text-xs">
                        <div className="flex items-center justify-between border-b border-rose-200/70 pb-2.5">
                          <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs uppercase tracking-wider">
                            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                            <span>Khách hàng yêu cầu hủy tour & hoàn tiền</span>
                          </div>
                          <span className="rounded-full bg-rose-200/80 px-2.5 py-0.5 text-[11px] font-bold text-rose-900">
                            Chờ duyệt
                          </span>
                        </div>

                        <div className="space-y-1">
                          <p>
                            <span className="text-slate-600 font-medium">Lý do hủy tour:</span>{" "}
                            <strong className="text-slate-900 font-bold">
                              {parsed.cancellationReason || parsed.cancelRequest?.reason || "Không nêu rõ"}
                            </strong>
                          </p>
                          {(parsed.cancellationTime || parsed.cancelRequest?.requestedAt) && (
                            <p className="text-[11px] text-slate-500">
                              Thời gian gửi yêu cầu:{" "}
                              {parsed.cancellationTime || parsed.cancelRequest?.requestedAt}
                            </p>
                          )}
                        </div>

                        {/* Chi tiết tính toán hoàn tiền */}
                        {parsed.cancelRequest && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-xl bg-white/90 border border-rose-100 p-3 text-[11.5px]">
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-bold block">Đã thanh toán</span>
                              <strong className="text-slate-800 font-bold">
                                {parsed.cancelRequest.totalPaid || money(b.total_amount)}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-bold block">Mức phạt quy định</span>
                              <strong className="text-rose-600 font-bold">
                                {parsed.cancelRequest.tierPenalty || "Theo chính sách"}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-bold block">Phí phạt hủy</span>
                              <strong className="text-rose-600 font-bold">
                                {parsed.cancelRequest.penaltyAmount || "—"}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] uppercase font-bold block">Tiền hoàn dự kiến</span>
                              <strong className="text-emerald-700 font-black text-xs">
                                {parsed.cancelRequest.refundEstimated || "0đ"}
                              </strong>
                            </div>
                          </div>
                        )}

                        {/* Tài khoản ngân hàng nhận tiền hoàn */}
                        {parsed.cancelRequest && (parsed.cancelRequest.bankName || parsed.cancelRequest.bankAccountNumber) && (
                          <div className="rounded-xl border border-blue-200/80 bg-blue-50/60 p-3 space-y-1.5">
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11.5px]">
                              <Building2 size={14} className="text-blue-600" />
                              <span>Tài khoản nhận tiền hoàn của khách:</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5 text-xs">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Ngân hàng</span>
                                <span className="font-bold text-slate-800">{parsed.cancelRequest.bankName || "—"}</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Số tài khoản</span>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-blue-700">
                                    {parsed.cancelRequest.bankAccountNumber || "—"}
                                  </span>
                                  {parsed.cancelRequest.bankAccountNumber && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        void navigator.clipboard.writeText(parsed.cancelRequest!.bankAccountNumber!);
                                        setCopiedAccount(true);
                                        setTimeout(() => setCopiedAccount(false), 2000);
                                      }}
                                      className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
                                      title="Sao chép số tài khoản"
                                    >
                                      {copiedAccount ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Chủ tài khoản</span>
                                <span className="font-bold uppercase text-slate-800">
                                  {parsed.cancelRequest.bankAccountName || "—"}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Khối đơn đã hủy */}
                    {b.status === "cancelled" && (
                      <div className="rounded-[16px] bg-slate-100/90 border border-slate-200 p-4 space-y-2 text-xs text-slate-800">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                            <XCircle size={16} className="text-rose-600" />
                            <span>{parsed.cancellation?.title || "Thông tin hủy đơn booking"}</span>
                          </div>
                          {parsed.cancellation?.actor && (
                            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10.5px] font-bold text-slate-700">
                              Người hủy: {parsed.cancellation.actor}
                            </span>
                          )}
                        </div>
                        <p>
                          <span className="text-slate-500 font-medium">Lý do hủy:</span>{" "}
                          <strong className="text-slate-900 font-bold">
                            {parsed.cancellation?.reason || parsed.cancellationReason || "Đơn đặt tour đã bị hủy"}
                          </strong>
                        </p>
                        {(parsed.cancellation?.time || parsed.cancellationTime) && (
                          <p>
                            <span className="text-slate-500">Thời gian hủy:</span>{" "}
                            <span className="text-slate-700">{parsed.cancellation?.time || parsed.cancellationTime}</span>
                          </p>
                        )}
                        {(parsed.cancellation?.refundAmount || parsed.adminApproval?.refundAmount) && (
                          <p>
                            <span className="text-slate-500">Số tiền hoàn:</span>{" "}
                            <strong className="text-emerald-700 font-bold">
                              {parsed.cancellation?.refundAmount || parsed.adminApproval?.refundAmount}
                            </strong>
                          </p>
                        )}
                        {(parsed.cancellation?.note || parsed.adminApproval?.note) && (
                          <p>
                            <span className="text-slate-500">Ghi chú xử lý:</span>{" "}
                            <span className="text-slate-700">
                              {parsed.cancellation?.note || parsed.adminApproval?.note}
                            </span>
                          </p>
                        )}
                        {parsed.adminAction?.note && !parsed.cancellation?.note && (
                          <p>
                            <span className="text-slate-500">Ghi chú hủy của Admin:</span>{" "}
                            <span className="text-slate-700">{parsed.adminAction.note}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Ghi chú thực tế từ khách hàng */}
                    {parsed.customerNote && (
                      <div className="rounded-[19px] bg-amber-50/80 border border-amber-200/80 p-4.5">
                        <h4 className="text-[12px] font-black uppercase tracking-wider text-amber-900 mb-2">
                          Ghi chú từ khách hàng
                        </h4>
                        <div className="text-xs text-amber-950 whitespace-pre-wrap leading-relaxed">
                          {parsed.customerNote}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Footer với các nút hành động xác nhận duyệt hủy hoặc hủy đơn */}
            <footer className="flex flex-wrap items-center justify-between border-t border-[#dcecff] bg-white px-6 py-3.5 gap-2.5">
              <span className="text-xs text-slate-400">
                Mã booking: <strong className="text-slate-700">#{b.booking_id}</strong>
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                {b.status === "cancel_requested" && onAction && (
                  <>
                    <button
                      type="button"
                      onClick={() => onAction(b, "reject")}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                    >
                      <XCircle size={14} className="text-rose-500" />
                      <span>Từ chối yêu cầu</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAction(b, "approve")}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer"
                    >
                      <CheckCircle2 size={14} />
                      <span>Duyệt yêu cầu hủy & Hoàn tiền</span>
                    </button>
                  </>
                )}

                {b.status === "pending" && onAction && (
                  <button
                    type="button"
                    onClick={() => onAction(b, "cancel-pending")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-4 py-2 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Hủy đơn giữ chỗ & Nhả chỗ</span>
                  </button>
                )}

                {["paid", "confirmed"].includes(b.status) && onAction && (
                  <button
                    type="button"
                    onClick={() => onAction(b, "cancel-booking")}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-white px-4 py-2 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-50 transition cursor-pointer"
                  >
                    <AlertTriangle size={14} />
                    <span>Hủy đơn tour (Admin)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-slate-900 px-6 py-2 text-xs font-bold text-white shadow-md transition hover:bg-slate-800 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </footer>
          </>
        ) : null}
      </div>

      {b && (
        <BookingReceiptModal
          open={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          booking={b as any}
        />
      )}
    </div>
  );
}
