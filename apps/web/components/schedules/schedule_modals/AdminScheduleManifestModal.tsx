"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { formatVND } from "@/lib/utils/currency";
import { getScheduleManifest } from "@/lib/schedules/admin/api";
import { cancelPendingBooking, runAdminBookingAction } from "@/lib/booking/admin/api";
import { AdminModalShell } from "@/components/common/admin_shared/layout/AdminModalShell";
import { useToast } from "@/lib/notifications/useToast";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { PriceInput } from "@/components/common/form_controls/PriceInput";
import {
  AlertCircle,
  AlertTriangle,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Copy,
  Download,
  FileSpreadsheet,
  Loader2,
  MapPin,
  Phone,
  PhoneCall,
  Search,
  Tag,
  Trash2,
  User,
  Users,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";
import { parseBookingNote, type ManifestBookingGroup, type ScheduleManifestResponse } from "shared";

interface ScheduleManifestModalProps {
  scheduleId: number | null;
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export function ScheduleManifestModal({
  scheduleId,
  open,
  onClose,
  onUpdated,
}: ScheduleManifestModalProps) {
  const { success, error: showError } = useToast();
  const [data, setData] = useState<ScheduleManifestResponse | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [pickupFilter, setPickupFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Hủy đơn pending
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Xử lý duyệt / từ chối yêu cầu hủy tour
  const [actionModalBooking, setActionModalBooking] = useState<{
    booking: ManifestBookingGroup;
    type: "approve" | "reject";
  } | null>(null);
  const [actionModalNote, setActionModalNote] = useState("");
  const [actionModalRefund, setActionModalRefund] = useState("");
  const [processingAction, setProcessingAction] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);

  useEffect(() => setMounted(true), []);

  const fetchManifest = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getScheduleManifest(id);
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải danh sách đoàn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && scheduleId) {
      fetchManifest(scheduleId);
      setSearch("");
      setPickupFilter("all");
      setPaymentFilter("all");
      setCancellingBookingId(null);
      setActionModalBooking(null);
    } else {
      setData(null);
      setCancellingBookingId(null);
      setActionModalBooking(null);
    }
  }, [open, scheduleId]);

  // Đóng modal khi bấm Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Danh sách các điểm đón duy nhất để làm bộ lọc
  const uniquePickups = useMemo(() => {
    if (!data?.bookings) return [];
    const set = new Set<string>();
    data.bookings.forEach((b) => {
      const name = b.pickup_snapshot?.name || b.departure_name;
      if (name) set.add(name);
    });
    return Array.from(set);
  }, [data]);

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    if (!data?.bookings) return [];
    return data.bookings.filter((b) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchBooker =
          b.contact_name.toLowerCase().includes(q) ||
          b.contact_phone.includes(q) ||
          `#bk${b.booking_id}`.includes(q);
        const matchTravelers = b.travelers.some(
          (t) =>
            t.full_name.toLowerCase().includes(q) ||
            (t.phone && t.phone.includes(q)) ||
            (t.id_number && t.id_number.includes(q)),
        );
        if (!matchBooker && !matchTravelers) return false;
      }

      if (pickupFilter !== "all") {
        const pickupName = b.pickup_snapshot?.name || b.departure_name || "";
        if (pickupName !== pickupFilter) return false;
      }

      if (paymentFilter !== "all") {
        const isPaid = ["paid", "completed"].includes(b.status.toLowerCase());
        if (paymentFilter === "paid" && !isPaid) return false;
        if (paymentFilter === "pending" && b.status.toLowerCase() !== "pending") return false;
        if (paymentFilter === "cancel_requested" && b.status.toLowerCase() !== "cancel_requested") return false;
      }

      return true;
    });
  }, [data, search, pickupFilter, paymentFilter]);

  // Thực hiện duyệt hoặc từ chối yêu cầu hủy tour
  const handleConfirmCancelAction = async () => {
    if (!actionModalBooking) return;
    setProcessingAction(true);
    try {
      const payload: Record<string, unknown> = {
        note: actionModalNote.trim() || undefined,
      };
      if (actionModalBooking.type === "approve" && actionModalRefund.trim()) {
        const numeric = Number(actionModalRefund.replace(/[^\d]/g, ""));
        if (!Number.isNaN(numeric)) {
          payload.refundAmount = numeric;
        }
      }
      await runAdminBookingAction(
        actionModalBooking.booking.booking_id,
        actionModalBooking.type === "approve" ? "approve-cancel" : "reject-cancel",
        payload,
      );
      success(
        actionModalBooking.type === "approve"
          ? "Đã duyệt yêu cầu hủy và gửi email xác nhận hoàn tiền cho khách!"
          : "Đã từ chối yêu cầu hủy tour!",
      );
      setActionModalBooking(null);
      setActionModalNote("");
      setActionModalRefund("");
      if (scheduleId) await fetchManifest(scheduleId);
      if (onUpdated) onUpdated();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Thao tác xử lý thất bại.");
    } finally {
      setProcessingAction(false);
    }
  };

  // Thực hiện hủy đơn pending để nhả quota
  const handleCancelPending = async () => {
    if (!cancellingBookingId) return;
    setCancelling(true);
    try {
      await cancelPendingBooking(cancellingBookingId, cancelReason);
      success("Đã hủy đơn và giải phóng chỗ thành công!");
      setCancellingBookingId(null);
      setCancelReason("");
      if (scheduleId) await fetchManifest(scheduleId);
      if (onUpdated) onUpdated();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Không thể hủy đơn đặt tour.");
    } finally {
      setCancelling(false);
    }
  };

  // Xuất danh sách Excel (CSV định dạng UTF-8 với BOM để Excel tiếng Việt không lỗi font)
  const handleExportCSV = () => {
    if (!data || !filteredBookings.length) return;

    const headers = [
      "STT",
      "Mã Booking",
      "Họ tên hành khách",
      "Phân loại",
      "Giới tính",
      "Ngày sinh",
      "CCCD / Hộ chiếu",
      "Số điện thoại",
      "Người đại diện đặt",
      "SĐT đại diện",
      "Điểm đón khách",
      "Loại phòng",
      "Trạng thái thanh toán",
      "Ghi chú",
    ];

    const rows: string[][] = [];
    let counter = 1;

    filteredBookings.forEach((b) => {
      const isPaid = ["paid", "completed"].includes(b.status.toLowerCase());
      const paymentText = isPaid ? "Đã thanh toán" : "Chờ thanh toán";
      const pickupText = b.pickup_snapshot
        ? `${b.pickup_snapshot.name || ""} - ${b.pickup_snapshot.address || ""}`.trim()
        : b.departure_name || "Mặc định";
      const parsed = parseBookingNote(b.note, b);

      b.travelers.forEach((t) => {
        const normType = (t.traveler_type || "adult").toLowerCase();
        const travelerType =
          { adult: "Người lớn", child: "Trẻ em", infant: "Em bé" }[normType] || t.traveler_type;
        const phone = normType === "adult" ? t.phone || b.contact_phone : "Theo người đặt";

        rows.push([
          String(counter++),
          `#BK${b.booking_id}`,
          `"${t.full_name}"`,
          travelerType,
          t.gender === "male" ? "Nam" : t.gender === "female" ? "Nữ" : t.gender || "—",
          t.dob || "—",
          t.id_number ? `"${t.id_number}"` : "—",
          phone ? `"${phone}"` : "—",
          `"${b.contact_name}"`,
          `"${b.contact_phone}"`,
          `"${pickupText}"`,
          `"${parsed.roomType || "Ghép phòng"}"`,
          paymentText,
          parsed.customerNote ? `"${parsed.customerNote.replace(/"/g, '""')}"` : "—",
        ]);
      });
    });

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `Danh_sach_doan_Chuyen_${data.schedule.code || data.schedule.tour_schedule_id}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!mounted || !open || !scheduleId) return null;

  return createPortal((
    <div
      className="fixed inset-0 z-[120] overflow-y-auto overflow-x-hidden p-3 sm:p-6 flex justify-center items-start sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 my-auto flex max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3.5rem)] w-full max-w-6xl xl:max-w-7xl flex-col overflow-hidden rounded-[24px] bg-white shadow-2xl border border-[#dcecff] text-[#092448]">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng popup"
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow-sm backdrop-blur-md transition hover:bg-white hover:text-slate-900"
        >
          <X size={18} />
        </button>

        {/* Loading state */}
        {loading ? (
          <div className="flex h-96 flex-col items-center justify-center gap-3 p-8">
            <Loader2 size={36} className="animate-spin text-blue-600" />
            <p className="text-sm font-semibold text-slate-600">Đang tải danh sách đoàn...</p>
          </div>
        ) : error ? (
          <div className="flex h-80 flex-col items-center justify-center gap-3 p-8 text-center">
            <AlertCircle size={36} className="text-rose-500" />
            <h4 className="text-base font-bold text-slate-900">Không thể tải thông tin đoàn</h4>
            <p className="text-sm text-slate-500 max-w-md">{error}</p>
            <button
              type="button"
              onClick={() => scheduleId && fetchManifest(scheduleId)}
              className="mt-2 rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        ) : data ? (
          <>
            {/* Header thông tin chuyến tour */}
            <header className="relative isolate shrink-0 pt-6 pb-5 px-6 overflow-hidden border-b border-[#dcecff] bg-[linear-gradient(135deg,#eaf5ff_0%,#f0f8ff_60%,#e1f3ff_100%)]">
              <div className="flex flex-wrap items-start justify-between gap-4 pr-10">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="uppercase text-[10px] tracking-wider text-blue-800 font-extrabold bg-white/90 px-3 py-1 rounded-full border border-blue-200 shadow-2xs">
                      Danh sách đoàn
                    </span>
                    <span className="text-[12px] font-bold text-[#0064ff]">
                      Mã chuyến: {data.schedule.code || `#${data.schedule.tour_schedule_id}`}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-[#092448]">
                    {data.schedule.tour?.name || "Chi tiết đoàn khách"}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-blue-600" />
                      {new Date(data.schedule.start_date).toLocaleDateString("vi-VN")} →{" "}
                      {new Date(data.schedule.end_date).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-blue-600" />
                      Xuất phát: {data.schedule.departure_location?.name || "Chưa xác định"}
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-blue-700">
                      <Users size={14} />
                      Đã đặt: {data.schedule.booked_count} / {data.schedule.quota} chỗ
                    </span>
                  </div>
                </div>

                {/* Nút xuất Excel */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    disabled={!filteredBookings.length}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    <FileSpreadsheet size={16} />
                    <span>Xuất danh sách Excel</span>
                  </button>
                </div>
              </div>

              {/* Tóm tắt số lượng */}
              <div className="mt-4 flex flex-wrap items-center gap-2.5 text-xs">
                <span className="rounded-lg bg-white/90 border border-blue-100 px-3 py-1 font-semibold text-slate-700">
                  Tổng đơn: <strong className="text-blue-600">{data.summary.total_bookings}</strong>
                </span>
                <span className="rounded-lg bg-white/90 border border-blue-100 px-3 py-1 font-semibold text-slate-700">
                  Tổng hành khách:{" "}
                  <strong className="text-blue-600">{data.summary.total_travelers}</strong> (
                  {data.summary.adult_count} Lớn, {data.summary.child_count} Trẻ em,{" "}
                  {data.summary.infant_count} Em bé)
                </span>
                <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1 font-semibold text-emerald-800">
                  Đã thanh toán: <strong>{data.summary.paid_count} khách</strong>
                </span>
                {data.summary.pending_count > 0 && (
                  <span className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-1 font-semibold text-amber-800">
                    Chờ thanh toán: <strong>{data.summary.pending_count} khách</strong>
                  </span>
                )}
              </div>
            </header>

            {/* Filter Bar */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-2.5">
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm theo tên khách, SĐT, mã đơn..."
                    className="w-full h-9 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none transition shadow-2xs"
                  />
                </div>

                {uniquePickups.length > 0 && (
                  <CustomDropdown
                    variant="compact"
                    matchTriggerWidth
                    ariaLabel="Lọc theo điểm đón khách"
                    className="w-full sm:w-60 [&_button[aria-haspopup]]:min-w-0 [&_button[aria-haspopup]]:h-9 [&_button[aria-haspopup]]:rounded-xl [&_button[aria-haspopup]]:text-xs [&_button[aria-haspopup]]:px-3 [&_button[aria-haspopup]]:bg-white [&_button[aria-haspopup]]:border-slate-200"
                    selectedValue={pickupFilter}
                    onSelect={(val) => setPickupFilter(val)}
                    options={[
                      { value: "all", label: `Tất cả điểm đón (${uniquePickups.length})` },
                      ...uniquePickups.map((p) => ({ value: p, label: p })),
                    ]}
                  />
                )}

                <CustomDropdown
                  variant="compact"
                  matchTriggerWidth
                  ariaLabel="Lọc theo trạng thái thanh toán"
                  className="w-full sm:w-56 [&_button[aria-haspopup]]:min-w-0 [&_button[aria-haspopup]]:h-9 [&_button[aria-haspopup]]:rounded-xl [&_button[aria-haspopup]]:text-xs [&_button[aria-haspopup]]:px-3 [&_button[aria-haspopup]]:bg-white [&_button[aria-haspopup]]:border-slate-200"
                  selectedValue={paymentFilter}
                  onSelect={(val) => setPaymentFilter(val)}
                  options={[
                    { value: "all", label: "Tất cả trạng thái" },
                    { value: "paid", label: `Đã thanh toán (${data.summary.paid_count})` },
                    { value: "pending", label: `Chờ thanh toán (${data.summary.pending_count})` },
                    ...(data.bookings.some((b) => b.status === "cancel_requested")
                      ? [
                        {
                          value: "cancel_requested",
                          label: `Yêu cầu hủy (${data.bookings.filter((b) => b.status === "cancel_requested").length})`,
                        },
                      ]
                      : []),
                  ]}
                />
              </div>

              <div className="text-xs font-semibold text-slate-500">
                Hiển thị <strong className="text-blue-600">{filteredBookings.length}</strong> đơn booking
              </div>
            </div>

            {/* Nội dung danh sách: Nhóm theo Booking - Chia 2 cột */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-slate-50/30">
              {filteredBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
                  <UsersRound size={40} className="mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-600">
                    Chưa có hành khách nào phù hợp.
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Thử chọn bộ lọc khác hoặc kiểm tra lại từ khóa tìm kiếm.
                  </p>
                </div>
              ) : (
                filteredBookings.map((b) => {
                  const isCancelRequested = b.status === "cancel_requested";
                  const isPaid = ["paid", "completed"].includes(
                    b.status.toLowerCase(),
                  );
                  const isPending = b.status === "pending";
                  const isCancelling = cancellingBookingId === b.booking_id;

                  return (
                    <article
                      key={b.booking_id}
                      className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden transition hover:border-blue-200"
                    >
                      {/* Booking Bar Top */}
                      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-[#f8fbff] px-5 py-2.5 gap-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                            #BK{String(b.booking_id).padStart(6, "0")}
                          </span>
                          <span className="text-xs text-slate-400">
                            Đặt lúc:{" "}
                            {new Date(b.created_at).toLocaleString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-800">
                            Tổng tiền: {formatVND(Number(b.total_amount) || 0)}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${isCancelRequested
                                ? "bg-rose-100 text-rose-800 border border-rose-300"
                                : isPaid
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                          >
                            {isCancelRequested
                              ? "Yêu cầu hủy"
                              : isPaid
                                ? "Đã thanh toán"
                                : "Chờ thanh toán"}
                          </span>
                        </div>
                      </div>

                      {/* 2 CỘT CHÍNH */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                        {/* CỘT TRÁI: Người đại diện đặt tour (4/12) */}
                        <div className="lg:col-span-4 p-4 sm:p-5 space-y-3 bg-white">
                          <div className="flex items-start justify-between">
                            <div>
                              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Người đại diện đặt tour
                              </dt>
                              <dd className="text-sm font-black text-slate-900 mt-0.5">
                                {b.contact_name}
                              </dd>
                            </div>

                            {/* Nút gọi nhanh cho người đại diện */}
                            {b.contact_phone && (
                              <a
                                href={`tel:${b.contact_phone}`}
                                title={`Gọi cho ${b.contact_name} (${b.contact_phone})`}
                                className="flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-xs"
                              >
                                <PhoneCall size={14} />
                                <span>{b.contact_phone}</span>
                              </a>
                            )}
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-600">
                            {b.contact_email && (
                              <p className="flex items-center gap-2 truncate">
                                <span className="font-semibold text-slate-400">Email:</span>{" "}
                                <span className="truncate">{b.contact_email}</span>
                              </p>
                            )}

                            {(() => {
                              const parsed = parseBookingNote(b.note, b);
                              return (
                                <>
                                  {parsed.contactIdCard && (
                                    <p className="flex items-center gap-2">
                                      <span className="font-semibold text-slate-400">CCCD:</span>{" "}
                                      <span className="font-mono font-medium text-slate-700">
                                        {parsed.contactIdCard}
                                      </span>
                                    </p>
                                  )}

                                  {/* Điểm đón */}
                                  <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-2.5 text-xs text-blue-900">
                                    <p className="font-bold flex items-center gap-1.5 text-blue-800 mb-0.5">
                                      <MapPin size={13} /> Điểm đón khách:
                                    </p>
                                    <p className="font-semibold">
                                      {b.pickup_snapshot?.name || b.departure_name || "Điểm hẹn mặc định"}
                                    </p>
                                    {b.pickup_snapshot?.address && (
                                      <p className="text-[11px] text-slate-500 mt-0.5">
                                        {b.pickup_snapshot.address}
                                      </p>
                                    )}
                                    {b.pickup_snapshot?.pickup_at && (
                                      <p className="text-[11px] font-bold text-blue-600 mt-1 flex items-center gap-1">
                                        <Clock size={11} /> Giờ đón:{" "}
                                        {new Date(b.pickup_snapshot.pickup_at).toLocaleTimeString("vi-VN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    )}
                                  </div>

                                  {/* Thông tin xếp phòng */}
                                  {parsed.roomType && (
                                    <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 text-xs text-slate-800 flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <BedDouble size={14} className="text-blue-600 shrink-0" />
                                        <span className="font-medium text-slate-600">Loại phòng:</span>
                                        <span className="font-bold text-slate-900">{parsed.roomType}</span>
                                      </div>
                                      {parsed.roomSurcharge && parsed.roomSurcharge !== "0đ" && (
                                        <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-200/80 rounded-md px-1.5 py-0.5 shrink-0">
                                          Phụ thu: {parsed.roomSurcharge}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {/* Ghi chú thực tế của khách hàng (sau khi tách các tag kỹ thuật) */}
                                  {parsed.customerNote && (
                                    <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-2.5 text-xs text-amber-900">
                                      <span className="font-bold block mb-0.5">Ghi chú của khách:</span>
                                      <span className="whitespace-pre-wrap">{parsed.customerNote}</span>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>

                          {/* XỬ LÝ YÊU CẦU HỦY TOUR CHO ĐƠN CANCEL_REQUESTED */}
                          {isCancelRequested && (() => {
                            const parsed = parseBookingNote(b.note, b);
                            return (
                              <div className="rounded-xl border border-rose-200 bg-rose-50/85 p-3.5 text-xs space-y-2.5">
                                <div className="flex items-center justify-between border-b border-rose-200/70 pb-1.5">
                                  <div className="flex items-center gap-1.5 text-rose-800 font-extrabold text-[11.5px] uppercase tracking-wide">
                                    <AlertTriangle size={14} className="text-rose-600 shrink-0" />
                                    <span>Khách yêu cầu hủy & hoàn tiền</span>
                                  </div>
                                  <span className="rounded-full bg-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-900">
                                    Cần duyệt
                                  </span>
                                </div>

                                <div className="space-y-1 text-slate-800 text-xs">
                                  <p>
                                    <span className="text-slate-500 font-medium">Lý do:</span>{" "}
                                    <strong className="text-slate-900">
                                      {parsed.cancellationReason || parsed.cancelRequest?.reason || "Không nêu rõ"}
                                    </strong>
                                  </p>
                                  {parsed.cancelRequest?.refundEstimated && (
                                    <div className="flex items-center gap-2 pt-0.5">
                                      <span className="text-slate-500">Tiền hoàn dự kiến:</span>
                                      <strong className="text-emerald-700 font-bold">
                                        {parsed.cancelRequest.refundEstimated}
                                      </strong>
                                      {parsed.cancelRequest.tierPenalty && (
                                        <span className="text-[11px] text-rose-600">
                                          ({parsed.cancelRequest.tierPenalty})
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  {parsed.cancelRequest?.bankAccountNumber && (
                                    <div className="rounded-lg bg-white/95 border border-blue-100 p-2 text-[11px] text-slate-700 space-y-0.5 mt-1">
                                      <p className="font-semibold text-blue-900 flex items-center gap-1">
                                        <Building2 size={12} className="text-blue-600" /> Tài khoản hoàn tiền:
                                      </p>
                                      <p>
                                        {parsed.cancelRequest.bankName} -{" "}
                                        <span className="font-mono font-bold text-blue-700">
                                          {parsed.cancelRequest.bankAccountNumber}
                                        </span>{" "}
                                        -{" "}
                                        <span className="uppercase font-semibold">
                                          {parsed.cancelRequest.bankAccountName}
                                        </span>
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* 2 nút thao tác duyệt hoặc từ chối */}
                                <div className="flex items-center gap-2 pt-1 border-t border-rose-200/60">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionModalBooking({ booking: b, type: "reject" });
                                      setActionModalNote("");
                                      setActionModalRefund("");
                                    }}
                                    className="flex-1 rounded-lg border border-slate-300 bg-white py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                  >
                                    Từ chối yêu cầu
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActionModalBooking({ booking: b, type: "approve" });
                                      setActionModalNote("");
                                      setActionModalRefund(
                                        parsed.cancelRequest?.numericRefundAmount !== undefined
                                          ? String(parsed.cancelRequest.numericRefundAmount)
                                          : "",
                                      );
                                    }}
                                    className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                                  >
                                    Duyệt hủy tour
                                  </button>
                                </div>
                              </div>
                            );
                          })()}

                          {/* CƠ CHẾ XỬ LÝ ĐƠN CHỜ THANH TOÁN (t5) */}
                          {isPending && (
                            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-xs space-y-2">
                              <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                                <Clock size={14} className="shrink-0" />
                                <span>
                                  {b.is_holding_expired
                                    ? "⚠️ Đã quá 12h giữ chỗ chưa thanh toán"
                                    : "Hạn giữ chỗ: 12 tiếng từ lúc đặt"}
                                </span>
                              </div>

                              {/* Form Hủy đơn & Nhả chỗ trực tiếp */}
                              {isCancelling ? (
                                <div className="space-y-2 pt-1 border-t border-amber-200/70">
                                  <textarea
                                    rows={2}
                                    placeholder="Lý do hủy (VD: Đã gọi khách báo không đi, quá hạn giữ chỗ...)"
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:border-rose-500 focus:outline-none"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCancellingBookingId(null);
                                        setCancelReason("");
                                      }}
                                      className="rounded-lg px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200"
                                    >
                                      Hủy thao tác
                                    </button>
                                    <button
                                      type="button"
                                      disabled={cancelling}
                                      onClick={handleCancelPending}
                                      className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
                                    >
                                      {cancelling && <Loader2 size={12} className="animate-spin" />}
                                      Xác nhận hủy & Nhả chỗ
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCancellingBookingId(b.booking_id);
                                    setCancelReason(
                                      "Nhân viên gọi xác nhận khách không đi / quá hạn giữ chỗ",
                                    );
                                  }}
                                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-bold text-rose-700 shadow-xs hover:bg-rose-50 transition"
                                >
                                  <Trash2 size={13} />
                                  <span>Hủy đơn & Nhả chỗ ngay</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* CỘT PHẢI: Danh sách thành viên đi tour (8/12) */}
                        <div className="lg:col-span-8 p-4 sm:p-5 bg-white">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                              Danh sách thành viên đi cùng ({b.travelers.length} khách)
                            </h4>
                          </div>

                          <div className="overflow-x-auto rounded-xl border border-slate-100">
                            <table className="w-full border-collapse text-left text-xs">
                              <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                <tr>
                                  <th className="px-3 py-2.5">Họ tên thành viên</th>
                                  <th className="px-3 py-2.5">Phân loại</th>
                                  <th className="px-3 py-2.5">Giới tính</th>
                                  <th className="px-3 py-2.5">Ngày sinh</th>
                                  <th className="px-3 py-2.5">CCCD / Hộ chiếu</th>
                                  {/* Cột SĐT Người lớn */}
                                  <th className="px-3 py-2.5">Số điện thoại</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {b.travelers.map((t, idx) => {
                                  const normType = (t.traveler_type || "adult").toLowerCase();
                                  const isAdult = normType === "adult";
                                  const isChild = normType === "child";
                                  const displayPhone = isAdult
                                    ? t.phone || b.contact_phone
                                    : null;

                                  return (
                                    <tr key={t.traveler_id} className="hover:bg-slate-50/50">
                                      <td className="px-3 py-2.5 font-bold text-slate-900">
                                        {t.full_name}
                                      </td>
                                      <td className="px-3 py-2.5">
                                        <span
                                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${isAdult
                                              ? "bg-blue-50 text-blue-700"
                                              : isChild
                                                ? "bg-amber-50 text-amber-700"
                                                : "bg-purple-50 text-purple-700"
                                            }`}
                                        >
                                          {isAdult
                                            ? "Người lớn"
                                            : isChild
                                              ? "Trẻ em"
                                              : "Em bé"}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2.5 text-slate-600">
                                        {t.gender === "male"
                                          ? "Nam"
                                          : t.gender === "female"
                                            ? "Nữ"
                                            : t.gender || "—"}
                                      </td>
                                      <td className="px-3 py-2.5 text-slate-600">
                                        {t.dob || "—"}
                                      </td>
                                      <td className="px-3 py-2.5 font-mono text-[11px] text-slate-700">
                                        {t.id_number || "—"}
                                      </td>
                                      {/* CỘT SĐT CHO NGƯỜI LỚN */}
                                      <td className="px-3 py-2.5">
                                        {isAdult ? (
                                          displayPhone ? (
                                            <a
                                              href={`tel:${displayPhone}`}
                                              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                                            >
                                              <Phone size={12} />
                                              <span>{displayPhone}</span>
                                            </a>
                                          ) : (
                                            <span className="text-slate-400 italic">Chưa có</span>
                                          )
                                        ) : (
                                          <span className="text-slate-400 text-[11px]">
                                            Theo người đặt
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <footer className="flex items-center justify-between border-t border-[#dcecff] bg-white px-6 py-3.5">
              <span className="text-xs text-slate-500 font-medium">
                Đang hiển thị <strong>{filteredBookings.length}</strong> đơn booking trong đợt khởi
                hành này.
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-slate-900 px-6 py-2 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 cursor-pointer"
              >
                Đóng
              </button>
            </footer>

            {/* Modal Duyệt hoặc Từ chối yêu cầu hủy tour từ danh sách đoàn */}
            {actionModalBooking && (
              <AdminModalShell
                title={
                  actionModalBooking.type === "approve"
                    ? "Duyệt yêu cầu hủy & Hoàn tiền"
                    : "Từ chối yêu cầu hủy tour"
                }
                icon={
                  actionModalBooking.type === "approve" ? (
                    <CircleDollarSign size={18} />
                  ) : (
                    <XCircle size={18} />
                  )
                }
                onClose={() => {
                  if (processingAction) return;
                  setActionModalBooking(null);
                  setActionModalNote("");
                  setActionModalRefund("");
                }}
                maxWidthClassName="max-w-xl"
                footer={
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setActionModalBooking(null);
                        setActionModalNote("");
                        setActionModalRefund("");
                      }}
                      disabled={processingAction}
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Đóng
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleConfirmCancelAction()}
                      disabled={processingAction}
                      className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition cursor-pointer ${actionModalBooking.type === "approve"
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-slate-950 hover:bg-slate-800"
                        }`}
                    >
                      {processingAction
                        ? "Đang xử lý..."
                        : actionModalBooking.type === "approve"
                          ? "Xác nhận duyệt & Hoàn tiền"
                          : "Xác nhận từ chối"}
                    </button>
                  </>
                }
              >
                <div className="space-y-4 p-5 text-sm text-slate-700">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-bold text-slate-950">
                      Booking #{actionModalBooking.booking.booking_id} - Khách: {actionModalBooking.booking.contact_name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tổng tiền: {formatVND(Number(actionModalBooking.booking.total_amount) || 0)}
                    </p>
                  </div>

                  {(() => {
                    const parsed = parseBookingNote(actionModalBooking.booking.note, actionModalBooking.booking);
                    return parsed.cancelRequest ? (
                      <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs space-y-1.5">
                        <p>
                          <span className="text-slate-500">Lý do khách gửi:</span>{" "}
                          <strong className="text-slate-900">{parsed.cancelRequest.reason || "—"}</strong>
                        </p>
                        {parsed.cancelRequest.refundEstimated && (
                          <p>
                            <span className="text-slate-500">Tiền hoàn gợi ý theo quy định:</span>{" "}
                            <strong className="text-emerald-700 font-bold">{parsed.cancelRequest.refundEstimated}</strong>
                          </p>
                        )}
                        {parsed.cancelRequest.bankAccountNumber && (
                          <p>
                            <span className="text-slate-500">Ngân hàng:</span>{" "}
                            <strong className="text-slate-800">
                              {parsed.cancelRequest.bankName} - {parsed.cancelRequest.bankAccountNumber} ({parsed.cancelRequest.bankAccountName})
                            </strong>
                          </p>
                        )}
                      </div>
                    ) : null;
                  })()}

                  {actionModalBooking.type === "approve" && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-900 block">
                        Số tiền hoàn dự kiến (VNĐ)
                      </label>
                      <PriceInput
                        label=""
                        value={actionModalRefund}
                        onChange={(value) => setActionModalRefund(String(value))}
                        icon={null}
                        suffix="đ"
                        placeholder="Ví dụ: 2.500.000"
                        inputClassName="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 pr-9 text-xs text-slate-900 font-semibold focus:border-slate-400 outline-none"
                      />
                      <p className="text-[11px] text-slate-400">
                        Số tiền hoàn sẽ được gửi trong email duyệt hủy đến khách và lưu vào lịch sử đơn.
                      </p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-900 block">
                      {actionModalBooking.type === "approve" ? "Ghi chú xử lý" : "Lý do từ chối yêu cầu"}
                    </label>
                    <textarea
                      value={actionModalNote}
                      onChange={(e) => setActionModalNote(e.target.value)}
                      rows={4}
                      placeholder={
                        actionModalBooking.type === "approve"
                          ? "Ví dụ: Hoàn tiền theo quy định chính sách hủy tour của Travol."
                          : "Ví dụ: Booking đã sát giờ khởi hành hoặc không đủ điều kiện hoàn hủy."
                      }
                      className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-slate-400 outline-none"
                    />
                  </div>
                </div>
              </AdminModalShell>
            )}
          </>
        ) : null}
      </div>
    </div>
  ), document.body);
}

