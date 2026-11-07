"use client";

import { TourEditorCard } from "@/components/admin/tours/editor/TourEditorCard";
import { ImageWithFallback } from "@/components/common/media/ImageWithFallback";
import { getItineraryProvinces, getProvinceAttractions, toggleScheduleAttraction } from "@/lib/admin/schedules/itinerary";
import { normalizeScheduleSearch } from "@/lib/admin/schedules/tour-schedules";
import { Check, ImageIcon, Info, MapPin, MapPinned, Search, X } from "lucide-react";
import { useId, useMemo, useState } from "react";
import type { LocationOption, ScheduleFormState, TourInfo } from "shared";

export function ScheduleAttractionsCard({ form, locations, tourInfo, disabled, onChange }: {
  form: ScheduleFormState; locations: LocationOption[]; tourInfo: TourInfo | null; disabled: boolean;
  onChange: (updater: (previous: ScheduleFormState) => ScheduleFormState) => void;
}) {
  const id = useId();
  const [chosenProvince, setChosenProvince] = useState<number>();
  const [search, setSearch] = useState("");
  const provinces = getItineraryProvinces(locations, tourInfo?.tour_destinations || []);
  const visibleProvinces = provinces.filter(item => normalizeScheduleSearch(item.name).includes(normalizeScheduleSearch(search)));
  const province = visibleProvinces.find(item => item.location_id === chosenProvince) || visibleProvinces[0];
  const attractionsByProvince = useMemo(() => {
    const grouped = new Map<number, LocationOption[]>();
    for (const location of locations) {
      if (location.level_id !== 6 || location.parent_id == null) continue;
      const group = grouped.get(location.parent_id) || [];
      group.push(location);
      grouped.set(location.parent_id, group);
    }
    return grouped;
  }, [locations]);
  const attractions = getProvinceAttractions(attractionsByProvince.get(province?.location_id ?? 0) || [], province?.location_id);
  const selected = new Set(form.attraction_ids);
  const selectedHere = attractions.filter(item => selected.has(item.location_id)).length;

  return <TourEditorCard id="schedule-attractions" title="Điểm tham quan" description="Chọn các điểm dừng chân trong hành trình tour" icon={MapPin}>
    <div className="@container space-y-4">
      {!provinces.length ? <p className="rounded-xl bg-[#f8faff] p-4 text-[13px] leading-6 text-[#7b879d]">Tour chưa chọn tỉnh/thành. Cập nhật tuyến hành trình trong tour gốc để chọn điểm tham quan.</p> : <div className="grid min-w-0 gap-4 @min-[500px]:grid-cols-[minmax(145px,.95fr)_minmax(0,1.7fr)] @min-[700px]:grid-cols-[205px_minmax(0,1fr)]">
        <aside className="min-w-0 @min-[500px]:border-r @min-[500px]:border-[#edf1f8] @min-[500px]:pr-3.5">
          <div className="relative mb-3">
            <label htmlFor={`${id}-province-search`} className="sr-only">Tìm tỉnh/thành trong tour</label>
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8292ac]" />
            <input id={`${id}-province-search`} type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm tỉnh/thành..." className="min-h-9 w-full rounded-[8px] border border-[#dfe6f1] bg-white py-2 pl-9 pr-8 text-[12px] text-[#263b5c] outline-none placeholder:text-[#94a0b4] focus:border-blue-400 focus:ring-2 focus:ring-blue-50 [&::-webkit-search-cancel-button]:hidden" />
            {search && <button type="button" aria-label="Xóa tìm kiếm tỉnh/thành" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#8292ac] hover:bg-blue-50 hover:text-blue-600"><X size={13} /></button>}
          </div>
          <p className="mb-2 text-[12px] font-semibold text-[#26324e]">Tỉnh/thành</p>
          <div role="group" aria-label="Tỉnh/thành trong tuyến tour" className="grid max-h-44 grid-cols-2 gap-1 overflow-y-auto pr-1 @min-[500px]:max-h-[356px] @min-[500px]:grid-cols-1">
            {visibleProvinces.map(item => {
              const active = item.location_id === province?.location_id;
              return <button key={item.location_id} type="button" aria-pressed={active} aria-controls={`${id}-destinations`} onClick={() => setChosenProvince(item.location_id)} className={`relative flex min-w-0 items-center gap-2.5 overflow-hidden rounded-[8px] px-3 py-3 text-left text-[12px] transition-colors before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:rounded-full ${active ? 'bg-[linear-gradient(100deg,#edf6ff,#e7f2ff)] font-semibold text-[#173052] before:bg-[#1675ff]' : 'font-medium text-[#52627e] hover:bg-[#f4f8ff] before:bg-transparent'}`}>
                <MapPinned size={17} strokeWidth={1.6} className={`shrink-0 ${active ? 'text-[#1675ff]' : 'text-[#8292ac]'}`} />
                <span className="min-w-0 flex-1 truncate">{item.name}</span>
                <span className={`text-[11px] tabular-nums ${active ? 'text-[#1675ff]' : 'text-[#8292ac]'}`}>{attractionsByProvince.get(item.location_id)?.length || 0}</span>
              </button>;
            })}
          </div>
          {!visibleProvinces.length && <p className="py-4 text-[12px] leading-6 text-[#8490a5]">Không tìm thấy tỉnh/thành phù hợp.</p>}
        </aside>
        <div id={`${id}-destinations`} className="min-w-0" aria-live="polite">
          {province ? <>
            <div className="mb-3 flex min-h-9 flex-wrap items-center gap-2"><h3 className="text-[13px] font-bold text-[#173052]">Điểm đến tại {province.name}</h3><span className="rounded-full bg-[#eaf4ff] px-2 py-1 text-[10px] font-semibold text-[#1675ff]">{selectedHere} đã chọn</span></div>
            {attractions.length ? <div role="group" aria-label={`Điểm tham quan tại ${province.name}`} className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
              {attractions.map(location => {
                const checked = selected.has(location.location_id);
                const photo = location.location_images?.find(item => item.image_url)?.image_url || location.featured_image;
                return <label key={location.location_id} className={`group relative flex min-w-0 items-start gap-3 rounded-[10px] border p-2.5 transition-colors focus-within:ring-2 focus-within:ring-blue-200 ${checked ? 'border-[#b9d9ff] bg-[linear-gradient(120deg,#f1f8ff,#edf5ff)]' : 'border-[#e3eaf5] bg-white hover:border-[#b9d9ff] hover:bg-[#fbfdff]'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  {photo ? <ImageWithFallback src={photo} alt={location.name} loading="lazy" className="h-[80px] w-[88px] shrink-0 rounded-[7px] object-cover @min-[700px]:w-[108px]" /> : <span className="flex h-[80px] w-[88px] shrink-0 flex-col items-center justify-center gap-1 rounded-[7px] bg-[#edf4fc] text-[#9bb1cb] @min-[700px]:w-[108px]"><ImageIcon size={22} strokeWidth={1.4} /><span className="text-[10px]">Chưa có ảnh</span></span>}
                  <span className="min-w-0 flex-1 py-0.5">
                    <span className="mb-1 block pr-5 text-[13px] leading-5 font-semibold text-[#173052]">{location.name}</span>
                    <span className="mb-1 flex items-center gap-1 text-[10px] leading-4 text-[#8190a7]"><MapPin size={11} className="shrink-0" />{location.locations?.name || province.name}</span>
                    <span className="line-clamp-2 text-[11px] leading-[1.65] text-[#7b879d]">{location.note?.trim() || 'Thông tin giới thiệu địa điểm đang được cập nhật.'}</span>
                  </span>
                  <input type="checkbox" disabled={disabled} checked={checked} aria-label={`Chọn ${location.name}`} onChange={event => {
                    const value = event.target.checked;
                    onChange(previous => ({ ...previous, attraction_ids: toggleScheduleAttraction(previous.attraction_ids, location.location_id, value) }));
                  }} className="peer sr-only" />
                  <span aria-hidden="true" className={`absolute right-2.5 top-3 flex size-[17px] items-center justify-center rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-blue-300 peer-focus-visible:ring-offset-2 ${checked ? 'border-[#1675ff] bg-[#1675ff] text-white' : 'border-[#a9b8cc] bg-white text-transparent'}`}><Check size={11} strokeWidth={3} /></span>
                </label>;
              })}
            </div> : <p className="rounded-xl border border-dashed border-[#dfe6f1] bg-[#f8faff] p-4 text-[12px] leading-6 text-[#8490a5]">Tỉnh/thành này chưa có điểm tham quan trong danh mục địa điểm.</p>}
          </> : <p className="rounded-xl bg-[#f8faff] p-4 text-[12px] leading-6 text-[#8490a5]">Không có tỉnh/thành phù hợp với từ khóa tìm kiếm.</p>}
        </div>
      </div>}
      <p className="flex items-center gap-2 text-[11px] leading-5 text-[#8490a5]"><Info size={13} className="shrink-0" />Điểm tham quan áp dụng cho toàn bộ chuyến đi.</p>
    </div>
  </TourEditorCard>;
}
