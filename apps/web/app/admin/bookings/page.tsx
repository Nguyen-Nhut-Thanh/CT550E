"use client";

import { BookingManagementHeader } from "@/components/admin/bookings/BookingManagementHeader";
import { BookingManagementStats } from "@/components/admin/bookings/BookingManagementStats";
import { BookingManagementFilters } from "@/components/admin/bookings/BookingManagementFilters";
import { BookingManagementTable } from "@/components/admin/bookings/BookingManagementTable";

import {
  DEFAULT_BOOKING_FILTERS,
  parseBookingStats,
} from "@/lib/admin/bookings/management";
import { getAdminTours } from "@/lib/admin/tours/api";
import { getTourSchedules } from "@/lib/admin/schedules/api";
import { AdminModalShell } from "@/components/common/AdminModalShell";
import {
  getAdminBookingDetail,
  getAdminBookingList,
  runAdminBookingAction,
} from "@/lib/admin/bookings/api";
import { useToast } from "@/lib/notifications/useToast";
import {
  Calendar,
  CircleDollarSign,
  CreditCard,
  FileText,
  Mail,
  MapPin,
  Phone,
  Tag,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  ActionModalState,
  AdminBooking,
  AdminBookingFilters,
  AdminBookingStats,
  AdminBookingListResponse,
  AdminSchedule,
  ToursPageTour,
} from "shared";

const statusLabel: Record<string, string> = {
  pending: "Chờ thanh toán",
  paid: "Đã thanh toán",
  confirmed: "Đã xác nhận",
  cancel_requested: "Yêu cầu hủy",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
};

const statusColor: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  cancel_requested: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-slate-50 text-slate-500 border-slate-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
};

