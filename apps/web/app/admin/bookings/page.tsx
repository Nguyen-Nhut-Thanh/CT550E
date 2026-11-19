"use client";

import { BookingManagementHeader } from "@/components/booking/manage_booking/AdminBookingManagementHeader";
import { BookingManagementStats } from "@/components/booking/manage_booking/AdminBookingManagementStats";
import { BookingManagementFilters } from "@/components/booking/manage_booking/AdminBookingManagementFilters";
import { BookingManagementTable } from "@/components/booking/manage_booking/AdminBookingManagementTable";
import { BookingDetailModal } from "@/components/booking/manage_booking/AdminBookingDetailModal";
import { AdminApproveModalContent } from "@/components/booking/cancel_approval/AdminApproveCancelModal";
import { AdminCancelBookingModal } from "@/components/booking/cancel_approval/AdminCancelBookingModal";
import { AdminRejectModalContent } from "@/components/booking/cancel_approval/AdminRejectCancelModal";
import type { CancelRequestDetails } from "@/components/booking/cancel_request/UserBookingCancelRequestCard";

import {
  DEFAULT_BOOKING_FILTERS,
  parseBookingStats,
} from "@/lib/booking/admin/management";
import { getAdminTours } from "@/lib/tours/admin/api";
import { getTourSchedules } from "@/lib/schedules/admin/api";
import { AdminModalShell } from "@/components/common/admin_shared/layout/AdminModalShell";
import {
  adminCancelBooking,
  cancelPendingBooking,
  getAdminBookingDetail,
  getAdminBookingList,
  runAdminBookingAction,
} from "@/lib/booking/admin/api";
import { useToast } from "@/lib/notifications/useToast";
import { CircleDollarSign, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseBookingNote } from "shared";
import type { BookingActionType } from "@/components/booking/manage_booking/AdminBookingRowActions";
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
  cancel_requested: "Yêu cầu hủy",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
};

const statusColor: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancel_requested: "bg-rose-50 text-rose-700 border-rose-200",
  cancelled: "bg-slate-50 text-slate-500 border-slate-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
};

