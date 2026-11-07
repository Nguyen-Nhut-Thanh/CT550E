"use client";

import { Info, Search, X } from 'lucide-react';
import { useState } from 'react';
import { slugify, type AdminLocationItem } from 'shared';
import { ImageWithFallback } from '@/components/common/media/ImageWithFallback';
import { FeaturedLocationsGrid } from './FeaturedLocationsGrid';

export function FeaturedLocationsLeftPanel({ allChildren, featured, onToggleSelect, disabled = false }: {
  allChildren: AdminLocationItem[]; featured: AdminLocationItem[]; onToggleSelect: (location: AdminLocationItem) => void; disabled?: boolean;
}) {
  const [search, setSearch] = useState('');
  const [selectedOnly, setSelectedOnly] = useState(false);
  const selectedIds = new Set(featured.map(item => item.location_id));
  const visible = allChildren.filter(item => (!selectedOnly || selectedIds.has(item.location_id)) && slugify(item.name).includes(slugify(search)));
  return <div className="flex min-w-0 flex-col gap-3 lg:min-h-0">
    <section className="flex min-h-0 flex-col rounded-[13px] border border-[#dfeafb] bg-white/95 p-3.5 shadow-[0_2px_8px_#3869a705] lg:flex-none">
      <h2 className="mb-3 text-[14px] font-bold text-[#102044]">Chọn địa điểm</h2>
      <div className="relative shrink-0">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8499b9]" />
        <input aria-label="Tìm địa điểm" value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm tỉnh / thành phố..." className="min-h-9 w-full rounded-[9px] border border-[#dce6f5] bg-white py-2 pl-9 pr-8 text-[12px] text-[#263b5c] outline-none placeholder:text-[#8d9eb8] focus:border-blue-400 focus:ring-2 focus:ring-blue-50" />
        {search && <button type="button" aria-label="Xóa tìm kiếm địa điểm" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#8499b9] hover:bg-blue-50"><X size={13} /></button>}
      </div>
      <div role="group" aria-label="Lọc địa điểm" className="my-2.5 grid shrink-0 grid-cols-2 rounded-[8px] bg-[#f0f5fd] p-0.5">
        {[{ value: false, label: `Tất cả (${allChildren.length})` }, { value: true, label: `Đã chọn (${featured.length})` }].map(tab => <button key={String(tab.value)} type="button" aria-pressed={selectedOnly === tab.value} onClick={() => setSelectedOnly(tab.value)} className={`min-h-7 rounded-[7px] border px-2 py-1 text-[11px] font-semibold transition-colors ${selectedOnly === tab.value ? 'border-[#d8e7ff] bg-white text-[#0766ff] shadow-sm shadow-blue-100/30' : 'border-transparent text-[#52627e] hover:text-blue-600'}`}>{tab.label}</button>)}
      </div>
      <div className="custom-scrollbar min-h-0 max-h-[340px] space-y-0.5 overflow-y-auto pr-1 lg:h-[350px] lg:max-h-[350px] lg:shrink-0">
        {visible.length ? visible.map(location => <label key={location.location_id} className={`flex min-w-0 items-center gap-2.5 rounded-[8px] px-1.5 py-1.5 transition-colors ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-[#f3f8ff]'}`}>
          <input type="checkbox" disabled={disabled} checked={selectedIds.has(location.location_id)} onChange={() => onToggleSelect(location)} aria-label={`Chọn ${location.name}`} className="size-4 shrink-0 rounded accent-blue-600" />
          <ImageWithFallback src={location.featured_image || location.location_images?.[0]?.image_url || undefined} alt="" className="h-8 w-[54px] shrink-0 rounded-[5px] object-cover" loading="lazy" />
          <span className="min-w-0 truncate text-[12px] font-medium text-[#263b5c]">{location.name}</span>
        </label>) : <p className="px-3 py-8 text-center text-[12px] leading-6 text-[#91a0b7]">Không có địa điểm phù hợp.</p>}
      </div>
    </section>
    <section className="shrink-0 rounded-[13px] border border-[#dfeafb] bg-white/95 p-3.5 shadow-[0_2px_8px_#3869a705]">
      <h2 className="mb-3 flex items-center gap-2 text-[13px] font-bold text-[#102044]">Mô phỏng bố cục trang chủ<Info size={13} className="text-[#8499b9]" aria-label="Xem vị trí các địa điểm trên trang chủ" /></h2>
      <FeaturedLocationsGrid items={featured} />
      <p className="mt-2 text-[10px] leading-4 text-[#91a0b7]">Vị trí 1 và 6 hiển thị ô lớn trên trang chủ.</p>
    </section>
  </div>;
}
