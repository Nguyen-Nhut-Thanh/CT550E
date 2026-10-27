import Link from "next/link";
import { ChevronRight, Plane } from "lucide-react";

export function SchedulePageHeader() {
  return (
    <header className="ui-schedule-overview-hero relative isolate pb-[0] min-[901px]:shrink-0">
      <div
        className="ui-schedule-overview-scenery absolute z-[-1] [inset:-32px_-32px_-15px_42%] opacity-[.27] [background:linear-gradient(90deg,_#eff6ff,_#eff6ff22),_url('/images/about-us/cover-image-3.png')_center_42%/cover] [mask-image:linear-gradient(#000,_transparent)] admin-max-600:[inset:-24px_-24px_-10px_20%]"
        aria-hidden="true"
      />
      <nav
        aria-label="Đường dẫn"
        className="ui-schedule-overview-breadcrumb flex items-center gap-[10px] text-[12px] text-[#7288af] mb-[6px] [&_a:hover]:text-[#075bff] admin-max-600:text-[11px]"
      >
        <Link href="/admin">Trang chủ</Link>
        <ChevronRight size={14} />
        <span>Quản lý lịch khởi hành</span>
      </nav>
      <div className="ui-schedule-overview-title flex gap-[10px] items-center [&>svg]:text-[#0789ff] [&>svg]:[transform:rotate(-12deg)] [&>svg]:shrink-0 [&>svg]:w-[28px] [&>svg]:h-[28px] [&_h1]:text-[24px] [&_h1]:leading-[1.25] [&_h1]:font-extrabold [&_h1]:tracking-[-.7px]! [&_h1]:text-[#0c1c43] [&_h1]:m-[0_0_3px] [&_p]:text-[12px] [&_p]:text-[#7185aa] admin-max-1400:[&_h1]:text-[24px] admin-max-600:gap-[10px] admin-max-600:items-start admin-max-600:[&>svg]:w-[26px] admin-max-600:[&_h1]:text-[22px] admin-max-600:[&_p]:text-[12px]">
        <Plane size={36} />
        <div>
          <h1>Quản lý lịch khởi hành</h1>
          <p>Thiết lập ngày đi, giá và dịch vụ chi tiết cho từng hành trình.</p>
        </div>
      </div>
    </header>
  );
}
