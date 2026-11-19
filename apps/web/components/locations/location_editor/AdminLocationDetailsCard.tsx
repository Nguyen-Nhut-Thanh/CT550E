"use client";

import { Globe2, Lock, Star } from "lucide-react";
import type { LocationDetailsCardProps } from "shared";

const inputClass = "w-full rounded-lg border border-[#dce5f3] bg-white px-3 py-2 text-xs text-[#192e52] outline-none placeholder:text-[#9aa8be] focus:border-[#075bff] focus:ring-2 focus:ring-blue-100 transition-colors";

export function LocationDetailsCard({ form, isNew, level3Id, level3List, onFormChange }: LocationDetailsCardProps) {
  const country = level3List.find(item => String(item.location_id) === level3Id)?.name;
  return (
    <section className="rounded-[14px] border border-[#e1edfc] bg-white p-4.5 sm:p-5 shadow-2xs">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-[13px] font-bold text-[#075bff]">02</span>
        <div><h2 className="text-[15px] font-bold text-[#07123e]">Thông tin địa điểm</h2><p className="mt-0.5 text-xs text-[#7187a9]">Cung cấp thông tin chi tiết về địa điểm.</p></div>
      </div>
      <div className="space-y-3.5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="location-name" className="text-xs font-semibold text-[#07123e]">Tên địa điểm <span className="text-rose-500">*</span></label>
            <input id="location-name" className={inputClass} value={form.name} onChange={event => onFormChange(prev => ({ ...prev, name: event.target.value }))} placeholder="Ví dụ: Núi Cấm, Vịnh Hạ Long..." required />
            <p className="text-[11px] text-[#7187a9]">Tên hiển thị của địa điểm trên hệ thống.</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="location-slug" className="flex items-center gap-1.5 text-xs font-semibold text-[#07123e]">Đường dẫn (slug)<Lock size={11} className="text-[#93a3bf]" /></label>
            <input id="location-slug" readOnly className={`${inputClass} cursor-default bg-[#f4f7fc] text-[#7484a0]`} value={form.slug} placeholder="tu-dong-theo-ten" />
            <p className="text-[11px] text-[#7187a9]">{isNew ? "Đường dẫn thân thiện được tự động tạo từ tên địa điểm." : "Đường dẫn hiện tại của địa điểm."}</p>
          </div>
        </div>
        {form.level_id === 3 && <div className="max-w-sm space-y-1.5">
          <label htmlFor="location-country-code" className="text-xs font-semibold text-[#07123e]">Mã quốc gia (ISO)</label>
          <input id="location-country-code" readOnly={!isNew} className={`${inputClass} read-only:bg-[#f4f7fc] read-only:text-[#7484a0]`} value={form.country_code} onChange={event => onFormChange(prev => ({ ...prev, country_code: event.target.value.toUpperCase() }))} maxLength={10} placeholder="Ví dụ: VN, JP, US..." />
        </div>}
        <div className="space-y-1.5">
          <label htmlFor="location-note" className="text-xs font-semibold text-[#07123e]">Mô tả ngắn</label>
          <textarea id="location-note" rows={3} className={`${inputClass} block min-h-20 resize-y`} value={form.note} onChange={event => onFormChange(prev => ({ ...prev, note: event.target.value }))} placeholder="Giới thiệu ngắn gọn về cảnh quan, đặc trưng của địa điểm..." />
          <p className="text-[11px] text-[#7187a9]">Thông tin giới thiệu ngắn về địa điểm.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-[#e1edfc] bg-slate-50/70 p-3">
            <Globe2 size={22} className="shrink-0 text-[#075bff]" aria-hidden="true" />
            <div className="min-w-0 text-xs leading-5"><p className="text-[#536583]">Thuộc quốc gia <span className="font-semibold text-[#075bff]">{form.level_id === 3 ? form.name || "Chưa nhập tên" : country || "Chưa chọn quốc gia"}</span></p><p className="text-[11px] text-[#7187a9]">Mã quốc gia: {form.country_code || "—"}</p></div>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#e1edfc] bg-slate-50/70 p-3">
            <span className="relative mt-0.5 inline-flex shrink-0">
              <input type="checkbox" checked={form.is_featured} onChange={event => onFormChange(prev => ({ ...prev, is_featured: event.target.checked }))} className="peer sr-only" />
              <span className="h-5 w-9 rounded-full bg-[#cdd9ea] transition-colors peer-checked:bg-[#075bff] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-500" />
              <span className="pointer-events-none absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
            </span>
            <Star size={16} fill="currentColor" className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
            <span><span className="block text-xs font-semibold leading-5 text-[#07123e]">Địa điểm nổi bật</span><span className="block text-[11px] text-[#7187a9]">Ưu tiên hiển thị trên trang chủ.</span></span>
          </label>
        </div>
        {form.is_featured && <div className="max-w-[180px] space-y-1.5">
          <label htmlFor="location-featured-order" className="text-xs font-semibold text-[#07123e]">Thứ tự hiển thị</label>
          <input id="location-featured-order" type="number" className={inputClass} value={form.featured_order ?? ""} onChange={event => onFormChange(prev => ({ ...prev, featured_order: event.target.value ? Number(event.target.value) : null }))} placeholder="Chưa thiết lập" />
        </div>}
      </div>
    </section>
  );
}
