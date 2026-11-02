"use client";

import CustomDropdown from "@/components/common/forms/CustomDropdown";
import { ImageUpload } from "@/components/common/forms/ImageUpload";
import { Image, Info, Layers3, Loader2, NotebookText, Save } from "lucide-react";
import type { ScheduleSidebarProps } from "shared";
import { useEffect, useRef } from "react";
import { TourEditorCard as ScheduleEditorCard } from "@/components/admin/tours/editor/TourEditorCard";

export function ScheduleSidebar({ form, isPast, saving, uploading, onSave, onUploadingChange, onFormChange }: ScheduleSidebarProps) {
  const controlsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const updateHeight = () => controls.style.setProperty("--schedule-controls-height", `${controls.getBoundingClientRect().height}px`);
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(controls);
    return () => observer.disconnect();
  }, []);
  return <aside aria-label="Ảnh đại diện, trạng thái và lưu lịch khởi hành" className="flex min-w-0 flex-col gap-[22px] lg:self-stretch">
    <ScheduleEditorCard title="Ảnh đại diện" description="Ảnh bìa cho đợt tour này." icon={Image}>
      <div className="[&_[data-image-upload-dropzone]]:rounded-[15px] [&_[data-image-upload-dropzone]]:border [&_[data-image-upload-dropzone]]:border-[#9ec4ff] [&_[data-image-upload-dropzone]]:bg-[linear-gradient(145deg,#f3f8ff,#fff)] [&_[data-image-upload-dropzone]]:px-3 [&_[data-image-upload-dropzone]]:py-[19px] [&_[data-image-upload-dropzone]_p:first-of-type]:text-[14px] [&_[data-image-upload-dropzone]_p:first-of-type]:text-[#354966] [&_[data-image-upload-dropzone]_p:last-of-type]:text-[12px] [&_[data-image-upload-dropzone]_p:last-of-type]:leading-[1.7]">
        <ImageUpload endpoint="/admin/tours/upload-schedule-image" value={form.cover_image_url} disabled={isPast || saving} onUploadingChange={onUploadingChange} label="Kéo thả ảnh vào đây hoặc nhấn để chọn" onChange={value => onFormChange(previous => ({ ...previous, cover_image_url: Array.isArray(value) ? value[0] || "" : value }))} />
      </div>
    </ScheduleEditorCard>
    <div ref={controlsRef} className="flex shrink-0 flex-col gap-[22px] lg:sticky lg:top-[min(16px,calc(100dvh_-_var(--schedule-controls-height,500px)_-_16px))] lg:z-[5]">
    <ScheduleEditorCard title="Quản lý trạng thái" description="Thiết lập trạng thái hoạt động của đợt tour." icon={Layers3}>
      <div className="space-y-5">
        <fieldset disabled={isPast} className="space-y-2">
          <legend className="mb-2 text-[13px] font-semibold text-[#26324e]">Trạng thái đợt tour</legend>
          <div className="relative">
            <span aria-hidden="true" className={`pointer-events-none absolute top-1/2 left-3.5 z-[1] size-2 -translate-y-1/2 rounded-full ${form.status === 1 ? "bg-emerald-500" : "bg-slate-400"}`} />
            <CustomDropdown ariaLabel="Trạng thái đợt tour" variant="compact" matchTriggerWidth selectedValue={String(form.status)} options={[{ value: "1", label: "Đang hoạt động" }, { value: "0", label: "Tạm khóa" }]} onSelect={value => onFormChange(previous => ({ ...previous, status: Number(value) }))} className="min-w-0 [&_button[aria-haspopup=listbox]]:min-h-[46px] [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:rounded-[11px] [&_button[aria-haspopup=listbox]]:border-[#dfe6f1] [&_button[aria-haspopup=listbox]]:bg-[#f8faff] [&_button[aria-haspopup=listbox]]:pl-8 [&_button[aria-haspopup=listbox]]:text-[13px] [&_button:disabled]:opacity-60" />
          </div>
        </fieldset>
        <div className="space-y-2">
          <label htmlFor="schedule-internal-note" className="flex items-center gap-2 text-[13px] font-semibold text-[#26324e]"><NotebookText size={18} className="text-[#0868f9]" />Ghi chú nội bộ</label>
          <textarea id="schedule-internal-note" disabled={isPast} rows={4} placeholder="Nhập ghi chú nội bộ để quản lý (chỉ hiển thị cho nhân viên)..." value={form.note || ""} onChange={event => onFormChange(previous => ({ ...previous, note: event.target.value }))} className="min-h-[112px] w-full resize-y rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] px-3.5 py-3 text-[13px] leading-[1.7] text-[#26324e] outline-none placeholder:text-[#92a0b5] focus:border-[#79a8f5] disabled:cursor-not-allowed disabled:text-slate-400" />
        </div>
      </div>
    </ScheduleEditorCard>
    {!isPast ? <button type="button" onClick={onSave} disabled={saving || uploading} className="relative mt-[2px] flex min-h-[54px] w-full items-center justify-center gap-[11px] rounded-[15px] border border-[#1c69f2] bg-[linear-gradient(135deg,#4c92ff,#1258ef_65%,#0646db)] px-5 py-[14px] text-[14px] font-bold text-white shadow-[0_6px_14px_#1a6af328,inset_0_1px_0_#ffffff50] transition-[transform,box-shadow] duration-150 hover:-translate-y-px hover:shadow-[0_9px_18px_#1a6af33a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 disabled:cursor-wait disabled:opacity-60">{saving || uploading ? <Loader2 size={21} className="animate-spin" /> : <Save size={21} />}{saving ? "Đang lưu..." : uploading ? "Đang tải ảnh..." : "Lưu lịch trình ngay"}</button> : <p className="flex items-start gap-2 rounded-2xl bg-white/80 p-4 text-[12px] leading-[1.7] text-[#8493ab]"><Info size={18} className="mt-0.5 shrink-0" />Lịch khởi hành này đã diễn ra. Bạn chỉ có thể xem lại dữ liệu.</p>}
    </div>
  </aside>;
}
