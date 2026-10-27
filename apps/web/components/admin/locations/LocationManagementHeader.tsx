import Link from "next/link";
import { MapPin, Plus, Settings2 } from "lucide-react";

export function LocationManagementHeader() {
  return (
    <header className="ui-location-management-header flex items-center justify-between gap-[16px] p-[2px_0] admin-max-750:items-start admin-max-750:flex-col admin-max-750:gap-[12px]">
      <div className="ui-location-management-heading flex items-center gap-[12px] [&_h1]:text-[24px] [&_h1]:font-extrabold [&_h1]:leading-[1.25] [&_h1]:tracking-[-.6px]! [&_h1]:text-[#0c1e43] [&_h1]:m-[0_0_3px] [&_p]:text-[#7a8eae] [&_p]:text-[12px] admin-max-750:[&_h1]:text-[22px] admin-max-750:[&_p]:text-[11px]">
        <span className="ui-location-management-headingIcon grid place-items-center w-[42px] h-[42px] rounded-[12px] text-[#0765ff] [background:#dfecff] shrink-0">
          <MapPin size={25} />
        </span>
        <div>
          <h1>Quản lý địa điểm</h1>
          <p>Quản lý danh mục vùng miền, tỉnh thành và các điểm tham quan.</p>
        </div>
      </div>
      <div className="ui-location-management-headerActions flex items-center gap-[10px] flex-wrap">
        <Link
          href="/admin/locations/featured"
          className="ui-location-management-gridLink inline-flex items-center justify-center gap-[8px] rounded-[9px] p-[10px_14px] text-[12px] font-[650] whitespace-nowrap [background:#fff9e9] text-[#d88b10] [border:1px_solid_#fcecc8] [&:hover]:[background:#fff1cf] admin-max-750:text-[11px] admin-max-750:p-[9px_12px]"
        >
          <Settings2 size={16} />
          Thiết lập grid
        </Link>
        <Link
          href="/admin/locations/new"
          className="ui-location-management-primary inline-flex items-center justify-center gap-[8px] rounded-[9px] p-[10px_14px] text-[12px] font-[650] whitespace-nowrap [background:#075bff] text-[white] [box-shadow:0_3px_8px_#075bff20] [&:hover]:[background:#0646ce] admin-max-750:text-[11px] admin-max-750:p-[9px_12px]"
        >
          <Plus size={18} />
          Thêm địa điểm
        </Link>
      </div>
    </header>
  );
}
