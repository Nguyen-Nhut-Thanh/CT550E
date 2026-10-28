"use client";

import { useId, useRef, useState } from "react";
import { Check, CloudUpload, ImageIcon, Info, Loader2, X } from "lucide-react";
import { Dialog } from "@/components/common/Dialog";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { uploadFeaturedLocationImage } from "@/lib/admin/locations/featured-image";
import type { AdminLocationItem } from "shared";

export function FeaturedLocationImageModal({ location, onClose, onSave }: {
 location: AdminLocationItem; onClose: ()=>void; onSave: (url:string|null)=>void;
}) {
 const titleId=useId();
 const input=useRef<HTMLInputElement>(null);
 const lock=useRef(false);
 const [custom,setCustom]=useState(location.featured_image||"");
 const [choice,setChoice]=useState<"default"|"custom">(location.featured_image?"custom":"default");
 const [uploading,setUploading]=useState(false);
 const [dragging,setDragging]=useState(false);
 const [error,setError]=useState("");
 const defaultImage=location.location_images?.[0]?.image_url;
 const upload=async(file:File|undefined)=>{
  if(!file||lock.current)return;
  lock.current=true;setUploading(true);setError("");
  try {const url=await uploadFeaturedLocationImage(file);setCustom(url);setChoice("custom");}
  catch(cause){setError(cause instanceof Error?cause.message:"Không tải được ảnh.");}
  finally{lock.current=false;setUploading(false);}
 };
 const close=()=>{if(!lock.current)onClose();};
 return <Dialog onClose={close} labelledBy={titleId} overlayClassName="bg-[#315581]/35">
  <div className="my-auto flex max-h-[calc(100dvh-2rem)] w-full max-w-[720px] flex-col overflow-hidden rounded-[22px] border border-white bg-white shadow-2xl">
   <header className="flex shrink-0 items-start gap-4 px-5 pb-4 pt-5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-500"><ImageIcon size={23}/></div><div className="min-w-0 flex-1"><h2 id={titleId} className="text-lg font-bold leading-7 text-blue-950 sm:text-xl">Ảnh hiển thị: {location.name}</h2><p className="mt-1 text-sm text-[#8294b4]">Chọn ảnh đại diện cho địa điểm trên trang chủ</p></div><button type="button" onClick={close} disabled={uploading} aria-label="Đóng chọn ảnh" className="rounded-lg p-1 text-[#8294b4] hover:bg-blue-50 disabled:opacity-40"><X size={23}/></button></header>
   <div className="min-h-0 space-y-3 overflow-y-auto px-5 pb-3">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2" role="group" aria-label="Chọn loại ảnh hiển thị">
     {([{key:"default",title:"Ảnh mặc định",description:"Ảnh từ thư viện địa điểm",src:defaultImage},{key:"custom",title:"Ảnh tùy chỉnh",description:"Ảnh riêng cho trang chủ",src:custom}] as const).map(card=>{
      const selected=choice===card.key;
      return <button type="button" key={card.key} aria-pressed={selected} disabled={uploading || (card.key==="custom"&&!custom)} onClick={()=>setChoice(card.key)} className={`overflow-hidden rounded-2xl border p-1 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-default ${selected?"border-blue-500 ring-1 ring-blue-500":"border-blue-100 hover:border-blue-300"}`}>
       <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-[#f1f6fc]">{card.src?<ImageWithFallback src={card.src} alt={card.title} className="h-full w-full object-cover"/>:<div className="flex h-full flex-col items-center justify-center gap-2 text-[#9aaecb]"><ImageIcon size={32}/><span className="text-xs">{card.key==="custom"?"Chưa có ảnh tùy chỉnh":"Chưa có ảnh mặc định"}</span></div>}
        <span className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-sm ${selected?"bg-blue-500 text-white":"bg-white/90 ring-1 ring-slate-300"}`}>{selected&&<Check size={18} strokeWidth={3}/>}</span>
        {selected&&<span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-semibold text-blue-500 shadow-sm"><Check size={15} className="rounded-full bg-blue-500 p-0.5 text-white"/>Đang sử dụng</span>}
       </div><div className="px-3 py-2"><p className="text-base font-bold text-blue-950">{card.title}</p><p className="mt-1 text-sm text-[#8294b4]">{card.description}</p></div>
      </button>;
     })}
    </div>
    <div onDragOver={e=>{e.preventDefault();if(!uploading)setDragging(true);}} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setDragging(false);}} onDrop={e=>{e.preventDefault();setDragging(false);void upload(e.dataTransfer.files[0]);}} className={`flex flex-col items-center rounded-xl border border-dashed px-4 py-3 text-center transition ${dragging?"border-blue-500 bg-blue-100":"border-blue-300 bg-blue-50/50"}`}>
     <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" aria-label="Chọn ảnh mới" disabled={uploading} onChange={e=>{void upload(e.target.files?.[0]);e.target.value="";}}/>
     {uploading?<Loader2 size={32} className="animate-spin text-blue-500"/>:<CloudUpload size={28} className="text-blue-500"/>}
     <button type="button" disabled={uploading} onClick={()=>input.current?.click()} className="mt-2 text-sm font-bold text-blue-950 disabled:opacity-50">{uploading?"Đang tải ảnh…":"Tải ảnh mới lên"}</button><p className="mt-1 text-xs text-[#8294b4]">PNG, JPG hoặc WebP · Tối đa 5 MB</p><button type="button" disabled={uploading} onClick={()=>input.current?.click()} className="mt-2 inline-flex items-center gap-1.5 text-xs text-blue-500 underline underline-offset-2 disabled:opacity-40"><ImageIcon size={15}/>Chọn từ thư viện</button>
    </div>
    {error&&<p role="alert" className="text-sm text-rose-500">{error}</p>}
    <p className="flex items-start gap-2 text-xs leading-5 text-[#8294b4]"><Info size={16} className="mt-0.5 shrink-0"/>Nếu không chọn ảnh tùy chỉnh, hệ thống sẽ sử dụng ảnh mặc định.</p>
   </div>
   <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-blue-50 px-5 py-3"><p className="flex items-center gap-2 text-xs text-[#8294b4]"><ImageIcon size={16}/>Tỷ lệ ảnh đề xuất 16:9</p><div className="flex items-center gap-3"><button type="button" disabled={uploading} onClick={close} className="rounded-xl border border-blue-100 px-5 py-2.5 text-sm font-semibold text-[#657c9f] hover:bg-blue-50 disabled:opacity-40">Hủy bỏ</button><button type="button" disabled={uploading} onClick={()=>{onSave(choice==="custom"?custom:null);onClose();}} className="rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-40">Lưu thay đổi</button></div></footer>
  </div>
 </Dialog>;
}
