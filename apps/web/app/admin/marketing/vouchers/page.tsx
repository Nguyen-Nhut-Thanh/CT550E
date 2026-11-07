"use client";

import { VoucherModal } from "@/components/admin/vouchers/VoucherModal";
import { VoucherStatusFilterTabs } from "@/components/admin/vouchers/VoucherStatusFilterTabs";
import { AdminPageHeader } from "@/components/admin/common/AdminPageHeader";
import { AdminSearchInput } from "@/components/admin/common/AdminSearchInput";
import { AdminStatusBadge } from "@/components/admin/common/AdminStatusBadge";
import { AdminTable } from "@/components/admin/common/AdminTable";
import { AdminRowActions } from "@/components/admin/common/AdminRowActions";
import { ConfirmDialog } from "@/components/common/overlays/ConfirmDialog";
import {
  createAdminVoucher,
  deleteAdminVoucher,
  getAdminVouchers,
  setAdminVoucherStatus,
} from "@/lib/admin/vouchers/api";
import {
  buildVoucherForm,
  buildVoucherPayload,
  createDefaultVoucherForm,
  filterVouchers,
  getVoucherDateParts,
} from "@/lib/admin/vouchers/forms";
import { useToast } from "@/lib/notifications/useToast";
import { formatVND } from "@/lib/utils/currency";
import { getVoucherStatus } from "@/lib/vouchers/status";
import { AlertTriangle, CheckCircle2, Clock, Eye, Lock, LockOpen, Tag, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Voucher, VoucherForm, VoucherStatusFilter } from "shared";

const voucherDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Bangkok", day: "2-digit", month: "2-digit", year: "numeric",
});
const voucherTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Bangkok", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

function VoucherDateCell({ value, label, muted = false }: { value: string; label: string; muted?: boolean }) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return <span className="text-slate-400">—</span>;
  return <time dateTime={date.toISOString()} title={label} className={`block whitespace-nowrap text-xs tabular-nums ${muted ? "text-slate-400" : "font-medium text-slate-700"}`}>
    <span className="sr-only">{label}: </span>
    {voucherTimeFormatter.format(date)} <span aria-hidden="true">–</span> {voucherDateFormatter.format(date)}
  </time>;
}

function VoucherStatusBadge({ voucher }: { voucher: Voucher }) {
  const status = getVoucherStatus(voucher);
  const badges = {
    active: { label: "Hoạt động", tone: "success", icon: CheckCircle2 },
    locked: { label: "Tạm khóa", tone: "muted", icon: Lock },
    upcoming: { label: "Sắp có hiệu lực", tone: "muted", icon: Clock },
    expired: { label: "Hết hạn", tone: "warning", icon: Clock },
    exhausted: { label: "Hết lượt", tone: "warning", icon: AlertTriangle },
  } as const;
  const { label, tone, icon: Icon } = badges[status];
  const color = status === "locked"
    ? "[&&]:border-red-200 [&&]:bg-red-50 [&&]:text-red-600"
    : status === "upcoming"
      ? "[&&]:border-blue-200 [&&]:bg-blue-50 [&&]:text-blue-600"
      : undefined;
  return <AdminStatusBadge tone={tone} className={color} icon={<Icon size={12} />}>{label}</AdminStatusBadge>;
}

