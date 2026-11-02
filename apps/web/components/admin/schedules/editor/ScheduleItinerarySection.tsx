"use client";

import { BedDouble, Car, ChevronDown, Hotel, Route, Utensils } from "lucide-react";
import type { ItineraryFormItem, ScheduleItinerarySectionProps as Props } from "shared";
import CustomDropdown from "@/components/common/forms/CustomDropdown";
import { TourEditorCard } from "@/components/admin/tours/editor/TourEditorCard";
import { ItineraryDayRows } from "./ItineraryDayRows";

const inputClass = "min-h-11 w-full rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] px-3.5 py-2.5 text-[13px] text-[#263b5c] outline-none focus:border-blue-400 disabled:cursor-not-allowed disabled:text-slate-400";
const dropdownClass = "min-w-0 [&_button[aria-haspopup=listbox]]:min-h-11 [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:rounded-[11px] [&_button[aria-haspopup=listbox]]:border-[#dfe6f1] [&_button[aria-haspopup=listbox]]:bg-[#f8faff] [&_button[aria-haspopup=listbox]]:text-[13px]";

export function ScheduleItinerarySection({ form, locations = [], isPast, expandedDay, tourInfo, hotels, transports, roomTypesMap, onExpandedDayChange, onFormChange, onHotelSelect }: Props) {
  const totalDays = Math.max(Number(tourInfo?.duration_days ?? 0), form.itinerary.length);
  const changeDay = (dayNumber: number, changes: Partial<ItineraryFormItem>) => {
    if (!isPast) onFormChange(previous => ({ ...previous, itinerary: previous.itinerary.map(day => day.day_number === dayNumber ? { ...day, ...changes } : day) }));
  };
  return <TourEditorCard title="Lịch trình & Dịch vụ" description={`Sắp xếp hoạt động, bữa ăn và dịch vụ cho từng ngày trong hành trình ${totalDays} ngày.`} icon={Route}>
    <div className="space-y-3">
      {form.itinerary.map(day => {
        const expanded = expandedDay === day.day_number;
        const prefix = `itinerary-day-${day.day_number}`;
        return <section key={day.day_number} className="overflow-hidden rounded-2xl border border-[#e1eaf7] bg-white">
          <button type="button" aria-expanded={expanded} aria-controls={`${prefix}-content`} onClick={() => onExpandedDayChange(expanded ? null : day.day_number)} className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${expanded ? "border-b border-[#e1eaf7] bg-[#f0f6ff]" : "bg-[#fbfdff] hover:bg-[#f0f6ff]"}`}>
            <span className={`flex size-9 shrink-0 items-center justify-center rounded-[11px] text-[14px] font-bold ${expanded ? "bg-blue-600 text-white shadow-sm shadow-blue-100" : "bg-blue-50 text-blue-600"}`}>{day.day_number}</span>
            <span className="min-w-0 flex-1"><span className="block text-[11px] font-medium text-[#8490a5]">Ngày {day.day_number}</span><span className="block truncate text-[13px] font-semibold text-[#26324e]">{day.title || "Chưa đặt tiêu đề hành trình"}</span></span>
            <ChevronDown size={17} className={`shrink-0 text-blue-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          {expanded && <div id={`${prefix}-content`} className="space-y-5 p-4 sm:p-5">
            <label className="block space-y-2"><span className="text-[13px] font-semibold text-[#26324e]">Tiêu đề ngày</span><input disabled={isPast} value={day.title} placeholder="Ví dụ: Khám phá Vịnh Hạ Long" onChange={event => changeDay(day.day_number, { title: event.target.value })} className={inputClass} /></label>
            {!!day.content && <label className="block space-y-2"><span className="text-[13px] font-semibold text-[#26324e]">Ghi chú chung của ngày</span><textarea disabled={isPast} rows={3} value={day.content} onChange={event => changeDay(day.day_number, { content: event.target.value })} className={`${inputClass} resize-y leading-6`} /></label>}
            <ItineraryDayRows activities={day.activities || []} locations={locations} disabled={isPast} onChange={activities => changeDay(day.day_number, { activities })} />
            <div className="border-t border-[#e6edf8] pt-4">
              <h3 className="mb-4 text-[13px] font-semibold text-[#26324e]">Dịch vụ trong ngày</h3>
              <fieldset disabled={isPast} className="grid min-w-0 gap-4 sm:grid-cols-2 disabled:opacity-60">
                <legend className="sr-only">Dịch vụ ngày {day.day_number}</legend>
                <div className="min-w-0 space-y-2"><p className="flex items-center gap-2 text-[12px] font-semibold text-[#52627e]"><Car size={16} className="text-blue-500" />Phương tiện di chuyển</p><CustomDropdown ariaLabel={`Phương tiện ngày ${day.day_number}`} selectedValue={String(day.transport_id || "")} options={[{ value: "", label: "Không gán phương tiện" }, ...transports.map(item => ({ value: String(item.transport_id), label: `${item.name}${item.type ? ` (${item.type})` : ""}` }))]} onSelect={transport_id => changeDay(day.day_number, { transport_id })} variant="compact" matchTriggerWidth className={dropdownClass} /></div>
                <div className="min-w-0 space-y-2"><p className="flex items-center gap-2 text-[12px] font-semibold text-[#52627e]"><Hotel size={16} className="text-blue-500" />Khách sạn nghỉ đêm</p><CustomDropdown ariaLabel={`Khách sạn ngày ${day.day_number}`} selectedValue={String(day.hotel_id || "")} options={[{ value: "", label: "Không gán khách sạn" }, ...hotels.map(item => ({ value: String(item.hotel_id), label: `${item.name}${item.star_rating ? ` (${item.star_rating}★)` : ""}` }))]} onSelect={hotel_id => {
                  changeDay(day.day_number, { hotel_id, room_type_id: "" });
                  if (!isPast && hotel_id) onHotelSelect(Number(hotel_id));
                }} variant="compact" matchTriggerWidth className={dropdownClass} /></div>
                <label className="block min-w-0 space-y-2"><span className="flex items-center gap-2 text-[12px] font-semibold text-[#52627e]"><Utensils size={16} className="text-blue-500" />Bữa ăn</span><input disabled={isPast} value={day.meals} placeholder="Ví dụ: Sáng, trưa, tối" onChange={event => changeDay(day.day_number, { meals: event.target.value })} className={inputClass} /></label>
                <fieldset disabled={!day.hotel_id} className="min-w-0 space-y-2 disabled:opacity-60"><legend className="sr-only">Loại phòng</legend><p className="flex items-center gap-2 text-[12px] font-semibold text-[#52627e]"><BedDouble size={16} className="text-blue-500" />Loại phòng khách sạn</p><CustomDropdown ariaLabel={`Loại phòng ngày ${day.day_number}`} selectedValue={String(day.room_type_id || "")} options={[{ value: "", label: day.hotel_id ? "Chọn loại phòng" : "Chọn khách sạn trước" }, ...(roomTypesMap[Number(day.hotel_id)] || []).map(item => ({ value: String(item.room_type_id), label: item.name }))]} onSelect={room_type_id => changeDay(day.day_number, { room_type_id })} variant="compact" matchTriggerWidth className={dropdownClass} />{!!day.hotel_id && !day.room_type_id && <p className="text-[11px] leading-5 text-amber-700">Chọn thêm loại phòng để lưu khách sạn cho ngày này.</p>}</fieldset>
              </fieldset>
            </div>
          </div>}
        </section>;
      })}
      {!form.itinerary.length && <p className="rounded-xl bg-[#f8faff] p-4 text-[13px] text-[#8490a5]">Chọn tour để thiết lập số ngày của hành trình.</p>}
    </div>
  </TourEditorCard>;
}
