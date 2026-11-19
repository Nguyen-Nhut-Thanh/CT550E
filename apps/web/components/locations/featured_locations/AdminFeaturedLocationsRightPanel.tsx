"use client";

import { useRef, useState } from 'react';
import { Eye, GripVertical, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { AdminLocationItem } from 'shared';
import { FEATURED_LIMIT } from '@/lib/locations/admin/featured';
import { FeaturedLocationImageModal } from "@/components/locations/featured_locations/AdminFeaturedLocationImageModal";
import { ImageWithFallback } from '@/components/common/dialogs_and_feedback/media/ImageWithFallback';

export function FeaturedLocationsRightPanel({ featured, onMoveItem, onReorder, onToggleSelect, onImageChange, disabled = false }: {
  featured: AdminLocationItem[]; onMoveItem: (index: number, direction: 'up' | 'down') => void;
  onReorder: (from: number, to: number) => void; onToggleSelect: (location: AdminLocationItem) => void;
  onImageChange: (index: number, value: string | null) => void; disabled?: boolean;
}) {
  const dragging = useRef<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [imageId, setImageId] = useState<number | null>(null);
  const imageIndex = featured.findIndex(item => item.location_id === imageId);
  const imageLocation = featured[imageIndex];
  // Let the left column set the shared row height; overflow scrolls inside this panel.
  return <section className="@container flex min-w-0 flex-col overflow-hidden rounded-[14px] border border-[#e1edfc] bg-white p-3.5 shadow-2xs lg:min-h-0 lg:[contain:size]">
    <header className="mb-3.5 flex shrink-0 flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-sm font-bold text-slate-900">Thứ tự hiển thị</h2><p className="mt-0.5 text-xs text-slate-500">Kéo thả để sắp xếp các địa điểm. Dùng phím ↑ ↓ để đổi vị trí.</p></div>
      <span className="rounded-full border border-[#e1edfc] bg-blue-50/70 px-2.5 py-0.5 text-xs text-slate-600"><strong className="font-bold text-blue-700">{featured.length}/{FEATURED_LIMIT}</strong> vị trí</span>
    </header>
    <div className="custom-scrollbar min-h-0 max-h-[680px] space-y-2 overflow-y-auto pr-1 lg:max-h-none lg:flex-1">
      {!featured.length && <div className="flex min-h-52 items-center justify-center rounded-xl border border-dashed border-[#e1edfc] bg-[#f8fbff] p-5 text-center text-xs leading-6 text-slate-400">Chọn địa điểm từ bên trái để bắt đầu.</div>}
      {featured.map((location, index) => <div key={location.location_id} onDragOver={event => { if (!disabled && dragging.current !== null) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setOver(index); } }} onDrop={event => { event.preventDefault(); const from = dragging.current; if (!disabled && from !== null) onReorder(from, index); dragging.current = null; setOver(null); }} className={`flex min-w-0 items-center gap-2 rounded-xl border p-2 transition-colors @min-[500px]:gap-3 @min-[500px]:p-2.5 ${over === index ? 'border-blue-400 bg-blue-50' : 'border-[#e1edfc] bg-white hover:bg-slate-50/50'}`}>
        <button type="button" disabled={disabled} draggable={!disabled} aria-label={`Di chuyển ${location.name}, vị trí ${index + 1}`} title="Kéo thả hoặc dùng phím mũi tên lên/xuống" onDragStart={event => { if (disabled) { event.preventDefault(); return; } dragging.current = index; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', String(location.location_id)); }} onDragEnd={() => { dragging.current = null; setOver(null); }} onKeyDown={event => { if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); onMoveItem(index, event.key === 'ArrowUp' ? 'up' : 'down'); } }} className="shrink-0 cursor-grab rounded p-1 text-slate-400 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-300 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"><GripVertical size={15} /></button>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-100 text-xs font-bold text-blue-700 @min-[500px]:size-8">{String(index + 1).padStart(2, '0')}</span>
        <ImageWithFallback src={location.featured_image || location.location_images?.[0]?.image_url || undefined} alt={location.name} className="h-[56px] w-[80px] shrink-0 rounded-lg object-cover border border-[#e1edfc] @min-[500px]:h-[68px] @min-[500px]:w-[110px] @min-[700px]:h-[72px] @min-[700px]:w-[130px]" loading="lazy" />
        <div className="min-w-0 flex-1"><h3 className="truncate text-xs sm:text-sm font-bold text-slate-900 leading-snug">{location.name}</h3><p className="mt-0.5 text-xs text-slate-500">Điểm đến nổi bật</p></div>
        <span className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 @min-[600px]:inline-flex"><Eye size={13} />Đang hiển thị</span>
        <div className="flex shrink-0 flex-col gap-1.5 @min-[500px]:flex-row">
          <button type="button" disabled={disabled} aria-label={`Đổi ảnh ${location.name}`} onClick={() => setImageId(location.location_id)} className="grid size-8 place-items-center rounded-lg border border-[#e1edfc] bg-white text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-40 cursor-pointer shadow-2xs"><ImageIcon size={15} /></button>
          <button type="button" disabled={disabled} aria-label={`Bỏ chọn ${location.name}`} onClick={() => onToggleSelect(location)} className="grid size-8 place-items-center rounded-lg border border-rose-100 bg-rose-50 text-rose-500 transition-colors hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-rose-400 disabled:opacity-40 cursor-pointer shadow-2xs"><Trash2 size={15} /></button>
        </div>
      </div>)}
    </div>
    {imageLocation && <FeaturedLocationImageModal key={imageLocation.location_id} location={imageLocation} onClose={() => setImageId(null)} onSave={url => onImageChange(imageIndex, url)} />}
  </section>;
}
