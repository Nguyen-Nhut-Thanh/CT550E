import { BriefcaseBusiness, CirclePause, Plane, Users } from "lucide-react";
import { getTourStatistics } from "@/lib/admin/tours/management";
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
      className="ui-tour-management-stats grid grid-cols-[repeat(4,_minmax(0,_1fr))] gap-[16px] admin-max-1250:gap-[10px] admin-max-750:grid-cols-[repeat(2,_minmax(0,_1fr))]"
      aria-label="Thống kê tour"
      aria-busy={loading}
    >
      {cards.map((card) => (
        <div
          key={card.label}
          className="ui-tour-management-stat [--accent:#0763ff] [--tint:#dfedff] relative overflow-hidden flex items-center gap-[12px] min-h-[82px] [background:linear-gradient(120deg,_#fff,_#f0f7ff)] [border:1px_solid_#ffffffbb] rounded-[14px] p-[12px_16px] [&[data-tone=green]]:[--accent:#009d80] [&[data-tone=green]]:[--tint:#d8f6ed] [&[data-tone=green]]:[background:linear-gradient(120deg,_#fff,_#edf9f5)] [&[data-tone=orange]]:[--accent:#f49319] [&[data-tone=orange]]:[--tint:#fff0d7] [&[data-tone=orange]]:[background:linear-gradient(120deg,_#fff,_#fff7eb)] [&[data-tone=pink]]:[--accent:#ec415d] [&[data-tone=pink]]:[--tint:#ffe0e7] [&[data-tone=pink]]:[background:linear-gradient(120deg,_#fff,_#fff0f5)] [&_p]:text-[13px] [&_p]:text-[var(--accent)] [&_p]:m-[0_0_4px] [&_strong]:text-[25px] [&_strong]:font-extrabold [&_strong]:leading-[1.1] [&_small]:block [&_small]:text-[10px] [&_small]:text-[#7183a3] [&_small]:mt-[3px] [&_small]:relative [&_small]:z-[1] min-[1600px]:min-h-[82px] min-[1600px]:p-[12px_16px] admin-max-1250:gap-[10px] admin-max-1250:p-[12px] admin-max-1250:[&_small]:text-[9px] admin-max-750:[&_strong]:text-[25px] admin-max-750:[&_p]:text-[12px] admin-max-750:p-[10px] admin-max-750:min-h-[86px] admin-max-750:[&_small]:max-w-[100px]"
          data-tone={card.tone}
        >
          <span className="ui-tour-management-statIcon grid place-items-center shrink-0 w-[42px] h-[44px] rounded-[11px] [background:var(--tint)] text-[var(--accent)] admin-max-1250:w-[42px] admin-max-1250:h-[48px] admin-max-750:w-[38px] admin-max-750:h-[44px] admin-max-750:[&_svg]:w-[23px]">
            <card.icon size={28} />
          </span>
          <div>
            <p>{card.label}</p>
            <strong>
              {loading ? "—" : card.value.toLocaleString("vi-VN")}
            </strong>
            <small>{card.hint}</small>
          </div>
          <span
            className="ui-tour-management-bars flex items-end gap-[4px] absolute right-[14px] bottom-[16px] opacity-[.13] [&_i]:w-[5px] [&_i]:rounded-[3px] [&_i]:[background:var(--accent)] admin-max-1250:hidden"
            aria-hidden="true"
          >
            {[10, 18, 26, 34, 43].map((height) => (
              <i key={height} style={{ height }} />
            ))}
          </span>
        </div>
      ))}
    </section>
  );
}
