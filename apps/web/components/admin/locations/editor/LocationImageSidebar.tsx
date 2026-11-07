"use client";

import { ImageWithFallback } from "@/components/common/media/ImageWithFallback";
import { LOCATION_LEVEL_LABELS } from "@/lib/admin/locations/hierarchy";
import { Camera, Eye, ImageIcon, Loader2, MapPin, Mountain, Save, UploadCloud, X } from "lucide-react";
import type { LocationImageSidebarProps } from "shared";
import { useAdminContentReadOnly } from '@/components/admin/common/AdminContentPermission';

export function LocationImageSidebar({ form, uploading, saving, fileInputRef, onFormChange, onFileUpload, onCancel, onSave, parentLabel }: LocationImageSidebarProps & { parentLabel?: string }) {
  const readOnly = useAdminContentReadOnly();
  return (
    <div className="space-y-4">
      <section className="rounded-[14px] border border-[#e0ebf9] bg-white/95 p-4 shadow-[0_3px_14px_#3869a705] sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-[#eaf3ff] text-[#0766ff]"><ImageIcon size={20} /></span>
          <div><h2 className="text-[16px] font-bold text-[#102044]">Ảnh bìa địa điểm</h2><p className="mt-0.5 text-[12px] leading-5 text-[#7d8eac]">Tải lên hình ảnh đại diện cho địa điểm này.</p></div>
        </div>
        <button type="button" disabled={readOnly || uploading || saving} onClick={() => fileInputRef.current?.click()} aria-label={form.image_url ? "Thay đổi ảnh bìa địa điểm" : "Tải ảnh bìa địa điểm"}
          className={`relative flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded-[10px] border bg-[#f3f8ff] text-[#0766ff] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-wait ${form.image_url ? "border-[#e0e9f7]" : "border-dashed border-[#a8caff] hover:bg-blue-50"}`}>
          {form.image_url ? <><ImageWithFallback src={form.image_url} alt={form.name || "Ảnh bìa địa điểm"} className="absolute inset-0 h-full w-full object-cover" /><span className="absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-[7px] bg-[#153558]/80 px-2 py-1.5 text-[10px] font-semibold text-white"><Camera size={12} />Thay đổi ảnh</span></> : <><span className="mb-3 grid size-12 place-items-center rounded-full bg-[#e3efff]"><UploadCloud size={26} /></span><span className="text-[13px] font-semibold">Chọn ảnh bìa địa điểm</span><span className="mt-1 text-[11px] text-[#8191ad]">JPG, PNG, WebP · Tối đa 5 MB</span></>}
          {uploading && <span className="absolute inset-0 flex items-center justify-center gap-2 bg-white/85 text-[12px] font-semibold"><Loader2 size={20} className="animate-spin" />Đang tải ảnh...</span>}
        </button>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] leading-5 text-[#8191ad]">JPG, PNG, WebP · Tối đa 5 MB</p>
          {form.image_url && <button type="button" disabled={readOnly || uploading || saving} onClick={() => onFormChange(prev => ({ ...prev, image_url: "" }))} className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-[11px] text-rose-500 hover:bg-rose-50 disabled:opacity-50"><X size={12} />Gỡ ảnh</button>}
        </div>
        <input type="file" ref={fileInputRef} onChange={onFileUpload} accept="image/jpeg,image/png,image/webp" disabled={readOnly || uploading || saving} className="hidden" />
      </section>
      <section className="rounded-[14px] border border-[#e0ebf9] bg-white/95 p-4 shadow-[0_3px_14px_#3869a705] sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-[#eaf3ff] text-[#0766ff]"><Eye size={20} /></span>
          <div><h2 className="text-[16px] font-bold text-[#102044]">Xem trước</h2><p className="mt-0.5 text-[12px] leading-5 text-[#7d8eac]">Thông tin địa điểm đang thiết lập.</p></div>
        </div>
        <div className="flex min-w-0 items-center gap-3 rounded-[10px] border border-[#dce9ff] p-3">
          <div className="flex aspect-square w-[28%] max-w-28 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-[#edf5ff]">
            {form.image_url ? <ImageWithFallback src={form.image_url} alt="Ảnh xem trước" className="h-full w-full object-cover" /> : <ImageIcon size={26} className="text-[#a0bce3]" />}
          </div>
          <div className="min-w-0 space-y-2">
            <h3 className="break-words text-[15px] leading-5 font-bold text-[#102044]">{form.name || "Tên địa điểm"}</h3>
            <p className="flex items-start gap-1.5 text-[11px] leading-4 text-[#7d8eac]"><MapPin size={13} className="mt-0.5 shrink-0 text-[#0766ff]" /><span>{parentLabel || (form.level_id === 3 ? form.name || "Quốc gia" : "Chưa chọn vị trí")}</span></p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf5ff] px-2 py-1 text-[10px] font-medium text-[#0766ff]"><Mountain size={12} />{LOCATION_LEVEL_LABELS[form.level_id]}</span>
          </div>
        </div>
      </section>
      <button type="button" onClick={onSave} disabled={readOnly || saving || uploading} className="inline-flex w-full items-center justify-center gap-2 rounded-[9px] bg-[#0766ff] px-4 py-3 text-[13px] font-semibold text-white shadow-sm shadow-blue-200 hover:bg-[#075bea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-wait disabled:opacity-50">
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}Lưu địa điểm
      </button>
      <button type="button" onClick={onCancel} disabled={saving || uploading} className="w-full rounded-[9px] px-4 py-2 text-[13px] font-semibold text-[#0766ff] hover:bg-blue-100/60 disabled:opacity-50">Hủy bỏ</button>
    </div>
  );
}
