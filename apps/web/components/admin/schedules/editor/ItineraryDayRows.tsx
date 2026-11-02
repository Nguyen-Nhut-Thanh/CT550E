"use client";

import { TimeInput } from "@/components/common/date-time/TimeInput";
import { updateItineraryActivity } from "@/lib/admin/schedules/itinerary";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { useId } from "react";
import type { ItineraryActivity, LocationOption } from "shared";

export function ItineraryDayRows({ activities, locations, disabled, onChange }: {
  activities: ItineraryActivity[]; locations: LocationOption[]; disabled: boolean; onChange: (activities: ItineraryActivity[]) => void;
}) {
  const id = useId();
  return <div className="space-y-3">
    <p className="text-[13px] font-bold text-[#26324e]">Chi tiết lịch trình</p>
    <div className="hidden grid-cols-[140px_minmax(0,1fr)_32px] gap-3 rounded-xl bg-[#f1f6ff] px-3 py-2.5 text-[12px] font-semibold text-[#6c7f9d] sm:grid"><span>Thời gian</span><span>Nội dung</span><span className="sr-only">Thao tác</span></div>
    {activities.map((activity, index) => {
      const locationName = locations.find(item => item.location_id === activity.location_id)?.name || activity.location?.name;
      return <div key={index} className="grid grid-cols-[minmax(0,1fr)_32px] items-start gap-3 rounded-xl border border-[#e1eaf7] bg-[#fbfdff] p-3 sm:grid-cols-[140px_minmax(0,1fr)_32px]">
        <div><label htmlFor={`${id}-time-${index}`} className="mb-1.5 block text-[12px] font-semibold text-[#6c7f9d] sm:sr-only">Thời gian</label><TimeInput id={`${id}-time-${index}`} ariaLabel={`Giờ nội dung ${index + 1}`} value={activity.time} disabled={disabled} onChange={time => onChange(updateItineraryActivity(activities, index, { time }))} className="[&>button]:min-h-10 [&>button]:px-3 [&>button]:py-2 [&>button]:text-[13px]" /></div>
        <div className="col-span-full space-y-2 sm:col-span-1">
          {locationName && <p className="flex items-center gap-1 text-[12px] font-semibold text-blue-600"><MapPin size={13} className="shrink-0" />{locationName}</p>}
          <input aria-label={`Tiêu đề nội dung ${index + 1}`} disabled={disabled} maxLength={255} value={activity.title} placeholder="Ví dụ: Tham quan, ăn trưa, di chuyển..." onChange={event => onChange(updateItineraryActivity(activities, index, { title: event.target.value }))} className="min-h-10 w-full rounded-[11px] border border-[#dfe6f1] bg-white px-3 py-2 text-[13px] font-semibold text-[#233455] outline-none focus:border-blue-400 disabled:bg-slate-50" />
          <textarea aria-label={`Mô tả nội dung ${index + 1}`} disabled={disabled} rows={3} value={activity.description} placeholder="Nội dung tham quan, trải nghiệm hoặc hướng dẫn cho khách..." onChange={event => onChange(updateItineraryActivity(activities, index, { description: event.target.value }))} className="w-full resize-y rounded-[11px] border border-[#dfe6f1] bg-white px-3 py-2 text-[13px] leading-6 text-[#52627b] outline-none focus:border-blue-400 disabled:bg-slate-50" />
        </div>
        <button type="button" disabled={disabled} aria-label={`Xóa nội dung ${index + 1}`} onClick={() => onChange(activities.filter((_, current) => current !== index))} className="col-start-2 row-start-1 rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40 sm:col-start-3"><Trash2 size={16} /></button>
      </div>;
    })}
    {!activities.length && <p className="rounded-xl border border-dashed border-[#dce6f4] p-4 text-[12px] leading-6 text-[#8490a5]">Thêm nội dung và giờ thực hiện cho ngày này. Danh sách điểm tham quan được chọn riêng ở thẻ phía trên.</p>}
    <button type="button" disabled={disabled} onClick={() => onChange([...activities, { time: "", title: "", description: "", location_id: null }])} className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-[13px] font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-40"><Plus size={16} />Thêm nội dung</button>
  </div>;
}
