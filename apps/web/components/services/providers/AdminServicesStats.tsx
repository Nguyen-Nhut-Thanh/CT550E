import { Building2, Car, CheckCircle2, CirclePause, Hotel, Layers, MapPin, Users } from "lucide-react";
import { AdminStatGrid } from "@/components/common/admin_shared/cards/AdminStatGrid";
import type { AdminHotel, AdminProvider, AdminTransport } from "shared";
import type { ServicesTab } from "./AdminServicesTabSwitcher";

export function ServicesStats({ activeTab, hotels, transports, providers, loading }: {
  activeTab: ServicesTab; hotels: AdminHotel[]; transports: AdminTransport[]; providers: AdminProvider[]; loading: boolean;
}) {
  const rows = activeTab === "hotels" ? hotels : activeTab === "transports" ? transports : providers;
  const title = activeTab === "hotels" ? "Tổng khách sạn" : activeTab === "transports" ? "Tổng phương tiện" : "Tổng đối tác";
  const icon = activeTab === "hotels" ? Hotel : activeTab === "transports" ? Car : Building2;
  const extra = activeTab === "hotels"
    ? { id: "locations", title: "Địa điểm có khách sạn", value: new Set(hotels.map(hotel => hotel.location_id)).size, icon: MapPin }
    : activeTab === "transports"
      ? { id: "capacity", title: "Tổng sức chứa", value: transports.filter(item => item.status === 1).reduce((sum, item) => sum + item.capacity, 0).toLocaleString("vi-VN"), description: "Phương tiện đang hoạt động", icon: Users }
      : { id: "types", title: "Loại đối tác", value: new Set(providers.map(item => item.type).filter(Boolean)).size, icon: Layers };
  return <AdminStatGrid label="Thống kê danh mục dịch vụ đang chọn" loading={loading} items={[
    { id: "total", title, value: rows.length, icon },
    { id: "active", title: "Đang hoạt động", value: rows.filter(item => item.status === 1).length, icon: CheckCircle2, tone: "green" },
    { id: "paused", title: "Tạm dừng", value: rows.filter(item => item.status === 0).length, icon: CirclePause, tone: "amber" },
    { ...extra, tone: "purple" },
  ]} />;
}
