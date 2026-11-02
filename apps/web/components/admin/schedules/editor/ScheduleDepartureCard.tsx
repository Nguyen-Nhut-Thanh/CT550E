"use client";

import { createEmptyPickupPoint, pickupDateToInput, pickupInputToDate } from "@/lib/admin/schedules/forms";
import { DateTimeInput } from "@/components/common/date-time/DateTimeInput";
import { ArrowDown, ArrowUp, CalendarDays, Flag, Info, MapPin, NotebookText, Plus, Trash2 } from "lucide-react";
import { useId, type Dispatch, type SetStateAction } from "react";
import type { ScheduleFormState } from "shared";
import { TourEditorCard as ScheduleEditorCard } from "@/components/admin/tours/editor/TourEditorCard";

export function ScheduleDepartureCard({ form, disabled, onChange }: {
  form: ScheduleFormState; disabled: boolean; onChange: Dispatch<SetStateAction<ScheduleFormState>>;
}) {
  const id = useId();
  function update(index: number, field: keyof ScheduleFormState["pickup_points"][number], value: string) {
    onChange(previous => ({ ...previous, pickup_points: previous.pickup_points.map((point, i) => i === index ? { ...point, [field]: value } : point) }));
  }
  function move(index: number, offset: number) {
    onChange(previous => {
      if (index + offset < 0 || index + offset >= previous.pickup_points.length) return previous;
      const points = [...previous.pickup_points];
      [points[index], points[index + offset]] = [points[index + offset], points[index]];
      return { ...previous, pickup_points: points };
    });
  }
  return <ScheduleEditorCard id="schedule-pickups" title="Địa điểm đón khách" description="Thiết lập thông tin và thời gian đón khách cho chuyến đi." icon={MapPin}>
    {disabled && <p className="mb-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-[12px] leading-[1.7] text-amber-800"><Info size={16} className="mt-0.5 shrink-0" />Điểm đón đã được khóa vì chuyến đã khởi hành hoặc có đơn đặt.</p>}
    <div className="space-y-4">
      {form.pickup_points.map((point, index) => <fieldset key={index} disabled={disabled} className="overflow-hidden rounded-[16px] border border-[#cfe1f8] bg-[linear-gradient(145deg,#fff,#f5f9ff)]">
        <legend className="sr-only">Điểm đón {index + 1}</legend>
        <div className="flex items-center justify-between gap-2 border-b border-[#e0ecfa] bg-[linear-gradient(110deg,#f4faff,#eaf4ff)] px-4 py-3">
          <h3 className="flex items-center gap-2 text-[14px] font-bold text-[#17304e]"><MapPin size={20} className="text-[#0868f9]" />Điểm đón {index + 1}</h3>
          <div className="flex items-center gap-1">
            <button type="button" aria-label={`Đưa điểm đón ${index + 1} lên`} disabled={disabled || index === 0} onClick={() => move(index, -1)} className="rounded-lg p-1.5 text-[#7790ac] hover:bg-white disabled:opacity-30"><ArrowUp size={17} /></button>
            <button type="button" aria-label={`Đưa điểm đón ${index + 1} xuống`} disabled={disabled || index === form.pickup_points.length - 1} onClick={() => move(index, 1)} className="rounded-lg p-1.5 text-[#7790ac] hover:bg-white disabled:opacity-30"><ArrowDown size={17} /></button>
            <button type="button" aria-label={`Xóa điểm đón ${index + 1}`} onClick={() => onChange(previous => ({ ...previous, pickup_points: previous.pickup_points.filter((_, i) => i !== index) }))} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 disabled:opacity-30"><Trash2 size={17} /></button>
          </div>
        </div>
        <div className="space-y-4 p-4">
          {([
            { field: "name", label: "Tên điểm đón", placeholder: "Ví dụ: Bến xe Cần Thơ", icon: Flag, max: 150 },
            { field: "address", label: "Địa chỉ chi tiết", placeholder: "Nhập địa chỉ đón khách", icon: MapPin, max: 500 },
            { field: "pickup_at", label: "Ngày và giờ đón (giờ Việt Nam)", placeholder: "", icon: CalendarDays, max: undefined },
            { field: "note", label: "Hướng dẫn đón khách", placeholder: "Ví dụ: Có mặt trước 15 phút", icon: NotebookText, max: 1000 },
          ] as const).map(({ field, label, placeholder, icon: Icon, max }) => <div key={field} className="flex items-start gap-3">
            <Icon size={19} className="mt-0.5 shrink-0 text-[#0868f9]" />
            <div className="min-w-0 flex-1">
              <label htmlFor={`${id}-${index}-${field}`} className="mb-1.5 block text-[13px] font-semibold text-[#26324e]">{label}{field !== "note" && <span className="ml-1 text-rose-500">*</span>}</label>
              {field === "pickup_at" ? <DateTimeInput id={`${id}-${index}-${field}`} ariaLabel={`${label} - Điểm đón ${index + 1}`} value={pickupInputToDate(point.pickup_at)} onChange={value => update(index, field, pickupDateToInput(value))} disabled={disabled} placeholder="Chọn ngày và giờ đón" className="[&>button]:min-h-10 [&>button]:rounded-[11px] [&>button]:border-[#dfe6f1] [&>button]:bg-[#f8faff] [&>button]:py-2" /> : <input id={`${id}-${index}-${field}`} type="text" maxLength={max} value={point[field]} onChange={event => update(index, field, event.target.value)} placeholder={placeholder} className="min-h-10 w-full rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] px-3 py-2 text-[14px] text-[#233455] outline-none placeholder:text-[#94a0b4] focus:border-[#79a8f5] focus:ring-2 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500" />}
            </div>
          </div>)}
        </div>
      </fieldset>)}
    </div>
    <button type="button" disabled={disabled || form.pickup_points.length >= 50} onClick={() => onChange(previous => ({ ...previous, pickup_points: [...previous.pickup_points, createEmptyPickupPoint(previous)] }))} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2.5 text-[13px] font-bold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40"><Plus size={18} />Thêm điểm đón</button>
    {!form.pickup_points.length && <p className="mt-3 text-[12px] leading-[1.7] text-[#8493ab]">Chưa có điểm đón cụ thể cho chuyến này.</p>}
  </ScheduleEditorCard>;
}
