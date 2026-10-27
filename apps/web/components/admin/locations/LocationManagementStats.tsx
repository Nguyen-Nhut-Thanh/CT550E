import { Building2, MapPin, Mountain, Star } from "lucide-react";
import { getLocationStatistics } from "@/lib/admin/locations/management";
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
      className="ui-location-management-stats grid grid-cols-[repeat(4,minmax(0,1fr))] gap-[14px] admin-max-750:grid-cols-[repeat(2,minmax(0,1fr))] admin-max-750:gap-[10px]"
      aria-label="Thống kê địa điểm"
      aria-busy={loading}
    >
      {cards.map((card) => (
        <div
          className="ui-location-management-stat [--accent:#0765ff] [--tint:#e2f1ff] flex items-start gap-[14px] [border:1px_solid_#fff] rounded-[13px] [background:#fff] p-[15px_17px] [box-shadow:0_3px_10px_#477bad05] [&[data-tone=green]]:[--accent:#02aa78] [&[data-tone=green]]:[--tint:#ddfaef] [&[data-tone=purple]]:[--accent:#9044fa] [&[data-tone=purple]]:[--tint:#eee4ff] [&[data-tone=amber]]:[--accent:#efa600] [&[data-tone=amber]]:[--tint:#fff3d5] [&_p]:text-[12px] [&_p]:text-[#607699] [&_p]:mb-[3px] [&_strong]:text-[25px] [&_strong]:text-[#0b2048] [&_strong]:font-extrabold [&_strong]:leading-[1.1] [&_small]:block [&_small]:text-[#8b9ab5] [&_small]:text-[10px] [&_small]:mt-[7px] [&_small]:leading-[1.4] admin-max-1250:gap-[9px] admin-max-1250:p-[13px] admin-max-1250:[&_small]:text-[9px] admin-max-750:p-[12px] admin-max-750:gap-[9px] admin-max-750:[&_p]:text-[11px] admin-max-750:[&_strong]:text-[23px] admin-max-750:[&_small]:text-[9px]"
          key={card.label}
          data-tone={card.tone}
        >
          <span className="ui-location-management-statIcon grid place-items-center w-[44px] h-[44px] [background:var(--tint)] text-[var(--accent)] [border:1px_solid_color-mix(in_srgb,var(--accent)_12%,transparent)] rounded-[12px] shrink-0 admin-max-1250:w-[38px] admin-max-1250:h-[40px] admin-max-1250:[&_svg]:w-[23px] admin-max-750:w-[34px] admin-max-750:h-[37px]">
            <card.icon size={25} />
          </span>
          <div>
            <p>{card.label}</p>
            <strong>
              {loading ? "—" : card.value.toLocaleString("vi-VN")}
            </strong>
            <small>{card.hint}</small>
          </div>
        </div>
      ))}
    </section>
  );
}
