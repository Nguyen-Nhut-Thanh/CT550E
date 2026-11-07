"use client";

import { LocationSelectField } from "./LocationSelectField";
import { MapPin } from "lucide-react";
import type { LocationHierarchyCardProps } from "shared";

export function LocationHierarchyCard(props: LocationHierarchyCardProps & { disabled?: boolean }) {
  const country = props.level3List.find(item => String(item.location_id) === props.level3Id)?.name;
  const region = props.level4List.find(item => String(item.location_id) === props.level4Id)?.name;
  const province = props.level5List.find(item => String(item.location_id) === props.level5Id)?.name;
  const path = ["Toàn cầu", country, props.form.level_id > 4 ? region : null, props.form.level_id > 5 ? province : null].filter(Boolean);

  return (
    <div className="mt-4 space-y-3 border-t border-[#e7edf7] pt-4">
      <div>
        <h3 className="text-[14px] font-bold text-[#102044]">Vị trí trong hệ thống</h3>
        <p className="mt-1 text-[12px] leading-5 text-[#7d8eac]">Chọn vị trí địa lý của địa điểm trong hệ thống phân cấp.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <LocationSelectField label="Quốc gia" value={props.level3Id} options={props.level3List} disabled={props.disabled} loading={props.loadingL3} placeholder="Chọn quốc gia" onChange={props.onLevel3Change} />
        {props.form.level_id > 4 && <LocationSelectField label="Vùng / Miền" value={props.level4Id} options={props.level4List} disabled={props.disabled || !props.level3Id} loading={props.loadingL4} placeholder="Chọn vùng / miền" onChange={props.onLevel4Change} />}
        {props.form.level_id > 5 && <LocationSelectField label="Tỉnh / Thành phố" value={props.level5Id} options={props.level5List} disabled={props.disabled || !props.level4Id} loading={props.loadingL5} placeholder="Chọn tỉnh / thành phố" onChange={props.onLevel5Change} />}
      </div>
      <div className="flex items-start gap-2.5 rounded-[9px] bg-[#edf5ff] px-3 py-3 text-[12px] leading-5 text-[#0766ff]">
        <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
        <ol aria-label="Vị trí địa điểm trong hệ thống" className="flex flex-wrap gap-x-2 gap-y-1">
          {path.map((name, index) => <li key={index} className="flex items-center gap-2">{index > 0 && <span aria-hidden="true">/</span>}{name}</li>)}
        </ol>
      </div>
    </div>
  );
}
