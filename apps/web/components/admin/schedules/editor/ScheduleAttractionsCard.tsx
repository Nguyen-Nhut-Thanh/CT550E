"use client";

import { TourEditorCard } from "@/components/admin/tours/editor/TourEditorCard";
import { getItineraryProvinces, getProvinceAttractions, toggleScheduleAttraction } from "@/lib/admin/schedules/itinerary";
import { Check, MapPin, MapPinned } from "lucide-react";
import { useState } from "react";
import type { LocationOption, ScheduleFormState, TourInfo } from "shared";

export function ScheduleAttractionsCard({ form, locations, tourInfo, disabled, onChange }: {
  form: ScheduleFormState; locations: LocationOption[]; tourInfo: TourInfo | null; disabled: boolean;
  onChange: (updater: (previous: ScheduleFormState) => ScheduleFormState) => void;
}) {
  const [chosenProvince, setChosenProvince] = useState<number>();
  const provinces = getItineraryProvinces(locations, tourInfo?.tour_destinations || []);
  const province = provinces.find(item => item.location_id === chosenProvince) || provinces[0];
  const attractions = getProvinceAttractions(locations, province?.location_id);
  const selected = new Set(form.attraction_ids);
  return <TourEditorCard id="schedule-attractions" title="Điểm tham quan" description="Chọn các địa điểm sẽ ghé thăm trong những tỉnh/thành thuộc tuyến tour." icon={MapPinned}>
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 text-[12px] text-[#7b879d]"><span>Tỉnh/thành trong tour</span><span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-600">Đã chọn: {selected.size}</span></div>
      {!!provinces.length && <div className="flex flex-wrap gap-2" role="group" aria-label="Tỉnh/thành của điểm tham quan">
        {provinces.map(item => {
          const active = item.location_id === province?.location_id;
          const count = getProvinceAttractions(locations, item.location_id).filter(location => selected.has(location.location_id)).length;
          return <button key={item.location_id} type="button" aria-pressed={active} onClick={() => setChosenProvince(item.location_id)} className={`inline-flex items-center gap-2 rounded-[11px] border px-3 py-2.5 text-[13px] font-semibold transition-colors ${active ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-100" : "border-[#dfe8f5] bg-[#f8faff] text-[#52627e] hover:border-blue-300 hover:text-blue-600"}`}><MapPin size={15} />{item.name}{count > 0 && <span className={`rounded-full px-1.5 text-[11px] ${active ? "bg-white/20" : "bg-blue-100 text-blue-600"}`}>{count}</span>}</button>;
        })}
      </div>}
      {!province ? <p className="rounded-xl bg-[#f8faff] p-4 text-[13px] leading-6 text-[#7b879d]">Tour chưa chọn tỉnh/thành. Cập nhật tuyến hành trình trong tour gốc để chọn điểm tham quan.</p> : <div className="overflow-hidden rounded-2xl border border-[#e1eaf7] bg-[#f8faff]">
        <div className="flex items-center justify-between gap-3 border-b border-[#e1eaf7] px-4 py-3 text-[13px]"><span className="font-semibold text-[#26324e]">Điểm tham quan tại {province.name}</span><span className="shrink-0 text-[12px] text-[#8490a5]">{attractions.filter(item => selected.has(item.location_id)).length}/{attractions.length} đã chọn</span></div>
        {!attractions.length ? <p className="p-4 text-[13px] leading-6 text-[#7b879d]">Tỉnh/thành này chưa có điểm tham quan trong danh mục địa điểm.</p> : <div className="grid max-h-72 gap-2 overflow-y-auto p-3 sm:grid-cols-2">
          {attractions.map(location => <label key={location.location_id} className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-[13px] transition-colors ${selected.has(location.location_id) ? "border-blue-200 bg-white font-semibold text-blue-700 shadow-sm" : "border-transparent text-[#52627e] hover:bg-white"} ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}>
            <input type="checkbox" disabled={disabled} checked={selected.has(location.location_id)} onChange={event => {
              const checked = event.target.checked;
              onChange(previous => ({ ...previous, attraction_ids: toggleScheduleAttraction(previous.attraction_ids, location.location_id, checked) }));
            }} className="size-4 shrink-0 accent-blue-600" />{location.name}
          </label>)}
        </div>}
      </div>}
      <p className="flex items-start gap-2 text-[12px] leading-[1.7] text-[#8490a5]"><Check size={15} className="mt-0.5 shrink-0 text-blue-500" />Danh sách dùng cho toàn bộ chuyến. Thời gian và hoạt động từng ngày được nhập riêng trong lịch trình chi tiết.</p>
    </div>
  </TourEditorCard>;
}
