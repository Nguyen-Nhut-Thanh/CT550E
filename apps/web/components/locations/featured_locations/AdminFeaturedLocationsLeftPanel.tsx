"use client";

import { Info, Search, X } from 'lucide-react';
import { useState } from 'react';
import { slugify, type AdminLocationItem } from 'shared';
import { ImageWithFallback } from '@/components/common/dialogs_and_feedback/media/ImageWithFallback';
import { FeaturedLocationsGrid } from "@/components/locations/featured_locations/AdminFeaturedLocationsGrid";

export function FeaturedLocationsLeftPanel({ allChildren, featured, onToggleSelect, disabled = false }: {
  allChildren: AdminLocationItem[]; featured: AdminLocationItem[]; onToggleSelect: (location: AdminLocationItem) => void; disabled?: boolean;
}) {
  const [search, setSearch] = useState('');
  const [selectedOnly, setSelectedOnly] = useState(false);
  const selectedIds = new Set(featured.map(item => item.location_id));
  const visible = allChildren.filter(item => (!selectedOnly || selectedIds.has(item.location_id)) && slugify(item.name).includes(slugify(search)));
  return <div className="flex min-w-0 flex-col gap-3.5 lg:min-h-0">
    <section className="flex min-h-0 flex-col rounded-[14px] border border-[#e1edfc] bg-white p-3.5 shadow-2xs lg:flex-none">
      <h2 className="mb-2.5 text-sm font-bold text-slate-900">Chọn địa điểm</h2>
      <div className="relative shrink-0">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input aria-label="Tìm địa điểm" value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm tỉnh / thành phố..." className="min-h-9 w-full rounded-lg border border-[#e1edfc] bg-white py-1.5 pl-8.5 pr-8 text-xs text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-50" />
        {search && <button type="button" aria-label="Xóa tìm kiếm địa điểm" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"><X size={13} /></button>}
      </div>
      <div role="group" aria-label="Lọc địa điểm" className="my-2.5 grid shrink-0 grid-cols-2 rounded-lg bg-slate-100/70 p-0.5">
        {[{ value: false, label: `Tất cả (${allChildren.length})` }, { value: true, label: `Đã chọn (${featured.length})` }].map(tab => <button key={String(tab.value)} type="button" aria-pressed={selectedOnly === tab.value} onClick={() => setSelectedOnly(tab.value)} className={`min-h-7 rounded-md px-2 py-1 text-xs font-semibold transition-colors cursor-pointer ${selectedOnly === tab.value ? 'border border-[#e1edfc] bg-white text-blue-600 shadow-2xs' : 'border-transparent text-slate-600 hover:text-blue-600'}`}>{tab.label}</button>)}
      </div>
      <div className="custom-scrollbar min-h-0 max-h-[340px] space-y-1 overflow-y-auto pr-1 lg:h-[350px] lg:max-h-[350px] lg:shrink-0">
        {visible.length ? visible.map(location => <label key={location.location_id} className={`flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-blue-50/50'}`}>
          <input type="checkbox" disabled={disabled} checked={selectedIds.has(location.location_id)} onChange={() => onToggleSelect(location)} aria-label={`Chọn ${location.name}`} className="size-4 shrink-0 rounded accent-blue-600 cursor-pointer" />
          <ImageWithFallback src={location.featured_image || location.location_images?.[0]?.image_url || undefined} alt="" className="h-8 w-[54px] shrink-0 rounded-md object-cover border border-[#e1edfc]" loading="lazy" />
          <span className="min-w-0 truncate text-xs font-medium text-slate-800">{location.name}</span>
        </label>) : <p className="px-3 py-8 text-center text-xs leading-6 text-slate-400">Không có địa điểm phù hợp.</p>}
      </div>
    </section>
    <section className="shrink-0 rounded-[14px] border border-[#e1edfc] bg-white p-3.5 shadow-2xs">
      <h2 className="mb-2.5 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900">Mô phỏng bố cục trang chủ<Info size={14} className="text-slate-400" aria-label="Xem vị trí các địa điểm trên trang chủ" /></h2>
      <FeaturedLocationsGrid items={featured} />
      <p className="mt-2 text-[10px] leading-4 text-slate-500">Vị trí 1 và 6 hiển thị ô lớn trên trang chủ.</p>
    </section>
  </div>;
}
