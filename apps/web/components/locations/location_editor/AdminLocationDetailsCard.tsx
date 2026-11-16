"use client";

import { Globe2, Lock, Star } from "lucide-react";
import type { LocationDetailsCardProps } from "shared";

const inputClass = "w-full rounded-[8px] border border-[#dce5f3] bg-white px-3 py-2 text-[13px] leading-5 text-[#263b5c] outline-none placeholder:text-[#9aa8be] focus:border-blue-400 focus:ring-2 focus:ring-blue-50";

export function LocationDetailsCard({ form, isNew, level3Id, level3List, onFormChange }: LocationDetailsCardProps) {
  const country = level3List.find(item => String(item.location_id) === level3Id)?.name;
  return (
    <section className="rounded-[14px] border border-[#e0ebf9] bg-white/95 p-4 shadow-[0_3px_14px_#3869a705] sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#eaf3ff] text-[14px] font-bold text-[#0766ff]">02</span>
        <div><h2 className="text-[16px] font-bold text-[#102044]">Thông tin địa điểm</h2><p className="mt-0.5 text-[12px] leading-5 text-[#7d8eac]">Cung cấp thông tin chi tiết về địa điểm.</p></div>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="location-name" className="text-[12px] font-semibold text-[#102044]">Tên địa điểm <span className="text-rose-500">*</span></label>
            <input id="location-name" className={inputClass} value={form.name} onChange={event => onFormChange(prev => ({ ...prev, name: event.target.value }))} placeholder="Ví dụ: Núi Cấm, Vịnh Hạ Long..." required />
            <p className="text-[11px] leading-4 text-[#8191ad]">Tên hiển thị của địa điểm trên hệ thống.</p>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="location-slug" className="flex items-center gap-1.5 text-[12px] font-semibold text-[#102044]">Đường dẫn (slug)<Lock size={11} className="text-[#93a3bf]" /></label>
            <input id="location-slug" readOnly className={`${inputClass} cursor-default bg-[#f4f7fc] text-[#7484a0]`} value={form.slug} placeholder="tu-dong-theo-ten" />
            <p className="text-[11px] leading-4 text-[#8191ad]">{isNew ? "Đường dẫn thân thiện được tự động tạo từ tên địa điểm." : "Đường dẫn hiện tại của địa điểm."}</p>
          </div>
        </div>
        {form.level_id === 3 && <div className="max-w-sm space-y-1.5">
          <label htmlFor="location-country-code" className="text-[12px] font-semibold text-[#102044]">Mã quốc gia (ISO)</label>
          <input id="location-country-code" readOnly={!isNew} className={`${inputClass} read-only:bg-[#f4f7fc] read-only:text-[#7484a0]`} value={form.country_code} onChange={event => onFormChange(prev => ({ ...prev, country_code: event.target.value.toUpperCase() }))} maxLength={10} placeholder="Ví dụ: VN, JP, US..." />
        </div>}
        <div className="space-y-1.5">
          <label htmlFor="location-note" className="text-[12px] font-semibold text-[#102044]">Mô tả ngắn</label>
          <textarea id="location-note" rows={3} className={`${inputClass} block min-h-20 resize-y`} value={form.note} onChange={event => onFormChange(prev => ({ ...prev, note: event.target.value }))} placeholder="Giới thiệu ngắn gọn về cảnh quan, đặc trưng của địa điểm..." />
          <p className="text-[11px] leading-4 text-[#8191ad]">Thông tin giới thiệu ngắn về địa điểm.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-[9px] bg-[#f0f7ff] p-3">
            <Globe2 size={24} className="shrink-0 text-[#0766ff]" aria-hidden="true" />
            <div className="min-w-0 text-[12px] leading-5"><p className="text-[#536583]">Thuộc quốc gia <span className="font-semibold text-[#0766ff]">{form.level_id === 3 ? form.name || "Chưa nhập tên" : country || "Chưa chọn quốc gia"}</span></p><p className="text-[11px] text-[#8191ad]">Mã quốc gia: {form.country_code || "—"}</p></div>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-[9px] bg-[#f0f7ff] p-3">
            <span className="relative mt-0.5 inline-flex shrink-0">
              <input type="checkbox" checked={form.is_featured} onChange={event => onFormChange(prev => ({ ...prev, is_featured: event.target.checked }))} className="peer sr-only" />
              <span className="h-5 w-9 rounded-full bg-[#cdd9ea] transition-colors peer-checked:bg-[#0766ff] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-500" />
              <span className="pointer-events-none absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
            </span>
            <Star size={16} fill="currentColor" className="mt-0.5 shrink-0 text-amber-400" aria-hidden="true" />
            <span><span className="block text-[12px] font-semibold leading-5 text-[#102044]">Địa điểm nổi bật</span><span className="block text-[11px] leading-4 text-[#8191ad]">Ưu tiên hiển thị trên trang chủ.</span></span>
          </label>
        </div>
        {form.is_featured && <div className="max-w-[180px] space-y-1.5">
          <label htmlFor="location-featured-order" className="text-[12px] font-semibold text-[#102044]">Thứ tự hiển thị</label>
          <input id="location-featured-order" type="number" className={inputClass} value={form.featured_order ?? ""} onChange={event => onFormChange(prev => ({ ...prev, featured_order: event.target.value ? Number(event.target.value) : null }))} placeholder="Chưa thiết lập" />
        </div>}
      </div>
    </section>
  );
}
