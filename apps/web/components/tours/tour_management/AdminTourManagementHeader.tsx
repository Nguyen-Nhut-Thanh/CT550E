"use client";

import { AdminScenicHeaderBackground } from "@/components/common/admin_shared/layout/AdminScenicHeaderBackground";

import { useAdminContentReadOnly } from '@/components/common/admin_shared/guards/AdminContentPermission';
import { ADMIN_CONTENT_DENIED } from 'shared';
import Link from "next/link";
import { Plus } from "lucide-react";

export function TourManagementHeader() {
  const readOnly = useAdminContentReadOnly();
  return (
    <header className="ui-tour-management-hero @container/tour-header relative pb-0.5 isolate">
      <AdminScenicHeaderBackground />
      <div className="ui-tour-management-heading flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-[-0.6px] text-[#07123e] leading-[1.25]">
            Quản lý Tour
          </h1>
          <p className="mt-1 text-[12px] text-[#637da5] leading-[1.5] max-w-[620px]">
            Quản lý, chỉnh sửa và theo dõi trạng thái tour du lịch trong hệ thống.
          </p>
        </div>
        <Link
          href="/admin/tours/create"
          aria-disabled={readOnly}
          title={readOnly ? ADMIN_CONTENT_DENIED : undefined}
          style={readOnly ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
          onClick={(event) => {
            if (readOnly) event.preventDefault();
          }}
          className="ui-tour-management-primary inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#075bff] hover:bg-[#064ddd] px-4 py-2.5 text-[14px] font-[650] text-white shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto disabled:opacity-50"
        >
          <Plus size={18} />
          <span>Thêm tour mới</span>
        </Link>
      </div>
    </header>
  );
}
