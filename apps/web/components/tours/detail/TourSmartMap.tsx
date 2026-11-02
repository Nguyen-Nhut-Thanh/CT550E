"use client";

import { MapPin, Route } from 'lucide-react';
import { useState } from 'react';
import type { TourSmartMapProps } from 'shared';
import { ImageWithFallback } from '@/components/common/media/ImageWithFallback';

export default function TourSmartMap({ tour, attractions: scheduleAttractions = [] }: TourSmartMapProps) {
  const [activeProvince, setActiveProvince] = useState<number | null>(null);
  const provinces = [...(tour?.tour_destinations || [])].sort((a, b) => a.visit_order - b.visit_order).map(item => ({
    id: item.location_id ?? item.locations?.location_id,
    name: item.name || item.locations?.name || 'Điểm đến',
  })).filter((item, index, items) => item.id != null && items.findIndex(other => other.id === item.id) === index);
  const selected = provinces.find(item => item.id === activeProvince) || provinces[0];
  const attractions = [...scheduleAttractions].sort((a, b) => a.sort_order - b.sort_order).filter(item => item.location?.parent_id === selected?.id);

  return <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
    <div className="flex items-start gap-3"><span className="rounded-2xl bg-sky-100 p-3 text-sky-600"><Route className="h-5 w-5" /></span><div><h2 className="text-xl font-bold text-slate-900">Khám phá điểm đến</h2><p className="mt-1 text-sm leading-6 text-slate-500">Chọn từng tỉnh/thành để xem các điểm tham quan trong tour.</p></div></div>
    {!selected ? <p className="py-4 text-sm text-slate-500">Các điểm đến đang được cập nhật.</p> : <>
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 md:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-4" aria-live="polite">
          <div><h3 className="text-lg font-bold text-slate-900">{selected.name}</h3><p className="mt-1 text-xs text-slate-500">{attractions.length} điểm tham quan trong hành trình</p></div>
          {attractions.length ? attractions.map(visit => {
            const location = visit.location!;
            return <article key={visit.location_id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              {location.location_images?.[0]?.image_url && <ImageWithFallback src={location.location_images[0].image_url} alt={location.name} loading="lazy" className="aspect-[16/8] w-full object-cover" />}
              <div className="space-y-2 p-4"><h4 className="flex items-center gap-2 font-bold text-slate-900"><MapPin className="h-4 w-4 shrink-0 text-sky-600" />{location.name}</h4>
                <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{location.note || 'Thông tin giới thiệu địa điểm đang được cập nhật.'}</p>
              </div>
            </article>;
          }) : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-slate-500">Chưa có điểm tham quan được chọn tại {selected.name} trong lịch trình này.</div>}
        </div>
        <aside className="order-first min-w-0 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:order-none">
          <h3 className="font-bold text-slate-900">Hành trình qua các tỉnh/thành</h3>
          <p className="mb-4 mt-1 text-xs leading-5 text-slate-500">Theo thứ tự tuyến tour</p>
          <div className="flex gap-2 overflow-x-auto pb-1 md:flex-col">
            {provinces.map((province, index) => {
              const count = scheduleAttractions.filter(item => item.location?.parent_id === province.id).length;
              const active = selected.id === province.id;
              return <button type="button" key={province.id} onClick={() => setActiveProvince(province.id!)} aria-pressed={active} className={`flex min-w-44 shrink-0 items-center gap-3 rounded-2xl border p-3 text-left transition-colors md:min-w-0 ${active ? 'border-sky-500 bg-white shadow-sm' : 'border-transparent bg-white hover:border-slate-200'}`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${active ? 'bg-sky-600 text-white' : 'border border-slate-200 text-slate-600'}`}>{index + 1}</span>
                <span><span className="block text-sm font-bold text-slate-900">{province.name}</span><span className="mt-1 block text-xs text-slate-500">{count} điểm tham quan</span></span>
              </button>;
            })}
          </div>
        </aside>
      </div>
      <p className="border-t border-slate-100 pt-4 text-sm text-slate-600"><span className="mb-1 block text-xs font-semibold uppercase text-slate-400">Tuyến hành trình</span>{[tour?.departure_locations?.name, ...provinces.map(item => item.name)].filter((name, index, names) => name && (index === 0 || name !== names[index - 1])).join(' → ')}</p>
    </>}
  </section>;
}
