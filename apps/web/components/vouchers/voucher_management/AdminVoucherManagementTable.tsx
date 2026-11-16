"use client";

import { AdminRowActions } from "@/components/common/admin_shared/tables/AdminRowActions";
import { AdminStatusBadge } from "@/components/common/admin_shared/controls/AdminStatusBadge";
import { AdminTable } from "@/components/common/admin_shared/tables/AdminTable";
import { formatVND } from "@/lib/utils/currency";
import { getVoucherStatus } from "@/lib/vouchers/client/status";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  Lock,
  LockOpen,
  Trash2,
} from "lucide-react";
import type { Voucher } from "shared";

const voucherDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Bangkok",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const voucherTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Bangkok",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function VoucherDateCell({
  value,
  label,
  muted = false,
}: {
  value: string;
  label: string;
  muted?: boolean;
}) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return <span className="text-slate-400">—</span>;
  return (
    <time
      dateTime={date.toISOString()}
      title={label}
      className={`block whitespace-nowrap text-xs tabular-nums ${
        muted ? "text-slate-400" : "font-medium text-slate-700"
      }`}
    >
      <span className="sr-only">{label}: </span>
      {voucherTimeFormatter.format(date)} <span aria-hidden="true">–</span>{" "}
      {voucherDateFormatter.format(date)}
    </time>
  );
}

export function VoucherStatusBadge({ voucher }: { voucher: Voucher }) {
  const status = getVoucherStatus(voucher);
  const badges = {
    active: { label: "Hoạt động", tone: "success", icon: CheckCircle2 },
    locked: { label: "Tạm khóa", tone: "muted", icon: Lock },
    upcoming: { label: "Sắp có hiệu lực", tone: "muted", icon: Clock },
    expired: { label: "Hết hạn", tone: "warning", icon: Clock },
    exhausted: { label: "Hết lượt", tone: "warning", icon: AlertTriangle },
  } as const;
  const { label, tone, icon: Icon } = badges[status];
  const color =
    status === "locked"
      ? "[&&]:border-red-200 [&&]:bg-red-50 [&&]:text-red-600"
      : status === "upcoming"
        ? "[&&]:border-blue-200 [&&]:bg-blue-50 [&&]:text-blue-600"
        : undefined;

  return (
    <AdminStatusBadge tone={tone} className={color} icon={<Icon size={12} />}>
      {label}
    </AdminStatusBadge>
  );
}

export interface VoucherManagementTableProps {
  vouchers: Voucher[];
  loading: boolean;
  onView: (voucher: Voucher) => void;
  onToggleStatus: (voucher: Voucher) => void;
  onDelete: (voucher: Voucher) => void;
}

export function VoucherManagementTable({
  vouchers,
  loading,
  onView,
  onToggleStatus,
  onDelete,
}: VoucherManagementTableProps) {
  const columns = [
    {
      header: "Mã",
      render: (voucher: Voucher) => (
        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
          {voucher.code}
        </span>
      ),
    },
    {
      header: "Chiết khấu",
      render: (voucher: Voucher) => (
        <span className="font-bold text-slate-800">
          {voucher.discount_type === "percentage"
            ? `${voucher.discount_value}%`
            : formatVND(voucher.discount_value)}
        </span>
      ),
    },
    {
      header: "Đơn tối thiểu",
      render: (voucher: Voucher) => (
        <span className="text-xs text-slate-600">
          {formatVND(voucher.min_order_value)}
        </span>
      ),
    },
    {
      header: "Giảm tối đa",
      render: (voucher: Voucher) => (
        <span className="text-xs text-slate-600">
          {voucher.max_discount_amount
            ? formatVND(voucher.max_discount_amount)
            : "—"}
        </span>
      ),
    },
    {
      header: "Đã dùng / Giới hạn",
      render: (voucher: Voucher) => (
        <span className="text-xs text-slate-600">
          {voucher.used_count} / {voucher.usage_limit}
        </span>
      ),
    },
    {
      header: "Hiệu lực từ",
      render: (voucher: Voucher) => (
        <VoucherDateCell value={voucher.start_date} label="Thời gian bắt đầu" />
      ),
    },
    {
      header: "Hết hạn",
      render: (voucher: Voucher) => (
        <VoucherDateCell value={voucher.expiry_date} label="Thời gian hết hạn" />
      ),
    },
    {
      header: "Trạng thái",
      render: (voucher: Voucher) => <VoucherStatusBadge voucher={voucher} />,
    },
    {
      header: "",
      align: "right" as const,
      render: (voucher: Voucher) => (
        <AdminRowActions
          label={`Thao tác với voucher ${voucher.code}`}
          actions={[
            {
              label: "Xem chi tiết",
              icon: <Eye size={16} />,
              onClick: () => onView(voucher),
            },
            {
              label: voucher.status === 1 ? "Tạm khóa" : "Mở khóa",
              icon:
                voucher.status === 1 ? (
                  <Lock size={16} />
                ) : (
                  <LockOpen size={16} />
                ),
              onClick: () => onToggleStatus(voucher),
            },
            {
              label: "Xóa",
              icon: <Trash2 size={16} />,
              danger: true,
              disabled: voucher.used_count > 0,
              title:
                voucher.used_count > 0
                  ? "Voucher đã có lượt sử dụng, không thể xóa"
                  : undefined,
              onClick: () => onDelete(voucher),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <AdminTable
      items={vouchers}
      columns={columns}
      loading={loading}
      rowKey={(voucher) => voucher.voucher_id}
      pageSize={10}
      itemLabel="voucher"
      emptyMessage="Không tìm thấy voucher nào phù hợp"
    />
  );
}
