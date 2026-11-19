import { AdminStatCard } from "@/components/common/admin_shared/cards/AdminStatCard";
import { BriefcaseBusiness, CirclePause, Plane, Users } from "lucide-react";
import { getTourStatistics } from "@/lib/tours/admin/management";
import type { ToursPageTour } from "shared";

export function TourManagementStats({
  items,
  loading,
}: {
  items: ToursPageTour[];
  loading: boolean;
}) {
  const stats = getTourStatistics(items);
  const cards = [
    {
      label: "Tổng số tour",
      value: stats.total,
      hint: "Tất cả tour trong hệ thống",
      icon: BriefcaseBusiness,
      tone: "blue",
    },
    {
      label: "Đang hoạt động",
      value: stats.active,
      hint: "Sẵn sàng hiển thị cho khách",
      icon: Plane,
      tone: "green",
    },
    {
      label: "Tạm ẩn",
      value: stats.hidden,
      hint: "Đang ẩn khỏi danh sách tour",
      icon: CirclePause,
      tone: "orange",
    },
    {
      label: "Lượt đặt",
      value: stats.bookings,
      hint: "Đơn đặt tour chưa bị hủy",
      icon: Users,
      tone: "pink",
    },
  ];
  return (
    <section
      className="ui-tour-management-stats grid grid-cols-2 lg:grid-cols-4 gap-3 @max-[1180px]/tours:grid-cols-2 @max-[650px]/tours:grid-cols-1"
      aria-label="Thống kê tour"
      aria-busy={loading}
    >
      {cards.map((card) => (<AdminStatCard key={card.label} title={card.label} value={card.value.toLocaleString("vi-VN")} description={card.hint} icon={card.icon} tone={card.tone === "green" ? "green" : card.tone === "orange" ? "amber" : card.tone === "pink" ? "rose" : "blue"} loading={loading} />))}
    </section>
  );
}
