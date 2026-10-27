"use client";

import { CheckCircle2, Eye, XCircle } from "lucide-react";
import {
  AdminRowActions,
  type AdminRowAction,
} from "@/components/common/AdminRowActions";
import type { AdminBooking } from "shared";

export function BookingRowActions({
  booking,
  disabled,
  onAction,
}: {
  booking: AdminBooking;
  disabled: boolean;
  onAction: (
    booking: AdminBooking,
    type: "detail" | "approve" | "reject",
  ) => void;
}) {
  const actions: AdminRowAction[] = [
    {
      label: "Xem chi tiết booking",
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
        onClick: () => onAction(booking, "approve"),
      },
      {
        label: "Từ chối yêu cầu hủy",
        icon: <XCircle size={16} />,
        onClick: () => onAction(booking, "reject"),
      },
    );
  }
  return (
    <AdminRowActions
      label={`Thao tác booking #${booking.booking_id}`}
      disabled={disabled}
      actions={actions}
    />
  );
}
