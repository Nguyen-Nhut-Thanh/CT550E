"use client";

import { useAdminContentReadOnly } from '@/components/common/admin_shared/guards/AdminContentPermission';
import { ADMIN_CONTENT_DENIED } from 'shared';
import Link from "next/link";
import { MapPin, Plus, Settings2 } from "lucide-react";
import { AdminScenicHeaderBackground } from "@/components/common/admin_shared/layout/AdminScenicHeaderBackground";

export function LocationManagementHeader() {
  const readOnly = useAdminContentReadOnly();
  return (
    <header className="relative isolate flex items-center justify-between gap-4 p-[2px_0] admin-max-750:items-start admin-max-750:flex-col @container/location-header">
      <AdminScenicHeaderBackground />
      <div className="flex items-center gap-3">
        <span className="grid place-items-center w-10 h-10 rounded-xl text-[#075bff] bg-blue-50 shrink-0 shadow-xs">
          <MapPin size={22} />
        </span>
        <div>
          <h1 className="text-[24px] font-extrabold leading-[1.25] tracking-[-.6px] text-[#07123e]">
            Quản lý địa điểm
          </h1>
          <p className="text-xs text-[#7187a9] mt-0.5">
            Quản lý danh mục vùng miền, tỉnh thành và các điểm tham quan.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href="/admin/banners?tab=featured"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-semibold whitespace-nowrap text-amber-700 hover:bg-amber-100/80 transition-colors shadow-2xs"
        >
          <Settings2 size={15} />
          Thiết lập grid
        </Link>
        <Link
          href="/admin/locations/new"
          aria-disabled={readOnly}
          title={readOnly ? ADMIN_CONTENT_DENIED : undefined}
          style={readOnly ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
          onClick={(event) => {
            if (readOnly) event.preventDefault();
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#075bff] hover:bg-[#064ddd] px-4 py-2 text-xs font-[650] whitespace-nowrap text-white transition-colors shadow-xs"
        >
          <Plus size={16} />
          Thêm địa điểm
        </Link>
      </div>
    </header>
  );
}
