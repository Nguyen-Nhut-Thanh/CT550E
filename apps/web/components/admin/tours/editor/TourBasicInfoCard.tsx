"use client";

import CustomDropdown from '@/components/common/forms/CustomDropdown';
import { Compass, Layers, LockKeyhole, Map, MapPin, Plane, Tag, TextCursorInput } from 'lucide-react';
import type { TourBasicInfoCardProps, TourDetailForm } from 'shared';
import { TourDestinationPicker } from './TourDestinationPicker';
import { TourEditorCard } from './TourEditorCard';

export function TourBasicInfoCard<T extends TourDetailForm>({
  tour, locations, transports, mode = 'edit', lockCoreFields = false, onTourChange,
}: TourBasicInfoCardProps<T>) {
  const departureOptions = locations.filter(location => location.level_id === 5 || location.location_id === tour.departure_location);
  return <TourEditorCard id="tour-info" title="Thông tin cơ bản" description="Thông tin nhận diện và lộ trình chính của tour." icon={Compass} art={Map}>
    <div className="flex flex-col gap-[22px]">
      <div className="border-t border-[#edf1f8]" />
      {lockCoreFields && <p className="flex gap-2 rounded-[11px] bg-[#fff8e9] px-3 py-[11px] text-[11px] leading-[1.65] text-[#a37a28]"><LockKeyhole size={16} className="mt-0.5 shrink-0" />Tour đã có đơn đặt. Các thông tin nhận diện, thời lượng và tuyến hành trình đã được khóa.</p>}
      <div className="grid gap-[18px] sm:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-[7px]">
          <label className="flex items-center gap-[6px] text-[13px] leading-[1.5] font-bold text-[#26324e]" htmlFor="tour-code">Mã tour <span className="text-[#ed5f6c]">*</span></label>
          <div className="relative"><Tag size={17} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#7e8da5]" />
            <input id="tour-code" className="w-full rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] px-3 py-[11px] text-[14px] leading-[1.5] text-[#233455] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#94a0b4] focus:border-[#79a8f5] focus:bg-white focus:shadow-[0_0_0_3px_#e8f1ff] disabled:cursor-not-allowed disabled:bg-[#f0f3f8] disabled:text-[#8a96aa] read-only:cursor-not-allowed read-only:bg-[#f0f3f8] read-only:text-[#8a96aa] pl-[38px]" value={tour.code || ''} readOnly={mode === 'edit'} placeholder="VD: VN-MB-001" onChange={event => onTourChange(previous => ({ ...previous, code: event.target.value }))} />
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-[7px]">
          <span className="flex items-center gap-[6px] text-[13px] leading-[1.5] font-bold text-[#26324e]">Loại tour <span className="text-[#ed5f6c]">*</span></span>
          <fieldset disabled={lockCoreFields}>
            <CustomDropdown ariaLabel="Loại tour" selectedValue={tour.tour_type || 'domestic'} options={[{ value: 'domestic', label: 'Trong nước' }, { value: 'outbound', label: 'Nước ngoài' }, { value: 'international', label: 'Quốc tế' }]} onSelect={tour_type => onTourChange(previous => ({ ...previous, tour_type }))} icon={Layers} variant="compact" matchTriggerWidth className="min-w-0 [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:rounded-[11px] [&_button[aria-haspopup=listbox]]:border [&_button[aria-haspopup=listbox]]:border-[#dfe6f1] [&_button[aria-haspopup=listbox]]:bg-[#f8faff] [&_button[aria-haspopup=listbox]]:px-3 [&_button[aria-haspopup=listbox]]:py-[11px] [&_button[aria-haspopup=listbox]]:text-[14px] [&_button[aria-haspopup=listbox]]:font-medium [&_button[aria-haspopup=listbox]]:shadow-none [&_button[aria-haspopup=listbox]:disabled]:cursor-not-allowed [&_button[aria-haspopup=listbox]:disabled]:opacity-60" />
          </fieldset>
        </div>
        <div className="flex min-w-0 flex-col gap-[7px] col-span-full">
          <label className="flex items-center gap-[6px] text-[13px] leading-[1.5] font-bold text-[#26324e]" htmlFor="tour-name">Tên tour <span className="text-[#ed5f6c]">*</span></label>
          <div className="relative"><TextCursorInput size={17} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#7e8da5]" />
            <input id="tour-name" disabled={lockCoreFields} className="w-full rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] px-3 py-[11px] text-[14px] leading-[1.5] text-[#233455] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#94a0b4] focus:border-[#79a8f5] focus:bg-white focus:shadow-[0_0_0_3px_#e8f1ff] disabled:cursor-not-allowed disabled:bg-[#f0f3f8] disabled:text-[#8a96aa] read-only:cursor-not-allowed read-only:bg-[#f0f3f8] read-only:text-[#8a96aa] pl-[38px]" value={tour.name || ''} placeholder="VD: Hà Nội - Hạ Long 3N2Đ" onChange={event => onTourChange(previous => ({ ...previous, name: event.target.value }))} />
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-[7px]">
          <span className="flex items-center gap-[6px] text-[13px] leading-[1.5] font-bold text-[#26324e]">Nơi xuất phát mặc định <span className="text-[#ed5f6c]">*</span></span>
          <CustomDropdown ariaLabel="Nơi xuất phát mặc định" selectedValue={String(tour.departure_location || '')} placeholder="Chọn nơi xuất phát" options={departureOptions.map(location => ({ value: String(location.location_id), label: location.name }))} onSelect={value => onTourChange(previous => ({ ...previous, departure_location: Number(value) }))} icon={MapPin} variant="compact" matchTriggerWidth className="min-w-0 [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:rounded-[11px] [&_button[aria-haspopup=listbox]]:border [&_button[aria-haspopup=listbox]]:border-[#dfe6f1] [&_button[aria-haspopup=listbox]]:bg-[#f8faff] [&_button[aria-haspopup=listbox]]:px-3 [&_button[aria-haspopup=listbox]]:py-[11px] [&_button[aria-haspopup=listbox]]:text-[14px] [&_button[aria-haspopup=listbox]]:font-medium [&_button[aria-haspopup=listbox]]:shadow-none [&_button[aria-haspopup=listbox]:disabled]:cursor-not-allowed [&_button[aria-haspopup=listbox]:disabled]:opacity-60" />
          <p className="text-[12px] leading-[1.65] text-[#8490a5]">Điền sẵn cho lịch khởi hành mới.</p>
        </div>
        <div className="flex min-w-0 flex-col gap-[7px]">
          <span className="flex items-center gap-[6px] text-[13px] leading-[1.5] font-bold text-[#26324e]">Phương tiện <span className="text-[#ed5f6c]">*</span></span>
          <CustomDropdown ariaLabel="Phương tiện" selectedValue={String(tour.transport_id || '')} placeholder="Chọn phương tiện" options={transports.map(transport => ({ value: String(transport.transport_id), label: transport.name + ' (' + transport.transport_type + ')' }))} onSelect={value => onTourChange(previous => ({ ...previous, transport_id: Number(value) }))} icon={Plane} variant="compact" matchTriggerWidth className="min-w-0 [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:rounded-[11px] [&_button[aria-haspopup=listbox]]:border [&_button[aria-haspopup=listbox]]:border-[#dfe6f1] [&_button[aria-haspopup=listbox]]:bg-[#f8faff] [&_button[aria-haspopup=listbox]]:px-3 [&_button[aria-haspopup=listbox]]:py-[11px] [&_button[aria-haspopup=listbox]]:text-[14px] [&_button[aria-haspopup=listbox]]:font-medium [&_button[aria-haspopup=listbox]]:shadow-none [&_button[aria-haspopup=listbox]:disabled]:cursor-not-allowed [&_button[aria-haspopup=listbox]:disabled]:opacity-60" />
        </div>
      </div>

      <TourDestinationPicker locations={locations} value={tour.destinations || []} tourType={tour.tour_type} disabled={lockCoreFields} onChange={destinations => onTourChange(previous => ({ ...previous, destinations }))} />

      <div className="flex min-w-0 flex-col gap-[7px]">
        <label htmlFor="tour-summary" className="flex items-center gap-[6px] text-[13px] leading-[1.5] font-bold text-[#26324e]">Mô tả ngắn</label>
        <textarea id="tour-summary" rows={3} className="w-full rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] px-3 py-[11px] text-[14px] leading-[1.5] text-[#233455] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#94a0b4] focus:border-[#79a8f5] focus:bg-white focus:shadow-[0_0_0_3px_#e8f1ff] min-h-[90px] resize-y" placeholder="Một vài điểm hấp dẫn để khách muốn khám phá tour..." value={tour.summary || ''} onChange={event => onTourChange(previous => ({ ...previous, summary: event.target.value }))} />
        <p className="text-[12px] leading-[1.65] text-[#8490a5]">Hiển thị dưới tên tour trên thẻ tour ở trang danh sách.</p>
      </div>
      <div className="flex min-w-0 flex-col gap-[7px]">
        <label htmlFor="tour-description" className="flex items-center gap-[6px] text-[13px] leading-[1.5] font-bold text-[#26324e]">Mô tả hành trình <span className="text-[#ed5f6c]">*</span></label>
        <textarea id="tour-description" rows={5} className="w-full rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] px-3 py-[11px] text-[14px] leading-[1.5] text-[#233455] outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-[#94a0b4] focus:border-[#79a8f5] focus:bg-white focus:shadow-[0_0_0_3px_#e8f1ff] min-h-[90px] resize-y" placeholder="Giới thiệu sơ lược về lộ trình, các điểm tham quan chính, hoạt động nổi bật..." value={tour.description || ''} onChange={event => onTourChange(previous => ({ ...previous, description: event.target.value }))} />
        <div className="flex justify-between gap-3 text-[12px] text-[#929cb0]"><span>Giới thiệu đầy đủ về chuyến đi của bạn.</span><span>{(tour.description || '').length.toLocaleString('vi-VN')} ký tự</span></div>
      </div>
    </div>
  </TourEditorCard>;
}
