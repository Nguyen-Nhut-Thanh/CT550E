"use client";

import { Eye, EyeOff, Pencil, ScrollText, Trash2 } from "lucide-react";
import { AdminRowActions } from "@/components/common/AdminRowActions";
import type { ToursPageTour } from "shared";

export function TourRowActions({
  tour,
  busy,
  onToggle,
  onDelete,
}: {
  tour: ToursPageTour;
  busy: boolean;
  onToggle: (tour: ToursPageTour) => void;
  onDelete: (tour: ToursPageTour) => void;
}) {
  return (
    <AdminRowActions
      label={`Thao tác với ${tour.name}`}
      disabled={busy}
      actions={[
        {
          label: "Chỉnh sửa tour",
          icon: <Pencil size={16} />,
          href: `/admin/tours/${tour.tour_id}`,
        },
        {
          label: "Lưu ý tour",
          icon: <ScrollText size={16} />,
          href: `/admin/tours/${tour.tour_id}/policies`,
        },
        {
          label: tour.status === 1 ? "Tạm ẩn tour" : "Kích hoạt tour",
          icon: tour.status === 1 ? <EyeOff size={16} /> : <Eye size={16} />,
          onClick: () => onToggle(tour),
        },
        {
          label: "Xóa tour",
          icon: <Trash2 size={16} />,
          danger: true,
          onClick: () => onDelete(tour),
        },
      ]}
    />
  );
}
