import { Plane } from "lucide-react";
import { AdminScenicHeaderBackground } from "@/components/common/admin_shared/layout/AdminScenicHeaderBackground";

export function SchedulePageHeader() {
  return (
    <header className="ui-schedule-overview-hero relative isolate pb-[0] min-[901px]:shrink-0 @container/schedule-header">
      <AdminScenicHeaderBackground />
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
