"use client";

import { Bus, Check, ChevronDown, Droplet, Hotel, LockKeyhole, ShieldCheck, Sparkles, UserRoundCheck, Utensils } from "lucide-react";
import { copyTourAmenities, type ScheduleFormState, type TourAmenity } from "shared";
import { TourEditorCard } from "@/components/admin/tours/editor/TourEditorCard";
import { TourAmenitiesEditor } from "@/components/admin/tours/editor/TourAmenitiesEditor";

const amenityIcons = { transport: Bus, hotel: Hotel, cuisine: Utensils, guide: UserRoundCheck, insurance: ShieldCheck, water: Droplet };

export function ScheduleAmenitiesCard({ form, template, disabled, onChange }: {
  form: ScheduleFormState; template: TourAmenity[]; disabled: boolean;
  onChange: (updater: (previous: ScheduleFormState) => ScheduleFormState) => void;
}) {
  const copyTemplate = () => onChange(previous => ({ ...previous, use_tour_amenities: true, copy_tour_amenities: true, tour_schedule_amenities: copyTourAmenities(template) }));
  return <TourEditorCard id="schedule-amenities" title="Tiện ích của lịch khởi hành" icon={Sparkles} headerAction={
    <label className={`inline-flex min-h-10 items-center gap-2.5 text-[12px] leading-5 font-medium text-[#263b5c] sm:text-[13px] ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
      <input type="checkbox" checked={form.use_tour_amenities} disabled={disabled} onChange={event => event.target.checked ? copyTemplate() : onChange(previous => ({ ...previous, use_tour_amenities: false, copy_tour_amenities: false }))} className="size-4 shrink-0 rounded accent-blue-600" />
      <span>Sử dụng tiện ích gốc từ tour</span>
    </label>
  }>
    <div className="space-y-4">
      {disabled && <p className="flex items-start gap-2 text-[12px] leading-5 text-[#8490a5]"><LockKeyhole size={14} className="mt-0.5 shrink-0" />Tiện ích đã khóa vì chuyến đã khởi hành hoặc có đơn đặt.</p>}
      <div className="flex items-center justify-between gap-3 text-[12px]"><span className="font-semibold text-[#52627e]">{form.use_tour_amenities ? "Bản sao tiện ích của tour" : "Chỉnh sửa tiện ích cho chuyến"}</span><span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-600">{form.tour_schedule_amenities.length} tiện ích</span></div>
      {form.use_tour_amenities || disabled ? <div className="grid items-start gap-3 sm:grid-cols-2">
        {form.tour_schedule_amenities.map(item => {
          const Icon = amenityIcons[item.kind as keyof typeof amenityIcons] || Sparkles;
          return <details key={item.kind} className={`group overflow-hidden rounded-2xl border border-[#e1eaf7] bg-[#fbfdff] ${item.is_visible === false ? "opacity-60" : ""}`}>
            <summary className="flex cursor-pointer list-none items-center gap-2.5 p-3.5 [&::-webkit-details-marker]:hidden"><span className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-blue-50 text-blue-600"><Icon size={18} /></span><span className="min-w-0 flex-1"><span className="block break-words text-[13px] font-semibold text-[#263b5c]">{item.title}</span>{item.is_visible === false && <span className="text-[11px] text-[#8490a5]">Đang ẩn</span>}</span><ChevronDown size={15} className="shrink-0 text-[#8490a5] transition-transform group-open:rotate-180" /></summary>
            <p className="mx-3.5 border-t border-[#e1eaf7] py-3 text-[12px] leading-6 whitespace-pre-wrap break-words text-[#6f809c]">{item.content || "Thông tin được lấy từ dịch vụ đã phân bổ cho chuyến."}</p>
          </details>;
        })}
        {!form.tour_schedule_amenities.length && <p className="rounded-xl border border-dashed border-[#dce6f4] p-4 text-[12px] leading-6 text-[#8490a5] sm:col-span-2">Chưa có tiện ích trong bản sao.{!disabled && " Bỏ chọn sử dụng mẫu để thêm tiện ích riêng cho chuyến."}</p>}
      </div> : <TourAmenitiesEditor embedded scheduleMode value={form.tour_schedule_amenities} onChange={items => onChange(previous => ({ ...previous, tour_schedule_amenities: items.map(item => ({ ...item, is_visible: item.is_visible !== false })) }))} />}
      {form.copy_tour_amenities && <p className="flex items-start gap-2 text-[12px] leading-5 text-blue-600"><Check size={14} className="mt-0.5 shrink-0" />Bản sao sẽ được lưu khi bạn lưu lịch khởi hành.</p>}
    </div>
  </TourEditorCard>;
}
