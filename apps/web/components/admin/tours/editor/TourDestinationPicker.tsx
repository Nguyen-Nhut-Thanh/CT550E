"use client";

import { useId, useState } from 'react';
import type { LocationOption } from 'shared';
import FormFieldLabel from '@/components/common/forms/FormFieldLabel';
import { TourRouteOrder } from './TourRouteOrder';

const REGIONS = [
  { key: 'north', name: 'Miền Bắc' },
  { key: 'central', name: 'Miền Trung' },
  { key: 'south', name: 'Miền Nam' },
] as const;

export function TourDestinationPicker({ locations, value, tourType, disabled = false, onChange }: {
  locations: LocationOption[];
  value: number[];
  tourType?: string;
  disabled?: boolean;
  onChange: (ids: number[]) => void;
}) {
  const id = useId();
  const regions = REGIONS.map(region => {
    const parent = locations.find(location => location.level_id === 4 && location.country_code === 'VN' && location.name.trim().toLocaleLowerCase('vi') === region.name.toLocaleLowerCase('vi'));
    return { ...region, provinces: parent ? locations.filter(location => location.level_id === 5 && location.parent_id === parent.location_id).sort((a, b) => a.name.localeCompare(b.name, 'vi')) : [] };
  });
  const [activeRegion, setActiveRegion] = useState<string>(() => regions.find(region => region.provinces.some(province => province.location_id === value[0]))?.key || 'north');
  const active = regions.find(region => region.key === activeRegion)!;
  const domesticIds = new Set(regions.flatMap(region => region.provinces.map(province => province.location_id)));
  const foreignProvinces = locations.filter(location => location.level_id === 5 && location.country_code !== 'VN' && !domesticIds.has(location.location_id)).sort((a, b) => a.name.localeCompare(b.name, 'vi'));

  const provinceList = (provinces: LocationOption[]) => provinces.length ? <div className="custom-scrollbar grid max-h-72 grid-cols-2 gap-2 overflow-y-auto p-3 sm:grid-cols-3 sm:p-4">
    {provinces.map(province => {
      const selected = value.includes(province.location_id);
      return <label key={province.location_id} className={`flex min-w-0 items-center gap-2 rounded-xl border p-3 transition-colors ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'} ${selected ? 'border-blue-200 bg-white text-blue-700 shadow-sm' : 'border-transparent text-slate-600 hover:bg-white'}`}>
        <input type="checkbox" checked={selected} disabled={disabled} onChange={event => onChange(event.target.checked ? [...value, province.location_id] : value.filter(locationId => locationId !== province.location_id))} className="h-4 w-4 shrink-0 rounded border-slate-300 accent-blue-600" />
        <span className={`min-w-0 text-[13px] leading-5 ${selected ? 'font-semibold' : 'font-medium'}`}>{province.name}</span>
      </label>;
    })}
  </div> : <p className="px-4 py-8 text-center text-sm text-slate-500">Chưa có tỉnh/thành phố trong danh mục này.</p>;

  return <div className="space-y-4 border-t border-slate-50 pt-4">
    <div className="flex items-center justify-between gap-3">
      <FormFieldLabel>Tỉnh/thành trong hành trình</FormFieldLabel>
      <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-600">Đã chọn: {value.length}</span>
    </div>
    {tourType !== 'outbound' && <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <div role="tablist" aria-label="Chọn miền của tỉnh/thành phố" className="grid grid-cols-3 border-b border-slate-200 bg-white">
        {regions.map((region, index) => {
          const selected = region.key === activeRegion;
          const selectedCount = region.provinces.filter(province => value.includes(province.location_id)).length;
          return <button key={region.key} id={`${id}-${region.key}`} type="button" role="tab" aria-selected={selected} aria-controls={`${id}-provinces`} tabIndex={selected ? 0 : -1}
            onClick={() => setActiveRegion(region.key)}
            onKeyDown={event => {
              const next = event.key === 'ArrowRight' ? (index + 1) % regions.length : event.key === 'ArrowLeft' ? (index + regions.length - 1) % regions.length : event.key === 'Home' ? 0 : event.key === 'End' ? regions.length - 1 : null;
              if (next === null) return;
              event.preventDefault();
              setActiveRegion(regions[next].key);
              document.getElementById(`${id}-${regions[next].key}`)?.focus();
            }}
            className={`min-w-0 border-b-2 px-2 py-3 text-center transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${selected ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-transparent text-slate-500 hover:bg-slate-50'}`}>
            <span className="block text-[13px] font-bold">{region.name}</span>
            <span className="mt-1 block text-xs">{region.provinces.length} tỉnh/thành{selectedCount ? ` · ${selectedCount} đã chọn` : ''}</span>
          </button>;
        })}
      </div>
      <div key={active.key} id={`${id}-provinces`} role="tabpanel" aria-labelledby={`${id}-${active.key}`}>{provinceList(active.provinces)}</div>
    </div>}
    {tourType !== 'domestic' && <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
      <p className="border-b border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">Tỉnh/thành phố ngoài Việt Nam</p>
      {provinceList(foreignProvinces)}
    </div>}
    <TourRouteOrder ids={value} locations={locations} disabled={disabled} onChange={onChange} />
  </div>;
}
