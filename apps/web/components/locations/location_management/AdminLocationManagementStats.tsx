import { AdminStatCard } from "@/components/common/admin_shared/cards/AdminStatCard";
import { Building2, MapPin, Mountain, Star } from "lucide-react";
import { getLocationStatistics } from "@/lib/locations/admin/management";
import type { LocationItem } from "shared";

export function LocationManagementStats({
  items,
  loading,
}: {
  items: LocationItem[];
  loading: boolean;
}) {
  const stats = getLocationStatistics(items);
  const cards = [
    {
      label: "Tổng địa điểm",
      value: stats.total,
      hint: "Tất cả địa điểm trong hệ thống",
      icon: MapPin,
      tone: "blue",
    },
    {
      label: "Tỉnh / Thành phố",
      value: stats.provinces,
      hint: "Các tỉnh, thành phố trực thuộc vùng miền",
      icon: Building2,
      tone: "green",
    },
    {
      label: "Điểm tham quan",
      value: stats.attractions,
      hint: "Các điểm du lịch, danh lam thắng cảnh",
      icon: Mountain,
      tone: "purple",
    },
    {
      label: "Địa điểm nổi bật",
      value: stats.featured,
      hint: "Đang được đánh dấu nổi bật",
      icon: Star,
      tone: "amber",
    },
  ];
  return (
    <section
      className="ui-location-management-stats grid grid-cols-2 lg:grid-cols-4 gap-3"
      aria-label="Thống kê địa điểm"
      aria-busy={loading}
    >
      {cards.map((card) => (<AdminStatCard key={card.label} title={card.label} value={card.value.toLocaleString("vi-VN")} description={card.hint} icon={card.icon} tone={card.tone === "green" ? "green" : card.tone === "purple" ? "purple" : card.tone === "amber" ? "amber" : "blue"} loading={loading} />))}
    </section>
  );
}
