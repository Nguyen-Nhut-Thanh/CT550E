import Link from "next/link";
import { BriefcaseBusiness, ChevronRight } from "lucide-react";

export function BookingManagementHeader() {
  return (
    <header className="ui-booking-management-header [&_nav]:flex [&_nav]:items-center [&_nav]:gap-[10px] [&_nav]:text-[#7b90b0] [&_nav]:text-[12px] [&_nav]:mb-[10px] [&_nav_a:hover]:text-[#075bff] admin-max-750:[&_nav]:text-[11px]">
      <nav aria-label="Đường dẫn">
        <Link href="/admin">Trang chủ</Link>
        <ChevronRight size={14} />
        <span>Quản lý Booking</span>
      </nav>
      <div className="ui-booking-management-title flex items-center gap-[12px] [&>svg]:text-[#0864ff] [&>svg]:shrink-0 [&_h1]:text-[25px] [&_h1]:text-[#0e2044] [&_h1]:font-extrabold [&_h1]:tracking-[-.6px]! [&_h1]:leading-[1.25] [&_h1]:mb-[4px] [&_p]:text-[#7b8faf] [&_p]:text-[12px] admin-max-750:[&_h1]:text-[22px] admin-max-750:[&_p]:text-[11px]">
        <BriefcaseBusiness size={31} />
        <div>
          <h1>Quản lý booking</h1>
          <p>Theo dõi, quản lý và xử lý các yêu cầu đặt tour của khách hàng.</p>
        </div>
      </div>
    </header>
  );
}
