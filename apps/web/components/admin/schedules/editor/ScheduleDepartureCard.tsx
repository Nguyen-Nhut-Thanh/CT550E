"use client";

import type { Dispatch, SetStateAction } from 'react';
import type { LocationOption, ScheduleFormState } from 'shared';
import { AdminFormCard } from '@/components/admin/common/AdminFormCard';
import { MapPin, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export function ScheduleDepartureCard({ form, locations, disabled, onChange }: {
  form: ScheduleFormState;
  locations: LocationOption[];
  disabled: boolean;
  onChange: Dispatch<SetStateAction<ScheduleFormState>>;
}) {
  const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm disabled:bg-slate-50 disabled:text-slate-500';
  function update(index: number, field: 'name' | 'address' | 'pickup_at' | 'note', value: string) {
    onChange(prev => ({ ...prev, pickup_points: prev.pickup_points.map((point, i) => i === index ? { ...point, [field]: value } : point) }));
  }
  function move(index: number, offset: number) {
    onChange(prev => {
      const points = [...prev.pickup_points];
      [points[index], points[index + offset]] = [points[index + offset], points[index]];
      return { ...prev, pickup_points: points };
    });
  }
  return <AdminFormCard title="Nơi xuất phát & Điểm đón" icon={<MapPin size={20} className="text-blue-600" />} bodyClassName="space-y-5 p-6">
    <label className="block space-y-2 text-sm font-semibold text-slate-700">
      <span>Nơi xuất phát của chuyến</span>
      <select className={inputClass} disabled={disabled} value={form.departure_location_id}
        onChange={event => onChange(prev => ({ ...prev, departure_location_id: event.target.value ? Number(event.target.value) : '' }))}>
        <option value="">Chọn nơi xuất phát</option>
        {locations.map(location => <option key={location.location_id} value={location.location_id}>{location.name}</option>)}
      </select>
    </label>
    <p className="text-xs text-slate-500">Nơi xuất phát được lưu riêng cho chuyến này. Các điểm đón bên dưới dùng chung quỹ chỗ của chuyến.</p>
    {disabled && <p className="text-sm text-amber-700">Chuyến đã khởi hành hoặc đã có đơn đặt nên không thể thay đổi nơi xuất phát và điểm đón.</p>}
    <div className="space-y-4">
      {form.pickup_points.map((point, index) => <div key={index} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-700">Điểm đón {index + 1}</span>
          <div className="flex gap-2">
            <button type="button" aria-label={`Đưa điểm đón ${index + 1} lên`} disabled={disabled || index === 0} onClick={() => move(index, -1)} className="p-1 disabled:opacity-30"><ArrowUp size={17} /></button>
            <button type="button" aria-label={`Đưa điểm đón ${index + 1} xuống`} disabled={disabled || index === form.pickup_points.length - 1} onClick={() => move(index, 1)} className="p-1 disabled:opacity-30"><ArrowDown size={17} /></button>
            <button type="button" aria-label={`Xóa điểm đón ${index + 1}`} disabled={disabled} className="p-1 text-red-600 disabled:opacity-30"
              onClick={() => onChange(prev => ({ ...prev, pickup_points: prev.pickup_points.filter((_, i) => i !== index) }))}><Trash2 size={17} /></button>
          </div>
        </div>
        <label className="block space-y-1 text-xs text-slate-600"><span>Tên điểm đón</span><input className={inputClass} disabled={disabled} maxLength={150} value={point.name} onChange={e => update(index, 'name', e.target.value)} placeholder="Ví dụ: Bến xe Cần Thơ" /></label>
        <label className="block space-y-1 text-xs text-slate-600"><span>Địa chỉ cụ thể</span><input className={inputClass} disabled={disabled} maxLength={500} value={point.address} onChange={e => update(index, 'address', e.target.value)} /></label>
        <label className="block space-y-1 text-xs text-slate-600"><span>Ngày và giờ đón (giờ Việt Nam)</span><input type="datetime-local" className={inputClass} disabled={disabled} value={point.pickup_at} onChange={e => update(index, 'pickup_at', e.target.value)} /></label>
        <label className="block space-y-1 text-xs text-slate-600"><span>Hướng dẫn đón khách</span><input className={inputClass} disabled={disabled} maxLength={1000} value={point.note} onChange={e => update(index, 'note', e.target.value)} placeholder="Ví dụ: Có mặt trước 15 phút" /></label>
      </div>)}
    </div>
    <button type="button" disabled={disabled || form.pickup_points.length >= 50} className="inline-flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 disabled:opacity-40"
      onClick={() => onChange(prev => ({ ...prev, pickup_points: [...prev.pickup_points, { name: '', address: '', pickup_at: prev.start_date ? `${prev.start_date}T${prev.start_time}` : '', note: '' }] }))}>
      <Plus size={16} /> Thêm điểm đón
    </button>
    {!form.pickup_points.length && <p className="text-xs text-slate-500">Chưa thiết lập điểm đón cụ thể. Khách vẫn có thể đặt chuyến và liên hệ để được hướng dẫn.</p>}
  </AdminFormCard>;
}
