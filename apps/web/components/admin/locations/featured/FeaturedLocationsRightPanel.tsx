"use client";

import { useRef, useState } from 'react';
import { Eye, GripVertical, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { AdminLocationItem } from 'shared';
import { FEATURED_LIMIT } from '@/lib/admin/locations/featured';
import { FeaturedLocationImageModal } from './FeaturedLocationImageModal';
import { ImageWithFallback } from '@/components/common/media/ImageWithFallback';

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
  return <section className="@container flex min-w-0 flex-col overflow-hidden rounded-[13px] border border-[#dfeafb] bg-white/95 p-3.5 shadow-[0_2px_8px_#3869a705] lg:min-h-0 lg:[contain:size]">
    <header className="mb-4 flex shrink-0 flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-[15px] font-bold text-[#102044]">Thứ tự hiển thị</h2><p className="mt-1 text-[12px] leading-5 text-[#8499b9]">Kéo thả để sắp xếp các địa điểm. Dùng phím ↑ ↓ để đổi vị trí.</p></div>
      <span className="rounded-full bg-[#f1f7ff] px-2.5 py-1 text-[11px] text-[#8499b9]"><strong className="font-bold text-[#173052]">{featured.length}/{FEATURED_LIMIT}</strong> vị trí</span>
    </header>
    <div className="custom-scrollbar min-h-0 max-h-[680px] space-y-2 overflow-y-auto pr-1 lg:max-h-none lg:flex-1">
      {!featured.length && <div className="flex min-h-52 items-center justify-center rounded-xl border border-dashed border-[#dce8f8] bg-[#f8fbff] p-5 text-center text-[12px] leading-6 text-[#91a0b7]">Chọn địa điểm từ bên trái để bắt đầu.</div>}
      {featured.map((location, index) => <div key={location.location_id} onDragOver={event => { if (!disabled && dragging.current !== null) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setOver(index); } }} onDrop={event => { event.preventDefault(); const from = dragging.current; if (!disabled && from !== null) onReorder(from, index); dragging.current = null; setOver(null); }} className={`flex min-w-0 items-center gap-2 rounded-[10px] border p-2 transition-colors @min-[500px]:gap-3 @min-[500px]:p-2.5 ${over === index ? 'border-blue-400 bg-blue-50' : 'border-[#e2edfc] bg-[linear-gradient(110deg,#fff,#fbfdff)]'}`}>
        <button type="button" disabled={disabled} draggable={!disabled} aria-label={`Di chuyển ${location.name}, vị trí ${index + 1}`} title="Kéo thả hoặc dùng phím mũi tên lên/xuống" onDragStart={event => { if (disabled) { event.preventDefault(); return; } dragging.current = index; event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('text/plain', String(location.location_id)); }} onDragEnd={() => { dragging.current = null; setOver(null); }} onKeyDown={event => { if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); onMoveItem(index, event.key === 'ArrowUp' ? 'up' : 'down'); } }} className="shrink-0 cursor-grab rounded p-0.5 text-[#91a4c0] hover:text-blue-500 focus-visible:ring-2 focus-visible:ring-blue-300 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40"><GripVertical size={15} /></button>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#eaf4ff] text-[12px] font-bold text-[#0766ff] @min-[500px]:size-8">{String(index + 1).padStart(2, '0')}</span>
        <ImageWithFallback src={location.featured_image || location.location_images?.[0]?.image_url || undefined} alt={location.name} className="h-[60px] w-[84px] shrink-0 rounded-[7px] object-cover @min-[500px]:h-[72px] @min-[500px]:w-[120px] @min-[700px]:h-[76px] @min-[700px]:w-[144px]" loading="lazy" />
        <div className="min-w-0 flex-1"><h3 className="truncate text-[13px] leading-5 font-bold text-[#102044] @min-[500px]:text-[14px]">{location.name}</h3><p className="mt-1 text-[11px] leading-5 text-[#8499b9]">Điểm đến nổi bật</p></div>
        <span className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[8px] bg-[#eaf5ff] px-2.5 py-2 text-[11px] font-semibold text-[#0766ff] @min-[600px]:inline-flex"><Eye size={14} />Đang hiển thị</span>
        <div className="flex shrink-0 flex-col gap-2 @min-[500px]:flex-row">
          <button type="button" disabled={disabled} aria-label={`Đổi ảnh ${location.name}`} onClick={() => setImageId(location.location_id)} className="grid size-8 place-items-center rounded-[8px] border border-[#dce6f5] bg-white text-[#536d98] transition-colors hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-400 disabled:opacity-40"><ImageIcon size={15} /></button>
          <button type="button" disabled={disabled} aria-label={`Bỏ chọn ${location.name}`} onClick={() => onToggleSelect(location)} className="grid size-8 place-items-center rounded-[8px] border border-rose-100 bg-rose-50 text-rose-500 transition-colors hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-rose-400 disabled:opacity-40"><Trash2 size={15} /></button>
        </div>
      </div>)}
    </div>
    {imageLocation && <FeaturedLocationImageModal key={imageLocation.location_id} location={imageLocation} onClose={() => setImageId(null)} onSave={url => onImageChange(imageIndex, url)} />}
  </section>;
}
