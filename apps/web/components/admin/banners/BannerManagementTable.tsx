"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, Eye, EyeOff, ImageIcon } from "lucide-react";
import { AdminPagination } from "@/components/common/AdminPagination";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { BannerRowActions } from "./BannerRowActions";
import type { Banner } from "shared";

export function BannerManagementTable({ items, loading, busyIds, onToggle, onDuplicate, onDelete, onBulkStatus }: {
 items: Banner[]; loading: boolean; busyIds: Set<number>; onToggle: (item: Banner)=>void; onDuplicate: (item: Banner)=>void; onDelete: (item: Banner)=>void; onBulkStatus: (ids: number[], status: number)=>Promise<void>;
}) {
 const pageSize=10;
 const [page,setPage]=useState(1);
 const [selected,setSelected]=useState<number[]>([]);
 const [sizes,setSizes]=useState<Record<string,string>>({});
 const selectAll=useRef<HTMLInputElement>(null);
 const totalPages=Math.max(1,Math.ceil(items.length/pageSize));
 const current=Math.min(page,totalPages);
 const visible=items.slice((current-1)*pageSize,current*pageSize);
 const allSelected=visible.length>0 && visible.every(item=>selected.includes(item.banner_id));
 const selectedItems=items.filter(item=>selected.includes(item.banner_id));
 useEffect(()=>{if(selectAll.current)selectAll.current.indeterminate=!allSelected && visible.some(item=>selected.includes(item.banner_id));},[visible,selected,allSelected]);
 useEffect(()=>{setPage(1);},[items]);
 const bulkBusy=selectedItems.some(item=>busyIds.has(item.banner_id));
 return <section className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-[0_2px_12px_#dbeafe55]">
 {selectedItems.length>0 && <div className="flex flex-wrap items-center gap-3 border-b border-blue-100 bg-blue-50 px-5 py-3 text-xs text-blue-700"><span className="font-semibold">Đã chọn {selectedItems.length} banner</span><button type="button" disabled={bulkBusy} onClick={()=>void onBulkStatus(selectedItems.map(item=>item.banner_id),1)} className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 disabled:opacity-40">Hiển thị</button><button type="button" disabled={bulkBusy} onClick={()=>void onBulkStatus(selectedItems.map(item=>item.banner_id),0)} className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 disabled:opacity-40">Ẩn</button><button type="button" onClick={()=>setSelected([])} className="ml-auto hover:underline">Bỏ chọn</button></div>}
 <div className="overflow-x-auto"><table className="w-full min-w-[980px] border-collapse text-left text-xs text-[#25416d]">
 <thead className="bg-[#f7faff] text-[10px] font-semibold uppercase text-[#7a92b9]"><tr><th className="w-12 px-5 py-4"><input ref={selectAll} type="checkbox" aria-label="Chọn tất cả banner trên trang" checked={allSelected} disabled={loading || !visible.length} onChange={()=>setSelected(current=>allSelected ? current.filter(id=>!visible.some(item=>item.banner_id===id)) : Array.from(new Set([...current,...visible.map(item=>item.banner_id)])))} className="h-3.5 w-3.5 accent-blue-600"/></th>{["Hình ảnh","Tiêu đề","Vị trí hiển thị","Thứ tự","Trạng thái","Thời gian tạo","Thao tác"].map(label=><th key={label} className="whitespace-nowrap px-3 py-4">{label}</th>)}</tr></thead>
 <tbody className="divide-y divide-blue-50">
 {loading ? <tr><td colSpan={8} className="p-12 text-center text-slate-400">Đang tải banner…</td></tr> : !visible.length ? <tr><td colSpan={8} className="p-12 text-center text-slate-400">Không tìm thấy banner phù hợp.</td></tr> : visible.map((item,index)=>{
 const busy=busyIds.has(item.banner_id);
 const date=new Date(item.created_at);
 const validDate=!Number.isNaN(date.getTime());
 return <tr key={item.banner_id} className={`transition-colors hover:bg-blue-50/40 ${selected.includes(item.banner_id)?"bg-blue-50/60":""}`}>
 <td className="px-5 py-3"><input type="checkbox" checked={selected.includes(item.banner_id)} aria-label={`Chọn ${item.header}`} onChange={()=>setSelected(current=>current.includes(item.banner_id)?current.filter(id=>id!==item.banner_id):[...current,item.banner_id])} className="h-3.5 w-3.5 accent-blue-600"/></td>
 <td className="w-36 px-3 py-3"><ImageWithFallback src={item.image_url} alt={item.header} loading="lazy" className="h-[62px] w-[120px] rounded-lg border border-blue-100 object-cover" onLoad={e=>{const image=e.currentTarget;if(image.getAttribute("src")===item.image_url && image.naturalWidth)setSizes(current=>({...current,[item.image_url]:`${image.naturalWidth} × ${image.naturalHeight}`}));}}/></td>
 <td className="min-w-60 max-w-80 px-3 py-3"><a href={`/admin/banners/${item.banner_id}`} className="line-clamp-1 text-[13px] font-bold text-blue-950 hover:text-blue-600">{item.header || "Chưa có tiêu đề"}</a><p className="mt-1 line-clamp-1 text-[11px] text-[#8b9dbb]">{item.description || item.location_name}</p>{sizes[item.image_url] && <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#8b9dbb]"><ImageIcon size={12}/>{sizes[item.image_url]}</p>}</td>
 <td className="px-3 py-3"><span className="whitespace-nowrap rounded-full bg-[#e5f3ff] px-3 py-1 text-[10px] font-medium text-blue-500">Trang chủ</span></td>
 <td className="px-3 py-3 font-semibold text-blue-950">{(current-1)*pageSize+index+1}</td>
 <td className="px-3 py-3"><div className="flex items-center gap-2"><span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1 text-[10px] ${item.status===1?"bg-emerald-50 text-emerald-600":"bg-slate-100 text-slate-500"}`}>{item.status===1?<Eye size={12}/>:<EyeOff size={12}/>} {item.status===1?"Hiển thị":"Ẩn"}</span><button type="button" role="switch" aria-checked={item.status===1} aria-label={`${item.status===1?"Ẩn":"Hiển thị"} banner ${item.header}`} disabled={busy} onClick={()=>onToggle(item)} className={`relative h-[18px] w-8 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 disabled:opacity-40 ${item.status===1?"bg-blue-500":"bg-slate-300"}`}><span className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${item.status===1?"left-0.5 translate-x-3.5":"left-0.5"}`}/></button></div></td>
 <td className="px-3 py-3"><div className="flex items-center gap-2 text-[11px] leading-5 text-[#8198bd]"><CalendarDays size={14}/><div>{validDate?date.toLocaleDateString("vi-VN"):"—"}<p>{validDate?date.toLocaleTimeString("vi-VN",{hour:"2-digit",minute:"2-digit"}):""}</p></div></div></td>
 <td className="px-3 py-3"><BannerRowActions banner={item} busy={busy} onToggle={onToggle} onDuplicate={onDuplicate} onDelete={onDelete}/></td>
 </tr>;})}
 </tbody></table></div>
 <AdminPagination currentPage={current} totalPages={totalPages} totalItems={items.length} pageSize={pageSize} itemLabel="banner" variant="numbered" showSinglePage onPageChange={setPage}/>
 </section>;
}
