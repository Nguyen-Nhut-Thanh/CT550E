"use client";

import { AlertTriangle, CheckCircle2, Eye, Trash2, XCircle } from "lucide-react";
import {
  AdminRowActions,
  type AdminRowAction,
} from "@/components/admin/common/AdminRowActions";
import type { AdminBooking } from "shared";

export type BookingActionType =
  | "detail"
  | "approve"
  | "reject"
  | "cancel-pending"
  | "cancel-booking";

export function BookingRowActions({
  booking,
  disabled,
  onAction,
}: {
  booking: AdminBooking;
  disabled: boolean;
  onAction: (
    booking: AdminBooking,
    type: BookingActionType,
  ) => void;
}) {
  const isDeparted = Boolean(
    booking.tour_schedules?.start_date &&
      new Date(booking.tour_schedules.start_date).getTime() <= Date.now(),
  );

  const actions: AdminRowAction[] = [
    {
      label: "Xem chi tiết booking",
      access: "view",
      icon: <Eye size={16} />,
      onClick: () => onAction(booking, "detail"),
    },
  ];

  if (booking.status === "cancel_requested") {
    actions.push(
      {
        label: "Duyệt yêu cầu hủy",
        icon: <CheckCircle2 size={16} />,
        danger: true,
        disabled: isDeparted,
        title: isDeparted
          ? "Tour đã hoặc đang trong thời gian khởi hành, không thể duyệt hủy"
          : undefined,
        onClick: () => onAction(booking, "approve"),
      },
      {
        label: "Từ chối yêu cầu hủy",
        icon: <XCircle size={16} />,
        onClick: () => onAction(booking, "reject"),
      },
    );
  } else if (booking.status === "pending") {
    actions.push({
      label: "Hủy đơn giữ chỗ",
      icon: <Trash2 size={16} />,
      danger: true,
      onClick: () => onAction(booking, "cancel-pending"),
    });
  } else if (["paid", "confirmed"].includes(booking.status)) {
    actions.push({
      label: "Hủy đơn tour (Admin)",
      icon: <AlertTriangle size={16} />,
      danger: true,
      disabled: isDeparted,
      title: isDeparted
        ? "Tour đã hoặc đang trong thời gian khởi hành, không thể hủy đơn"
        : undefined,
      onClick: () => onAction(booking, "cancel-booking"),
    });
  }

  return (
    <AdminRowActions
      label={`Thao tác booking #${booking.booking_id}`}
      disabled={disabled}
      actions={actions}
    />
  );
}
