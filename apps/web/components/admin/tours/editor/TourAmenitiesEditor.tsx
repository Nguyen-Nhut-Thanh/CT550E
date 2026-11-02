"use client";

import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useRef } from 'react';
import { TOUR_AMENITY_DEFINITIONS, type TourAmenity } from 'shared';
import { AdminFormCard } from '@/components/admin/common/AdminFormCard';
import CustomDropdown from '@/components/common/forms/CustomDropdown';

type EditableAmenity = TourAmenity & { is_visible?: boolean };

export function TourAmenitiesEditor({ value, onChange, scheduleMode = false, embedded = false }: {
  value: EditableAmenity[];
  onChange: (value: EditableAmenity[]) => void;
  scheduleMode?: boolean;
  embedded?: boolean;
}) {
  const entryRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const change = (index: number, patch: Partial<EditableAmenity>) => onChange(value.map((item, position) => position === index ? { ...item, ...patch } : item));
  const move = (index: number, direction: number) => {
    const next = [...value];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next.map((item, sort_order) => ({ ...item, sort_order })));
  };
  const selectAmenity = (kind: string) => {
    const definition = TOUR_AMENITY_DEFINITIONS.find(item => item.key === kind);
    if (!definition) return;
    if (!value.some(item => item.kind === kind)) {
      onChange([...value, { kind: definition.key, title: definition.title, content: '', sort_order: value.length }]);
    }
    requestAnimationFrame(() => {
      const entry = entryRefs.current[kind];
      entry?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      entry?.querySelector<HTMLInputElement>('input:not([type="checkbox"])')?.focus({ preventScroll: true });
    });
  };
  const fields = <div className="space-y-5">
    <p className="text-[12px] leading-6 text-[#8490a5]">{scheduleMode
      ? 'Chỉnh sửa bản riêng của chuyến này. Khách sạn và xe lấy thêm thông tin từ phân bổ của chuyến; dùng ô Hiển thị để ẩn cả thẻ nếu cần.'
      : 'Tiện ích mẫu được sao chép khi tạo lịch khởi hành mới. Sửa mẫu tại đây không thay đổi các chuyến đã có. Khách sạn và xe sẽ lấy thông tin thực tế theo từng chuyến.'}</p>
    {value.map((item, index) => <div key={item.kind} ref={element => { entryRefs.current[item.kind] = element; }} className="space-y-3 rounded-2xl border border-[#e1eaf7] bg-[#f8faff] p-4">
      <div className="flex items-center justify-between gap-2 border-b border-[#e1eaf7] pb-2">
        <span className="text-[13px] font-semibold text-blue-600">{TOUR_AMENITY_DEFINITIONS.find(def => def.key === item.kind)?.title}</span>
        <div className="flex gap-1">
          <button type="button" aria-label={`Đưa ${item.title} lên`} disabled={index === 0} onClick={() => move(index, -1)} className="rounded p-2 hover:bg-white disabled:opacity-30"><ArrowUp size={16} /></button>
          <button type="button" aria-label={`Đưa ${item.title} xuống`} disabled={index === value.length - 1} onClick={() => move(index, 1)} className="rounded p-2 hover:bg-white disabled:opacity-30"><ArrowDown size={16} /></button>
          <button type="button" aria-label={`Xóa ${item.title}`} onClick={() => onChange(value.filter((_, position) => position !== index))} className="rounded p-2 text-rose-600 hover:bg-white"><Trash2 size={16} /></button>
        </div>
      </div>
      {scheduleMode && <label className="flex items-center gap-2 text-[12px] font-medium text-[#52627e]">
        <input type="checkbox" className="size-4 accent-blue-600" checked={item.is_visible !== false} onChange={event => change(index, { is_visible: event.target.checked })} />
        Hiển thị tiện ích
      </label>}
      <label className="block space-y-2 text-[12px] font-semibold text-[#52627e]"><span>Tiêu đề thẻ</span>
        <input maxLength={150} value={item.title} onChange={event => change(index, { title: event.target.value })} className="min-h-11 w-full rounded-[11px] border border-[#dfe6f1] bg-white px-3 py-2.5 text-[13px] font-medium text-[#263b5c] outline-none focus:border-blue-400" />
      </label>
      <label className="block space-y-2 text-[12px] font-semibold text-[#52627e]"><span>Nội dung chi tiết{item.kind === 'hotel' || item.kind === 'transport' ? ' (ghi chú bổ sung)' : ''}</span>
        <textarea rows={4} maxLength={20000} value={item.content} onChange={event => change(index, { content: event.target.value })} placeholder={item.kind === 'insurance' ? 'Đơn vị bảo hiểm, phạm vi, mức chi trả và điều kiện áp dụng…' : 'Nội dung hiển thị khi khách bấm vào tiện ích…'} className="w-full resize-y rounded-[11px] border border-[#dfe6f1] bg-white px-3 py-2.5 text-[13px] font-normal leading-6 text-[#52627e] outline-none focus:border-blue-400" />
      </label>
    </div>)}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <span className="flex shrink-0 items-center gap-2 text-[13px] font-semibold text-blue-600"><Plus size={18} />Thêm tiện ích</span>
      <CustomDropdown
        ariaLabel="Loại tiện ích cần thêm"
        placeholder="Chọn loại tiện ích"
        selectedValue=""
        options={TOUR_AMENITY_DEFINITIONS.map(definition => ({
          value: definition.key,
          label: `${definition.title}${value.some(item => item.kind === definition.key) ? ' (đã thêm)' : ''}`,
        }))}
        onSelect={selectAmenity}
        variant="compact"
        matchTriggerWidth
        className="min-w-0 flex-1 [&_button[aria-haspopup=listbox]]:min-w-0 [&_button[aria-haspopup=listbox]]:rounded-[11px] [&_button[aria-haspopup=listbox]]:border-[#dfe6f1] [&_button[aria-haspopup=listbox]]:bg-[#f8faff] [&_button[aria-haspopup=listbox]]:text-[13px]"
      />
    </div>
    <p className="text-xs text-slate-500">Chọn mục “đã thêm” để chuyển đến phần chỉnh sửa.</p>
  </div>;
  return embedded ? fields : <AdminFormCard title="Tiện ích mẫu của tour" icon={<Sparkles className="h-5 w-5 text-sky-500" />} bodyClassName="p-6">{fields}</AdminFormCard>;
}
