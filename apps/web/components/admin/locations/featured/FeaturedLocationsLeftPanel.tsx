"use client";
import { LayoutGrid, Search } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "@/components/common/media/ImageWithFallback";
import type { AdminLocationItem } from "shared";
import { FeaturedLocationsGrid } from "./FeaturedLocationsGrid";

export function FeaturedLocationsLeftPanel({ allChildren, featured, onToggleSelect }: {
 allChildren: AdminLocationItem[]; featured: AdminLocationItem[]; onToggleSelect: (location: AdminLocationItem) => void;
}) {
 const [search,setSearch]=useState("");
 const [selectedOnly,setSelectedOnly]=useState(false);
 const selectedIds=new Set(featured.map(item=>item.location_id));
 const visible=allChildren.filter(item=>(!selectedOnly||selectedIds.has(item.location_id))&&item.name.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi")));
 return (<div className="space-y-3 lg:col-span-4 xl:col-span-3">
  <section className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm">
   <label className="flex items-center gap-2 rounded-xl border border-blue-100 bg-[#f3f7fd] px-3 text-[#8499b9]"><Search size={16}/><input aria-label="Tìm địa điểm" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tìm tỉnh / thành phố…" className="min-w-0 flex-1 bg-transparent py-2.5 text-xs outline-none"/></label>
   <div className="my-3 flex gap-1" aria-label="Lọc địa điểm">{[{value:false,label:`Tất cả (${allChildren.length})`},{value:true,label:`Đã chọn (${featured.length})`}].map(tab=><button key={String(tab.value)} type="button" aria-pressed={selectedOnly===tab.value} onClick={()=>setSelectedOnly(tab.value)} className={`rounded-full border px-3 py-1 text-[11px] transition ${selectedOnly===tab.value ? "border-blue-500 bg-blue-500 text-white shadow-sm" : "border-blue-100 bg-blue-50/50 text-slate-500 hover:bg-blue-50"}`}>{tab.label}</button>)}</div>
   <div className="custom-scrollbar max-h-[560px] space-y-1.5 overflow-y-auto">
    {visible.length ? visible.map(location=><label key={location.location_id} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-blue-50 p-2 transition hover:border-blue-200 hover:bg-blue-50/40"><input type="checkbox" checked={selectedIds.has(location.location_id)} onChange={()=>onToggleSelect(location)} aria-label={`Chọn ${location.name}`} className="h-3.5 w-3.5 shrink-0 accent-blue-600"/><ImageWithFallback src={location.featured_image||location.location_images?.[0]?.image_url||undefined} alt="" className="h-10 w-14 shrink-0 rounded-md object-cover" loading="lazy"/><div className="min-w-0"><p className="truncate text-xs font-bold text-blue-950">{location.name}</p><p className="mt-0.5 truncate text-[10px] text-[#8294b2]">{location.geographic_levels?.name||"Địa điểm"} {location.name}</p></div></label>) : <p className="px-3 py-10 text-center text-xs text-slate-400">Không có địa điểm phù hợp.</p>}
   </div>
  </section>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-900">
          <LayoutGrid size={14} className="text-blue-500" />
          Mô phỏng vị trí (9 ô)
        </h3>
        <FeaturedLocationsGrid items={featured} />
        <p className="mt-4 text-center text-[9px] font-medium italic text-slate-400">
          * Vị trí 1 và 6 hiển thị kích thước lớn trên trang chủ.
        </p>
      </div>
    </div>
  );
}