function extractCancelRequestDetails(
  note?: string | null,
  cancellationMeta?: any,
): CancelRequestDetails | null {
  if (cancellationMeta && typeof cancellationMeta === "object") {
    const meta = cancellationMeta as any;
    if (meta.cancelRequest) {
      const cr = meta.cancelRequest;
      return {
        reason: cr.reason,
        daysRemaining: cr.daysRemaining != null ? String(cr.daysRemaining) : undefined,
        tierPenalty: cr.tierPenalty,
        totalPaid: cr.totalPaid != null ? String(cr.totalPaid) : undefined,
        penaltyAmount: cr.penaltyAmount != null ? String(cr.penaltyAmount) : undefined,
        refundEstimated: cr.refundEstimated != null ? String(cr.refundEstimated) : undefined,
        bankName: cr.bankName,
        bankAccountNumber: cr.bankAccountNumber,
        bankAccountName: cr.bankAccountName,
        requestedAt: cr.requestedAt,
        numericRefundAmount: cr.numericRefundAmount != null ? Number(cr.numericRefundAmount) : undefined,
      };
    }
  }

  if (!note) return null;
  const match = note.match(/\[CUSTOMER_CANCEL_REQUEST\]([\s\S]*?)(?:\n\[|$)/i);
  if (!match) return null;
  const text = match[1];

  const reason = text.match(/L[ýy]\s*do:\s*([^\n]+)/i)?.[1]?.trim();
  const daysRemaining = text
    .match(/S[ốo]\s*ng[àa]y\s*tr[ưu][ớo]c\s*kh[ởo]i\s*h[àa]nh:\s*([^\n]+)/i)?.[1]
    ?.trim();
  const tierPenalty = text
    .match(/M[ứu]c\s*ph[ạa]t\s*h[ủu]y\s*theo\s*quy\s*[đd][ịi]nh:\s*([^\n]+)/i)?.[1]
    ?.trim();
  const totalPaid = text
    .match(/S[ốo]\s*ti[ềe]n\s*[đd][aã]\s*thanh\s*to[áa]n:\s*([^\n]+)/i)?.[1]
    ?.trim();
  const penaltyAmount = text
    .match(/Ph[íi]\s*ph[ạa]t\s*h[ủu]y:\s*([^\n]+)/i)?.[1]
    ?.trim();
  const refundEstimated = text
    .match(/S[ốo]\s*ti[ềe]n\s*ho[àa]n\s*d[ựu]\s*ki[ếe]n:\s*([^\n]+)/i)?.[1]
    ?.trim();
  const bankName = text.match(/-\s*Ng[âa]n\s*h[àa]ng:\s*([^\n]+)/i)?.[1]?.trim();
  const bankAccountNumber = text
    .match(/-\s*S[ốo]\s*t[àa]i\s*kho[ảa]n:\s*([^\n]+)/i)?.[1]
    ?.trim();
  const bankAccountName = text
    .match(/-\s*Ch[ủu]\s*t[àa]i\s*kho[ảa]n:\s*([^\n]+)/i)?.[1]
    ?.trim();
  const requestedAt = text
    .match(/Th[ờo]i\s*gian\s*g[ửu]i\s*y[êe]u\s*c[ầa]u:\s*([^\n]+)/i)?.[1]
    ?.trim();

  let numericRefundAmount: number | undefined;
  if (refundEstimated) {
    const digits = refundEstimated.replace(/[^\d]/g, "");
    if (digits) numericRefundAmount = Number(digits);
  }

  return {
    reason,
    daysRemaining,
    tierPenalty,
    totalPaid,
    penaltyAmount,
    refundEstimated,
    bankName,
    bankAccountNumber,
    bankAccountName,
    requestedAt,
    numericRefundAmount,
  };
}

function extractCancelReason(note?: string | null, cancellationMeta?: any) {
  const details = extractCancelRequestDetails(note, cancellationMeta);
  if (details?.reason) return details.reason;
  if (cancellationMeta && typeof cancellationMeta === "object" && (cancellationMeta as any).reason) {
    return (cancellationMeta as any).reason;
  }
  if (!note) return "";
  const match = note.match(
    /\[CUSTOMER_CANCEL_REQUEST\]\s*L[ýy]\s*do:\s*([\s\S]*?)(?:\n\[|$)/i,
  );
  return match?.[1]?.trim() || "";
}

function getDisplayBookingNote(note?: string | null, meta?: any) {
  if (!note && !meta) return "";
  return parseBookingNote(note, meta).customerNote;
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
  const [copiedField, setCopiedField] = useState<string | null>(null);

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
    type: BookingActionType,
  ) => {
    if (type === "detail") {
      void loadDetail(booking.booking_id);
    } else {
      setModal({ booking, type });
      setActionNote("");
      if (type === "approve") {
        const details = extractCancelRequestDetails(booking.note, booking.cancellation_meta);
        if (
          details?.numericRefundAmount !== undefined &&
          !Number.isNaN(details.numericRefundAmount)
        ) {
          setRefundAmount(String(details.numericRefundAmount));
        } else {
          setRefundAmount("");
        }
      } else if (type === "cancel-pending") {
        setActionNote("Nhân viên hủy do khách xác nhận không đi / quá hạn giữ chỗ");
        setRefundAmount("");
      } else if (type === "cancel-booking") {
        setActionNote("Admin hủy đơn booking theo yêu cầu hoặc lý do vận hành");
        setRefundAmount(String(Number(booking.total_amount) || ""));
      } else {
        setRefundAmount("");
      }
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

      if (modal.type === "cancel-pending") {
        await cancelPendingBooking(modal.booking.booking_id, actionNote.trim() || undefined);
        toast.success("Đã hủy đơn giữ chỗ thành công!");
      } else if (modal.type === "cancel-booking") {
        const numericRefund = refundAmount.trim() ? Number(refundAmount.replace(/[^\d]/g, "")) : undefined;
        await adminCancelBooking(modal.booking.booking_id, {
          reason: actionNote.trim() || "Admin hủy đơn đặt tour",
          refundAmount: numericRefund,
          note: actionNote.trim() || undefined,
        });
        toast.success("Đã hủy đơn đặt tour thành công!");
      } else {
        if (modal.type === "reject" && !actionNote.trim()) {
          toast.error("Vui lòng nhập lý do từ chối yêu cầu hủy tour.");
          return;
        }

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
        toast.success(
          modal.type === "approve"
            ? "Đã duyệt yêu cầu hủy và gửi email xác nhận hoàn tiền cho khách!"
            : "Đã từ chối yêu cầu hủy đơn!",
        );
      }

      closeModal();
      await loadData(page);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Không thể cập nhật booking.",
      );
      toast.error(actionError instanceof Error ? actionError.message : "Thao tác thất bại.");
    } finally {
      setActingId(null);
    }
  };

  const cancelDetails = useMemo(
    () =>
      modal?.type !== "detail"
        ? extractCancelRequestDetails(modal?.booking.note, modal?.booking.cancellation_meta)
        : null,
    [modal],
  );

  const reasonPreview = useMemo(
    () =>
      modal?.type !== "detail"
        ? extractCancelReason(modal?.booking.note, modal?.booking.cancellation_meta)
        : "",
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
      <BookingDetailModal
        booking={modal?.type === "detail" ? modal.booking : null}
        open={modal?.type === "detail"}
        onClose={closeModal}
        onAction={openActionModal}
      />

      {/* Modal Hủy tour dành cho Admin với giao diện 2 cột đầy đủ (áp dụng cho cả đơn đã thanh toán & đơn giữ chỗ) */}
      <AdminCancelBookingModal
        booking={
          modal?.type === "cancel-booking" || modal?.type === "cancel-pending"
            ? modal.booking
            : null
        }
        type={
          modal?.type === "cancel-pending"
            ? "cancel-pending"
            : "cancel-booking"
        }
        open={
          modal?.type === "cancel-booking" || modal?.type === "cancel-pending"
        }
        loading={Boolean(actingId)}
        onClose={closeModal}
        onConfirm={async ({
          reason,
          refundAmount: numericRefund,
          note,
          cancelType,
          resolutionOption,
          allowedOptions,
          newScheduleId,
          waiveDifference,
        }) => {
          if (!modal) return;
          try {
            setActingId(modal.booking.booking_id);
            if (modal.type === "cancel-pending") {
              await cancelPendingBooking(
                modal.booking.booking_id,
                note || reason,
              );
              toast.success("Đã hủy đơn giữ chỗ thành công!");
            } else {
              await adminCancelBooking(modal.booking.booking_id, {
                reason,
                refundAmount: numericRefund,
                note,
                cancelType,
                resolutionOption,
                allowedOptions,
                newScheduleId,
                waiveDifference,
              });
              if (cancelType === "operator_fault") {
                toast.success(
                  "Đã gửi đề xuất giải quyết cho khách hàng và gửi email thông báo thành công!",
                );
              } else if (resolutionOption === "reschedule") {
                toast.success("Đã dời lịch khởi hành tour thành công!");
              } else {
                toast.success("Đã hủy đơn đặt tour thành công!");
              }
            }
            closeModal();
            await loadData(page);
          } catch (actionError) {
            setError(
              actionError instanceof Error
                ? actionError.message
                : "Không thể cập nhật booking.",
            );
            toast.error(
              actionError instanceof Error
                ? actionError.message
                : "Thao tác thất bại.",
            );
          } finally {
            setActingId(null);
          }
        }}
      />

      {modal &&
      modal.type !== "detail" &&
      modal.type !== "cancel-booking" &&
      modal.type !== "cancel-pending" ? (
        <AdminModalShell
          title={
            modal.type === "approve"
              ? "Duyệt yêu cầu hủy & Hoàn tiền"
              : "Từ chối yêu cầu hủy tour"
          }
          icon={
            modal.type === "approve" ? (
              <CircleDollarSign size={18} />
            ) : (
              <XCircle size={18} className="text-rose-600" />
            )
          }
          onClose={closeModal}
          maxWidthClassName="max-w-4xl lg:max-w-5xl"
          footer={
            <>
              <button
                type="button"
                onClick={closeModal}
                disabled={Boolean(actingId)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => void runAction()}
                disabled={Boolean(actingId)}
                className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition cursor-pointer ${
                  modal.type === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {actingId
                  ? "Đang xử lý..."
                  : modal.type === "approve"
                    ? "Xác nhận duyệt & Hoàn tiền"
                    : "Xác nhận từ chối yêu cầu hủy"}
              </button>
            </>
          }
        >
          {modal.type === "approve" ? (
            <AdminApproveModalContent
              booking={modal.booking}
              cancelDetails={cancelDetails}
              refundAmount={refundAmount}
              setRefundAmount={setRefundAmount}
              actionNote={actionNote}
              setActionNote={setActionNote}
              copiedField={copiedField}
              setCopiedField={setCopiedField}
            />
          ) : (
            <AdminRejectModalContent
              booking={modal.booking}
              cancelDetails={cancelDetails}
              reasonPreview={reasonPreview}
              actionNote={actionNote}
              setActionNote={setActionNote}
              copiedField={copiedField}
              setCopiedField={setCopiedField}
            />
          )}
        </AdminModalShell>
      ) : null}
    </main>
  );
}
