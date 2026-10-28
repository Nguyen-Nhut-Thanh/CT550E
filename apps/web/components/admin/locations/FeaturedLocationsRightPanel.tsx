"use client";
import { useRef, useState } from "react";
import { FeaturedLocationImageModal } from "./FeaturedLocationImageModal";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { ArrowDownUp, GripVertical, Image as ImageIcon, MapPin, Trash2 } from "lucide-react";
import type { AdminLocationItem } from "shared";

export function FeaturedLocationsRightPanel({featured,onMoveItem,onReorder,onToggleSelect,onImageChange}: {
 featured:AdminLocationItem[];onMoveItem:(index:number,direction:"up"|"down")=>void;onReorder:(from:number,to:number)=>void;onToggleSelect:(location:AdminLocationItem)=>void;onImageChange:(index:number,value:string|null)=>void;
}) {
 const dragging=useRef<number|null>(null);
 const [over,setOver]=useState<number|null>(null);
 const [imageId,setImageId]=useState<number|null>(null);
 const imageIndex=featured.findIndex(item=>item.location_id===imageId);
 const imageLocation=featured[imageIndex];
 return <section className="self-start overflow-hidden rounded-xl border border-blue-100 bg-white p-3 shadow-sm lg:col-span-8 xl:col-span-9">
  <header className="mb-3 flex items-start gap-2 px-1 pt-1"><ArrowDownUp size={19} className="mt-0.5 text-blue-500"/><div><h3 className="text-sm font-bold text-blue-950">Thứ tự hiển thị</h3><p className="mt-0.5 text-[11px] text-[#8294b2]">Kéo thả để sắp xếp các điểm đến. Dùng phím ↑ ↓ trên nút kéo để đổi vị trí.</p></div><span className="ml-auto text-[11px] text-slate-400">{featured.length}/9</span></header>
  <div className="custom-scrollbar max-h-[750px] space-y-2 overflow-y-auto">
   {!featured.length && <p className="rounded-xl border border-dashed border-blue-100 bg-blue-50/30 px-4 py-16 text-center text-xs text-slate-400">Chọn địa điểm từ bên trái để bắt đầu.</p>}
   {featured.map((location,index)=><div key={location.location_id} onDragOver={e=>{if(dragging.current!==null){e.preventDefault();e.dataTransfer.dropEffect="move";setOver(index);}}} onDrop={e=>{e.preventDefault();const from=dragging.current;if(from!==null)onReorder(from,index);dragging.current=null;setOver(null);}} className={`flex items-center gap-3 rounded-xl border p-2.5 transition ${over===index?"border-blue-400 bg-blue-50":"border-blue-100/70 bg-white"}`}>
    <button type="button" draggable aria-label={`Di chuyển ${location.name}, vị trí ${index+1}`} title="Kéo thả hoặc dùng phím mũi tên lên/xuống" onDragStart={e=>{dragging.current=index;e.dataTransfer.effectAllowed="move";e.dataTransfer.setData("text/plain",String(location.location_id));}} onDragEnd={()=>{dragging.current=null;setOver(null);}} onKeyDown={e=>{if(e.key==="ArrowUp"||e.key==="ArrowDown"){e.preventDefault();onMoveItem(index,e.key==="ArrowUp"?"up":"down");}}} className="shrink-0 cursor-grab rounded p-0.5 text-[#91a4c0] hover:text-blue-500 active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-blue-300"><GripVertical size={16}/></button>
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-500">{String(index+1).padStart(2,"0")}</span>
    <ImageWithFallback src={location.featured_image||location.location_images?.[0]?.image_url||undefined} alt={location.name} className="h-[76px] w-28 shrink-0 rounded-lg object-cover sm:w-36 xl:w-40" loading="lazy"/>
    <div className="min-w-0 flex-1"><p className="text-xs font-bold text-blue-950">{location.name}</p><p className="mt-1 flex items-center gap-1 text-[10px] text-[#8294b2]"><MapPin size={11} className="shrink-0 text-blue-400"/>{location.geographic_levels?.name||"Địa điểm"} {location.name}</p>{location.note && <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#8294b2]">{location.note}</p>}</div>
    <span className="hidden shrink-0 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-500 sm:inline-block">Đang hiển thị</span>
    <div className="flex shrink-0 flex-col gap-2 sm:flex-row"><button type="button" aria-label={`Đổi ảnh ${location.name}`} onClick={()=>setImageId(location.location_id)} className="rounded-lg border border-blue-100 p-2 text-[#7189ad] hover:bg-blue-50"><ImageIcon size={15}/></button><button type="button" aria-label={`Bỏ chọn ${location.name}`} onClick={()=>onToggleSelect(location)} className="rounded-lg bg-rose-50 p-2 text-rose-500 hover:bg-rose-100"><Trash2 size={15}/></button></div>
   </div>)}
  </div>
  {imageLocation && <FeaturedLocationImageModal key={imageLocation.location_id} location={imageLocation} onClose={()=>setImageId(null)} onSave={url=>onImageChange(imageIndex,url)}/>}
 </section>;
}
