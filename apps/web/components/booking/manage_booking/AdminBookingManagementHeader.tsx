import { BriefcaseBusiness } from "lucide-react";
import { AdminScenicHeaderBackground } from "@/components/common/admin_shared/layout/AdminScenicHeaderBackground";

export function BookingManagementHeader() {
  return (
    <header className="ui-booking-management-header relative isolate @container/booking-header">
      <AdminScenicHeaderBackground />
      <div className="ui-booking-management-title flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#075bff] shadow-xs">
          <BriefcaseBusiness size={24} />
        </div>
        <div className="min-w-0">
          <h1 className="text-[24px] font-extrabold leading-[1.25] tracking-[-.6px]! text-[#07123e] @max-[760px]/booking-header:text-[22px]">
            Quản lý booking
          </h1>
          <p className="mt-[3px] text-[12px] leading-[1.5] text-[#637da5]">
            Theo dõi, quản lý và xử lý các yêu cầu đặt tour của khách hàng.
          </p>
        </div>
      </div>
    </header>
  );
}
