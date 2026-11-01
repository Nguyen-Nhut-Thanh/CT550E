"use client";

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ItineraryActivity, LocationOption } from 'shared';

export function ItineraryActivitiesEditor({ activities, locations, destinations, disabled, onChange }: {
  activities: ItineraryActivity[];
  locations: LocationOption[];
  destinations: { location_id: number; visit_order: number; locations?: { name: string } }[];
  disabled: boolean;
  onChange: (activities: ItineraryActivity[]) => void;
}) {
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const provinces = [...destinations].sort((a, b) => a.visit_order - b.visit_order);
  const currentId = provinces.some(item => item.location_id === provinceId) ? provinceId : provinces[0]?.location_id;
  const attractions = locations.filter(item => item.level_id === 6 && item.parent_id === currentId);
  const field = 'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50';
  const update = (index: number, patch: Partial<ItineraryActivity>) => onChange(activities.map((item, i) => i === index ? { ...item, ...patch } : item));

  return <section className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
    <div>
      <h4 className="font-bold text-slate-900">Mốc giờ & điểm tham quan trong ngày</h4>
      <p className="mt-1 text-xs leading-5 text-slate-500">Chọn tỉnh/thành trong tuyến tour, tích điểm tham quan rồi nhập giờ và hoạt động. Chỉ các điểm đã tích mới hiển thị cho khách.</p>
    </div>
    <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Tỉnh/thành của tour">
      {provinces.map(province => <button type="button" key={province.location_id} onClick={() => setProvinceId(province.location_id)} aria-pressed={province.location_id === currentId}
        className={`shrink-0 rounded-xl border px-3 py-2 text-sm font-semibold ${province.location_id === currentId ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-white text-slate-600'}`}>
        {province.locations?.name || locations.find(item => item.location_id === province.location_id)?.name || 'Tỉnh/thành'}
      </button>)}
    </div>
    {!provinces.length && <p className="text-sm text-slate-500">Hãy chọn tỉnh/thành ở phần thông tin tour trước.</p>}
    {!!provinces.length && !attractions.length && <p className="text-sm text-slate-500">Tỉnh/thành này chưa có điểm tham quan. Thêm địa điểm trong Quản lý địa lý để chọn tại đây.</p>}
    <div className="grid gap-2 sm:grid-cols-2">
      {attractions.map(location => {
        const selected = activities.some(item => item.location_id === location.location_id);
        return <label key={location.location_id} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm">
          <input type="checkbox" disabled={disabled} checked={selected} className="h-4 w-4 accent-blue-600" onChange={event => onChange(event.target.checked
            ? [...activities, { time: '', title: location.name, description: '', location_id: location.location_id }]
            : activities.filter(item => item.location_id !== location.location_id))} />
          {location.name}
        </label>;
      })}
    </div>
    <div className="space-y-3">
      {activities.map((activity, index) => <div key={index} className="space-y-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-start gap-2">
          <label className="w-28 shrink-0 space-y-1 text-xs font-semibold text-slate-500">Giờ
            <input aria-label={`Giờ hoạt động ${index + 1}`} type="time" required disabled={disabled} value={activity.time} onChange={event => update(index, { time: event.target.value })} className={field} />
          </label>
          <label className="min-w-0 flex-1 space-y-1 text-xs font-semibold text-slate-500">Hoạt động
            <input aria-label={`Tiêu đề hoạt động ${index + 1}`} maxLength={255} disabled={disabled} value={activity.title} onChange={event => update(index, { title: event.target.value })} className={field} placeholder="VD: Dùng bữa trưa" />
          </label>
          <button type="button" disabled={disabled} aria-label={`Xóa hoạt động ${index + 1}`} onClick={() => onChange(activities.filter((_, i) => i !== index))} className="mt-5 rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-40"><Trash2 size={16} /></button>
        </div>
        {activity.location_id && <p className="text-xs font-semibold text-blue-600">Điểm tham quan: {locations.find(item => item.location_id === activity.location_id)?.name || activity.title}</p>}
        <textarea aria-label={`Mô tả hoạt động ${index + 1}`} disabled={disabled} value={activity.description} onChange={event => update(index, { description: event.target.value })} className={field} rows={2} placeholder="Mô tả trải nghiệm trong tour, thông tin di chuyển hoặc lưu ý…" />
      </div>)}
    </div>
    <button type="button" disabled={disabled} onClick={() => onChange([...activities, { time: '', title: '', description: '', location_id: null }])} className="flex items-center gap-2 text-sm font-bold text-blue-600 disabled:opacity-40"><Plus size={16} />Thêm hoạt động khác (di chuyển, ăn uống, nghỉ ngơi)</button>
    <p className="text-xs text-slate-500">Các mốc giờ sẽ tự sắp xếp từ sớm đến muộn khi lưu.</p>
  </section>;
}
