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
      className="ui-booking-management-stats grid grid-cols-[repeat(4,_minmax(0,_1fr))] gap-[15px] admin-max-750:grid-cols-[repeat(2,_minmax(0,_1fr))] admin-max-750:gap-[10px]"
      aria-label="Thống kê toàn bộ booking"
      aria-busy={loading}
    >
      {cards.map((card) => (
        <button
          type="button"
          key={card.status}
          className="ui-booking-management-stat [--accent:#0765ff] [--tint:#e1efff] flex items-center gap-[16px] text-left p-[18px] [border:1px_solid_#e3edf9] rounded-[16px] [background:linear-gradient(120deg,_#fff,_#f4f9ff)] [box-shadow:0_4px_12px_#527aaa04] [&[data-tone=green]]:[--accent:#09ad7c] [&[data-tone=green]]:[--tint:#dcf9eb] [&[data-tone=green]]:[background:linear-gradient(120deg,_#fff,_#f0fbf6)] [&[data-tone=amber]]:[--accent:#f1a000] [&[data-tone=amber]]:[--tint:#fff2d5] [&[data-tone=amber]]:[background:linear-gradient(120deg,_#fff,_#fffbf2)] [&[data-tone=red]]:[--accent:#f33652] [&[data-tone=red]]:[--tint:#ffe0e6] [&[data-tone=red]]:[background:linear-gradient(120deg,_#fff,_#fff5f7)] [&:hover:enabled]:[border-color:#bad2f8] [&_p]:text-[12px] [&_p]:text-[#7286a8] [&_p]:mb-[6px] [&_strong]:text-[26px] [&_strong]:font-extrabold [&_strong]:leading-[1.1] [&_strong]:text-[#102349] [&_small]:block [&_small]:mt-[5px] [&_small]:text-[10px] [&_small]:text-[#93a1b9] admin-max-1250:gap-[10px] admin-max-1250:p-[14px] admin-max-750:p-[12px] admin-max-750:gap-[9px] admin-max-750:[&_p]:text-[11px] admin-max-750:[&_strong]:text-[23px] admin-max-750:[&_small]:text-[9px] admin-max-750:[&_small]:leading-[1.4]"
          data-tone={card.tone}
          onClick={() => onStatus(card.status)}
          disabled={loading || !stats}
        >
          <span className="ui-booking-management-statIcon grid place-items-center w-[49px] h-[52px] rounded-[13px] text-[var(--accent)] [background:var(--tint)] shrink-0 admin-max-1250:w-[40px] admin-max-1250:h-[44px] admin-max-1250:[&_svg]:w-[23px] admin-max-750:w-[36px] admin-max-750:h-[40px]">
            <card.icon size={25} />
          </span>
          <div>
            <p>{card.label}</p>
            <strong>
              {loading || card.value === undefined
                ? "—"
                : card.value.toLocaleString("vi-VN")}
            </strong>
            <small>
              {stats ? "Trong toàn bộ booking" : "Chưa có số liệu thống kê"}
            </small>
          </div>
        </button>
      ))}
    </section>
  );
}