export default function AdminVouchersPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const busyIds = useRef(new Set<number>());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<VoucherStatusFilter>("all");
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [pendingDeleteVoucher, setPendingDeleteVoucher] =
    useState<Voucher | null>(null);
  const [form, setForm] = useState<VoucherForm>(createDefaultVoucherForm);
  const { success, error: showError } = useToast();

  const isReadonlyVoucher = !!editingVoucher;
  const { minDate, minTime, startDateValue, startTimeValue } =
    getVoucherDateParts(form.start_date);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      setVouchers(await getAdminVouchers());
    } catch {
      showError("Lỗi tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredVouchers = useMemo(
    () => filterVouchers(vouchers, searchTerm, statusFilter),
    [vouchers, searchTerm, statusFilter],
  );

  const openVoucherModal = (voucher: Voucher | null = null) => {
    setEditingVoucher(voucher);
    setForm(voucher ? buildVoucherForm(voucher) : createDefaultVoucherForm());
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVoucher(null);
    setForm(createDefaultVoucherForm());
  };

  const handleSaveVoucher = async () => {
    if (saving) return;
    if (!form.customer_types.length) { showError("Vui lòng chọn ít nhất một đối tượng áp dụng"); return; }
    if (editingVoucher) {
      showError("Voucher đã tạo không thể chỉnh sửa, hãy tạo voucher mới");
      return;
    }

    if (
      !form.code ||
      !form.discount_value ||
      !form.duration_hours ||
      !form.usage_limit
    ) {
      showError("Vui lòng nhập đầy đủ mã, mức giảm, thời hạn và số lượng");
      return;
    }

    const startDate = new Date(form.start_date);
    if (Number.isNaN(startDate.getTime()) || startDate.getTime() < Date.now()) {
      showError("Ngày bắt đầu phải từ thời điểm hiện tại trở đi");
      return;
    }

    setSaving(true);

    try {
      const created = await createAdminVoucher(buildVoucherPayload(form));
      success(form.status === 1 ? `Đã tạo voucher và gửi ${created.notification_count ?? 0} thông báo đến nhóm khách đã chọn` : "Đã tạo voucher tạm dừng, chưa gửi thông báo");
      closeModal();
      void loadData();
    } catch (cause) {
      showError(cause instanceof Error ? cause.message : "Không thể tạo voucher");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVoucher = async (voucher: Voucher) => {
    if (busyIds.current.has(voucher.voucher_id)) return;
    if (voucher.used_count > 0) {
      showError("Voucher đã có lượt sử dụng, không thể xóa.");
      setPendingDeleteVoucher(null);
      return;
    }

    busyIds.current.add(voucher.voucher_id);
    setPendingIds(current => [...current, voucher.voucher_id]);
    try {
      await deleteAdminVoucher(voucher.voucher_id);
      success("Đã xóa voucher thành công");
      setVouchers((current) =>
        current.filter((item) => item.voucher_id !== voucher.voucher_id),
      );
      setPendingDeleteVoucher(null);
    } catch {
      showError("Lỗi kết nối");
    } finally {
      busyIds.current.delete(voucher.voucher_id);
      setPendingIds(current => current.filter(id => id !== voucher.voucher_id));
    }
  };

  const handleToggleVoucher = async (voucher: Voucher) => {
    if (busyIds.current.has(voucher.voucher_id)) return;
    const status = voucher.status === 1 ? 0 : 1;
    const currentStatus = getVoucherStatus(voucher);
    if (status === 1 && (currentStatus === "expired" || currentStatus === "exhausted")) {
      showError(currentStatus === "expired" ? "Voucher đã hết hạn, không thể mở lại." : "Voucher đã hết lượt, không thể mở lại.");
      return;
    }
    busyIds.current.add(voucher.voucher_id);
    setPendingIds(current => [...current, voucher.voucher_id]);
    try {
      const updated = await setAdminVoucherStatus(voucher.voucher_id, status);
      setVouchers(current => current.map(item => item.voucher_id === voucher.voucher_id ? { ...item, ...updated, notification_count: (item.notification_count ?? 0) + (updated.notification_count ?? 0) } : item));
      success(status === 0 ? "Đã khóa voucher. Các đơn mới không thể sử dụng mã này." : `Đã mở voucher${updated.notification_count ? ` và gửi ${updated.notification_count} thông báo` : ""}.`);
    } catch (cause) {
      showError(cause instanceof Error ? cause.message : "Không thể thay đổi trạng thái voucher.");
    } finally {
      busyIds.current.delete(voucher.voucher_id);
      setPendingIds(current => current.filter(id => id !== voucher.voucher_id));
    }
  };

  const handleStartDateChange = (datePart: string) => {
    const timePart = startTimeValue || minTime;
    setForm((current) => ({
      ...current,
      start_date: `${datePart}T${timePart}`,
    }));
  };

  const handleStartTimeChange = (timePart: string) => {
    const datePart = startDateValue || minDate;
    setForm((current) => ({
      ...current,
      start_date: `${datePart}T${timePart}`,
    }));
  };

  const columns = [
    {
      header: "Mã voucher",
      render: (voucher: Voucher) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
            <Tag size={18} />
          </div>
          <span className="font-bold uppercase tracking-wider text-slate-900">
            {voucher.code}
          </span>
        </div>
      ),
    },
    {
      header: "Mức giảm",
      render: (voucher: Voucher) => (
        <span className="font-bold text-blue-600">
          {voucher.discount_type === "percentage"
            ? `-${voucher.discount_value}%`
            : `-${formatVND(voucher.discount_value)}`}
        </span>
      ),
    },
    {
      header: "Đơn tối thiểu",
      render: (voucher: Voucher) => (
        <span className="font-medium italic text-slate-600">
          Từ {formatVND(voucher.min_order_value)}
        </span>
      ),
    },
    {
      header: "Thời gian áp dụng",
      className: "whitespace-nowrap",
      render: (voucher: Voucher) => <div className="space-y-1.5">
        <VoucherDateCell value={voucher.start_date} label="Bắt đầu" />
        <VoucherDateCell value={voucher.expiry_date} label="Kết thúc" muted />
      </div>,
    },
    {
      header: "Đã dùng / GH",
      align: "center" as const,
      render: (voucher: Voucher) => (
        <span className="font-bold text-slate-700">
          {voucher.used_count} / {voucher.usage_limit}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      align: "center" as const,
      render: (voucher: Voucher) => <VoucherStatusBadge voucher={voucher} />,
    },
    {
      header: "Thao tác",
      align: "right" as const,
      className: "w-[100px] whitespace-nowrap",
      render: (voucher: Voucher) => <AdminRowActions
        label={`Thao tác với voucher ${voucher.code}`}
        disabled={loading || saving || pendingIds.includes(voucher.voucher_id)}
        actions={[
          { label: "Xem chi tiết", access: 'view', icon: <Eye size={16} />, onClick: () => openVoucherModal(voucher) },
          {
            label: voucher.status === 1 ? "Khóa voucher" : "Mở voucher",
            icon: voucher.status === 1 ? <Lock size={16} /> : <LockOpen size={16} />,
            disabled: voucher.status !== 1 && ["expired", "exhausted"].includes(getVoucherStatus(voucher)),
            title: getVoucherStatus(voucher) === "expired" ? "Voucher đã hết hạn" : getVoucherStatus(voucher) === "exhausted" ? "Voucher đã hết lượt" : undefined,
            onClick: () => void handleToggleVoucher(voucher),
          },
          {
            label: "Xóa voucher",
            icon: <Trash2 size={16} />,
            danger: true,
            disabled: voucher.used_count > 0,
            title: voucher.used_count > 0 ? "Voucher đã có lượt sử dụng, không thể xóa" : undefined,
            onClick: () => setPendingDeleteVoucher(voucher),
          },
        ]}
      />,
    },
  ];

  return (
    <div className="relative space-y-4">
      <AdminPageHeader
        title="Mã giảm giá (Vouchers)"
        description="Quản lý các chương trình ưu đãi nhập mã khuyến mãi."
        primaryAction={{
          label: "Tạo mã mới",
          onClick: () => openVoucherModal(),
        }}
      />

      <AdminSearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Tìm theo mã voucher..."
      />

      <VoucherStatusFilterTabs
        value={statusFilter}
        onChange={setStatusFilter}
      />

      <AdminTable
        items={filteredVouchers}
        columns={columns}
        loading={loading}
        rowKey={(voucher) => voucher.voucher_id}
        pageSize={10}
        itemLabel="voucher"
        emptyMessage="Không tìm thấy voucher nào phù hợp"
      />

      <VoucherModal
        open={showModal}
        saving={saving}
        readonly={isReadonlyVoucher}
        form={form}
        minDate={minDate}
        minTime={minTime}
        startDateValue={startDateValue}
        startTimeValue={startTimeValue}
        title={editingVoucher ? "Chi tiết voucher" : "Tạo voucher mới"}
        onClose={closeModal}
        onSave={handleSaveVoucher}
        onChange={(updater) => setForm((current) => updater(current))}
        onStartDateChange={handleStartDateChange}
        onStartTimeChange={handleStartTimeChange}
      />

      <ConfirmDialog
        open={pendingDeleteVoucher !== null}
        icon={<AlertTriangle size={32} />}
        title="Xóa voucher?"
        description="Voucher này sẽ bị xóa khỏi hệ thống. Hành động này không thể hoàn tác."
        confirmLabel="Xác nhận xóa"
        cancelLabel="Hủy bỏ"
        onConfirm={() => {
          if (pendingDeleteVoucher) {
            void handleDeleteVoucher(pendingDeleteVoucher);
          }
        }}
        onCancel={() => setPendingDeleteVoucher(null)}
      />
    </div>
  );
}
