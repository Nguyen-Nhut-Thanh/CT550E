import { AdminStatCard } from "@/components/common/admin_shared/cards/AdminStatCard";
import { CheckCircle2, Clock3, FileText, XCircle } from "lucide-react";
import type { AdminBookingStats } from "shared";

export function BookingManagementStats({
  stats,
  loading,
  onStatus,
}: {
  stats: AdminBookingStats | null;
  loading: boolean;
  onStatus: (status: string) => void;
}) {
  const cards = [
    {
      label: "Tổng booking",
      value: stats?.total,
      icon: FileText,
      tone: "blue",
      status: "all",
    },
    {
      label: "Đã thanh toán",
      value: stats?.paid,
      icon: CheckCircle2,
      tone: "green",
      status: "paid",
    },
    {
      label: "Chờ thanh toán",
      value: stats?.pending,
      icon: Clock3,
      tone: "amber",
      status: "pending",
    },
    {
      label: "Đã hủy",
      value: stats?.cancelled,
      icon: XCircle,
      tone: "red",
      status: "cancelled",
    },
  ];
  return (
    <section
      className="ui-booking-management-stats grid grid-cols-[repeat(4,_minmax(0,_1fr))] gap-3 admin-max-750:grid-cols-[repeat(2,_minmax(0,_1fr))] admin-max-750:gap-[10px]"
      aria-label="Thống kê toàn bộ booking"
      aria-busy={loading}
    >
      {cards.map((card) => (<AdminStatCard key={card.status} title={card.label} value={card.value?.toLocaleString("vi-VN") ?? "—"} description={stats ? "Trong toàn bộ booking" : "Chưa có số liệu thống kê"} icon={card.icon} tone={card.tone === "green" ? "green" : card.tone === "amber" ? "amber" : card.tone === "red" ? "rose" : "blue"} loading={loading} onClick={() => onStatus(card.status)} disabled={loading || !stats} />))}
    </section>
  );
}