function extractCancelReason(note?: string | null) {
  if (!note) return "";
  const match = note.match(
    /\[CUSTOMER_CANCEL_REQUEST\]\s*Ly do:\s*([\s\S]*?)(?:\n\[|$)/i,
  );
  return match?.[1]?.trim() || "";
}

function getDisplayBookingNote(note?: string | null) {
  if (!note) return "";

  return note
    .replace(
      /(?:\r?\n)?\[(?:ROOM_SELECTION|CUSTOMER_CANCEL_REQUEST|ADMIN_CANCEL_APPROVED|ADMIN_CANCEL_REJECTED)\](?:\r?\n)?/gi,
      "\n",
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function AdminBookingsPage() {
  const toast = useToast();
  const [items, setItems] = useState<AdminBooking[]>([]);
  const [draft, setDraft] = useState({ ...DEFAULT_BOOKING_FILTERS });
  const [filters, setFilters] = useState({ ...DEFAULT_BOOKING_FILTERS });
  const [stats, setStats] = useState<AdminBookingStats | null>(null);
  const [tours, setTours] = useState<ToursPageTour[]>([]);
  const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [scheduleError, setScheduleError] = useState(false);
  const [scheduleRetry, setScheduleRetry] = useState(0);
  const requestId = useRef(0);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);
  const [modal, setModal] = useState<ActionModalState>(null);
  const [actionNote, setActionNote] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  const loadData = useCallback(
    async (currentPage: number) => {
      const id = ++requestId.current;
      try {
        setLoading(true);
        setError("");
        const data = await getAdminBookingList<AdminBookingListResponse>(
          currentPage,
          10,
          filters,
        );
        if (id !== requestId.current) return;
        if (currentPage > data.totalPages) {
          setPage(data.totalPages);
          return;
        }
        setItems(data.items);
        setTotal(data.total);
        setTotalPages(data.totalPages);
        setStats(parseBookingStats(data.stats));
      } catch (error) {
        if (id === requestId.current)
          setError(
            error instanceof Error
              ? error.message
              : "Không thể tải danh sách booking.",
          );
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    void loadData(page);
    return () => {
      requestId.current++;
    };
  }, [page, loadData]);
  useEffect(() => {
    let active = true;
    getAdminTours<ToursPageTour>()
      .then((data) => {
        if (active) setTours(data.items ?? []);
      })
      .catch(() => {
        if (active)
          toast.error("Không thể tải lựa chọn tour. Vui lòng tải lại trang.");
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    setSchedules([]);
    setScheduleError(false);
    if (draft.tourId === "all") {
      setLoadingSchedules(false);
      return;
    }
    setLoadingSchedules(true);
    getTourSchedules<AdminSchedule>(Number(draft.tourId))
      .then((data) => {
        if (active) setSchedules(data);
      })
      .catch(() => {
        if (active) setScheduleError(true);
      })
      .finally(() => {
        if (active) setLoadingSchedules(false);
      });
    return () => {
      active = false;
    };
  }, [draft.tourId, scheduleRetry]);
  const applyFilters = (value: Required<AdminBookingFilters>) => {
    if (value.dateFrom && value.dateTo && value.dateFrom > value.dateTo) {
      toast.error("Ngày kết thúc phải từ ngày bắt đầu trở đi.");
      return;
    }
    setDraft(value);
    setFilters({ ...value });
    setPage(1);
  };
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const openActionModal = (
    booking: AdminBooking,
    type: "approve" | "reject" | "detail",
  ) => {
    if (type === "detail") {
      void loadDetail(booking.booking_id);
    } else {
      setModal({ booking, type });
      setActionNote("");
      setRefundAmount("");
    }
  };

  const loadDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      const data = await getAdminBookingDetail<AdminBooking>(id);
      setModal({ type: "detail", booking: data });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    if (actingId) return;
    setModal(null);
    setActionNote("");
    setRefundAmount("");
  };

  const runAction = async () => {
    if (!modal || modal.type === "detail") return;

    try {
      setActingId(modal.booking.booking_id);
      const payload: Record<string, unknown> = {
        note: actionNote.trim() || undefined,
      };

      if (modal.type === "approve" && refundAmount.trim()) {
        const numericRefundAmount = Number(refundAmount.replace(/[^\d]/g, ""));
        if (Number.isNaN(numericRefundAmount)) {
          throw new Error("Số tiền hoàn dự kiến không hợp lệ.");
        }
        payload.refundAmount = numericRefundAmount;
      }

      await runAdminBookingAction(
        modal.booking.booking_id,
        modal.type === "approve" ? "approve-cancel" : "reject-cancel",
        payload,
      );
      closeModal();
      await loadData(page);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Không thể cập nhật booking.",
      );
    } finally {
      setActingId(null);
    }
  };

  const reasonPreview = useMemo(
    () =>
      modal?.type !== "detail" ? extractCancelReason(modal?.booking.note) : "",
    [modal],
  );

  return (
    <main className="ui-booking-management-page flex flex-col gap-[16px] text-[#172c50] min-w-0 [&_:is(a,_button,_input):focus-visible]:[outline:2px_solid_#3b82f6] [&_:is(a,_button,_input):focus-visible]:outline-offset-[2px]">
      <BookingManagementHeader />
      <BookingManagementStats
        stats={stats}
        loading={loading && stats === null}
        onStatus={(status) => applyFilters({ ...draft, status })}
      />
      <BookingManagementFilters
        dirty={Object.keys(DEFAULT_BOOKING_FILTERS).some(
          (key) =>
            draft[key as keyof typeof draft] !==
            filters[key as keyof typeof filters],
        )}
        value={draft}
        onChange={setDraft}
        onApply={() => applyFilters(draft)}
        tours={tours}
        schedules={schedules}
        loadingSchedules={loadingSchedules}
        scheduleError={scheduleError}
        onRetrySchedules={() => setScheduleRetry((current) => current + 1)}
        onReset={() => applyFilters({ ...DEFAULT_BOOKING_FILTERS })}
      />
      {error && (
        <div
          role="alert"
          className="ui-booking-management-error flex items-center justify-between gap-[14px] p-[13px_16px] rounded-[12px] [border:1px_solid_#ffd0d9] [background:#fff2f4] text-[#b93c55] text-[12px] [&_button]:font-bold [&_button]:underline"
        >
          <span>{error}</span>
          <button type="button" onClick={() => void loadData(page)}>
            Tải lại
          </button>
        </div>
      )}
      <BookingManagementTable
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
        loading={loading}
        busy={detailLoading || actingId !== null}
        onPage={handlePageChange}
        onAction={openActionModal}
      />
      {modal?.type === "detail" && (
        <AdminModalShell
          title={`Chi tiết đơn hàng #${modal.booking.booking_id}`}
          icon={<FileText size={18} />}
          onClose={closeModal}
          maxWidthClassName="max-w-4xl"
        >
          <div className="max-h-[80vh] overflow-y-auto p-6 space-y-8">
            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Calendar size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Ngày khởi hành
                  </span>
                </div>
                <div className="text-sm font-black text-slate-900">
                  {modal.booking.tour_schedules?.start_date
                    ? new Date(
                        modal.booking.tour_schedules.start_date,
                      ).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <Tag size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Mã Booking
                  </span>
                </div>
                <div className="text-sm font-black text-slate-900">
                  #{modal.booking.booking_id}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <CreditCard size={14} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    Trạng thái
                  </span>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase ${statusColor[modal.booking.status]}`}
                >
                  {statusLabel[modal.booking.status]}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tour & Contact */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" /> Thông tin
                    Tour
                  </h3>
                  <div className="rounded-2xl border border-slate-200 p-4 space-y-3">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">
                        Tên tour
                      </div>
                      <div className="text-sm font-bold text-slate-900 leading-snug">
                        {modal.booking.tour_schedules?.tours?.name}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          Mã tour
                        </div>
                        <div className="text-sm font-black text-blue-600 uppercase">
                          {modal.booking.tour_schedules?.tours?.code}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          Khởi hành từ
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {modal.booking.tour_schedules?.tours
                            ?.departure_locations?.name || "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User size={16} className="text-blue-600" /> Thông tin liên
                    hệ
                  </h3>
                  <div className="rounded-2xl border border-slate-200 p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <User size={14} />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">
                          Họ và tên
                        </div>
                        <div className="text-sm font-bold text-slate-900">
                          {modal.booking.contact_name}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                          <Phone size={14} />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">
                            Số điện thoại
                          </div>
                          <div className="text-sm font-bold text-slate-900">
                            {modal.booking.contact_phone}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 shrink-0">
                          <Mail size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">
                            Email
                          </div>
                          <div className="text-sm font-bold text-slate-900 truncate">
                            {modal.booking.contact_email}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Travelers */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Users size={16} className="text-blue-600" /> Danh sách
                    khách đi
                  </h3>
                  <div className="rounded-2xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-4 py-2 font-bold text-slate-500 uppercase">
                            Họ tên
                          </th>
                          <th className="px-4 py-2 font-bold text-slate-500 uppercase">
                            Loại
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {modal.booking.booking_travelers?.map((t) => (
                          <tr key={t.traveler_id}>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900 uppercase">
                                {t.full_name}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                {t.gender === "male"
                                  ? "Nam"
                                  : t.gender === "female"
                                    ? "Nữ"
                                    : t.gender}
                                {t.dob
                                  ? ` • ${new Date(t.dob).toLocaleDateString("vi-VN")}`
                                  : ""}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-black text-[9px] uppercase">
                                {t.traveler_type === "ADULT"
                                  ? "Người lớn"
                                  : t.traveler_type === "CHILD"
                                    ? "Trẻ em"
                                    : "Em bé"}
                              </span>
                            </td>
                          </tr>
                        )) || (
                          <tr>
                            <td
                              colSpan={2}
                              className="px-4 py-4 text-center text-slate-400 italic"
                            >
                              Chưa có thông tin khách đi.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CircleDollarSign size={16} className="text-blue-600" /> Chi
                    tiết thanh toán
                  </h3>
                  <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] p-6 text-slate-900 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                        <span>Số lượng khách</span>
                        <span className="text-slate-900">
                          {[
                            modal.booking.adult_count
                              ? `${modal.booking.adult_count} người lớn`
                              : null,
                            modal.booking.child_count
                              ? `${modal.booking.child_count} trẻ em`
                              : null,
                            modal.booking.infant_count
                              ? `${modal.booking.infant_count} em bé`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                      <div className="h-px bg-slate-200" />
                      <div className="flex justify-between text-xs">
                        <span className="font-bold uppercase text-slate-500">
                          Tạm tính
                        </span>
                        <span className="font-black text-slate-900">
                          {(
                            Number(modal.booking.total_amount) +
                            Number(modal.booking.discount_amount || 0)
                          ).toLocaleString("vi-VN")}
                          đ
                        </span>
                      </div>
                      {modal.booking.discount_amount &&
                        Number(modal.booking.discount_amount) > 0 && (
                          <div className="flex justify-between text-xs text-rose-600">
                            <span className="font-bold uppercase">
                              Giảm giá{" "}
                              {modal.booking.vouchers
                                ? `(${modal.booking.vouchers.code})`
                                : ""}
                            </span>
                            <span className="font-black">
                              -
                              {Number(
                                modal.booking.discount_amount,
                              ).toLocaleString("vi-VN")}
                              đ
                            </span>
                          </div>
                        )}
                      <div className="pt-2 flex justify-between items-end border-t border-slate-200">
                        <span className="text-[11px] font-black uppercase tracking-widest text-sky-700">
                          Tổng cộng
                        </span>
                        <span className="text-2xl font-black text-slate-950">
                          {Number(modal.booking.total_amount).toLocaleString(
                            "vi-VN",
                          )}
                          đ
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            {modal.booking.note && (
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-4">
                  Ghi chú & Lịch sử xử lý
                </h3>
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
                  {getDisplayBookingNote(modal.booking.note)}
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
              onClick={closeModal}
              className="px-6 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
            >
              Đóng
            </button>
          </div>
        </AdminModalShell>
      )}

      {modal?.type === "approve" || modal?.type === "reject" ? (
        <AdminModalShell
          title={
            modal.type === "approve"
              ? "Duyệt hủy booking"
              : "Từ chối yêu cầu hủy"
          }
          icon={
            modal.type === "approve" ? (
              <CircleDollarSign size={18} />
            ) : (
              <XCircle size={18} />
            )
          }
          onClose={closeModal}
          maxWidthClassName="max-w-xl"
          footer={
            <>
              <button
                type="button"
                onClick={closeModal}
                disabled={Boolean(actingId)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => void runAction()}
                disabled={Boolean(actingId)}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white ${modal.type === "approve" ? "bg-emerald-600" : "bg-slate-950"}`}
              >
                {actingId
                  ? "Đang xử lý..."
                  : modal.type === "approve"
                    ? "Xác nhận duyệt"
                    : "Xác nhận từ chối"}
              </button>
            </>
          }
        >
          <div className="space-y-5 p-6">
            <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-950">
                Booking #{modal.booking.booking_id}
              </p>
              <p className="mt-1">
                {modal.booking.tour_schedules?.tours?.name || "Tour"}
              </p>
              {reasonPreview ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Lý do khách gửi
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {reasonPreview}
                  </p>
                </div>
              ) : null}
            </div>

            {modal.type === "approve" ? (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">
                  Số tiền hoàn dự kiến
                </label>
                <input
                  value={refundAmount}
                  onChange={(event) => setRefundAmount(event.target.value)}
                  inputMode="numeric"
                  placeholder="Ví dụ: 2500000"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                />
                <p className="text-xs text-slate-500">
                  Không bắt buộc. Giá trị này sẽ được ghi vào ghi chú xử lý
                  booking.
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">
                {modal.type === "approve" ? "Ghi chú xử lý" : "Lý do từ chối"}
              </label>
              <textarea
                value={actionNote}
                onChange={(event) => setActionNote(event.target.value)}
                rows={5}
                placeholder={
                  modal.type === "approve"
                    ? "Ví dụ: Hoàn tiền theo chính sách chuyển/hủy tour của chương trình."
                    : "Ví dụ: Booking đã sát ngày khởi hành, cần liên hệ trực tiếp để xử lý."
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
              />
            </div>
          </div>
        </AdminModalShell>
      ) : null}
    </main>
  );
}
