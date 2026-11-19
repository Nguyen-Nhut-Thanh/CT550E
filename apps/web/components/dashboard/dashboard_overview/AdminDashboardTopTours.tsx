"use client";
import { useState } from "react";
import { Award } from "lucide-react";
import Link from "next/link";
import { formatVND } from "@/lib/utils/currency";
import { ImageWithFallback } from "@/components/common/dialogs_and_feedback/media/ImageWithFallback";
import { AdminModalShell } from "@/components/common/admin_shared/layout/AdminModalShell";
import type { DashboardTopToursProps } from "shared";

export function DashboardTopTours({ topTours }: DashboardTopToursProps) {
 const [open,setOpen]=useState(false);
 const ranked=[...(topTours||[])].sort((a,b)=>b.bookingsCount-a.bookingsCount||b.revenue-a.revenue||a.tourId-b.tourId);
 const rows=(items:typeof ranked)=>items.map((tour,index)=><div key={tour.tourId} className="grid grid-cols-[24px_68px_minmax(0,1fr)] items-center gap-x-2.5 gap-y-1 py-3">
  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${index===0?"bg-amber-100 text-amber-800":"bg-blue-50 text-[#7387aa]"}`}>{index+1}</span>
  <ImageWithFallback src={tour.featuredImage||undefined} alt={tour.name} className="row-span-2 h-12 w-17 rounded-lg bg-[#edf5ff] object-cover" loading="lazy"/>
  <div className="min-w-0 flex-1"><Link href={`/admin/tours/${tour.tourId}`} className="line-clamp-2 break-words text-[13px] leading-[1.5] font-bold text-[#0b1747] hover:text-blue-600" title={tour.name}>{tour.name}</Link><p className="mt-1 text-[12px] text-[#7387aa]">{tour.code}</p></div>
  <div className="col-3 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1"><p className="break-words text-[13px] font-bold text-[#0b1747]">{formatVND(tour.revenue)}</p><p className="text-[11px] font-[650] text-emerald-600">{tour.bookingsCount} lượt đặt</p></div>
 </div>);
 return <section className="h-full min-w-0 rounded-[14px] border border-[#e1edfc] bg-white p-4">
  <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#edf2fb] pb-3"><div className="flex items-center gap-2"><span className="flex h-5.5 w-5.5 shrink-0 items-center justify-center text-[#eb8500]"><Award size={22}/></span><div><h2 className="text-[16px] font-[750] leading-[1.5] text-[#0b1747]">Tour Bán Chạy Nhất</h2><p className="mt-[3px] text-[12px] leading-[1.5] text-[#7387aa]">Theo lượt đặt, sau đó doanh thu trong kỳ</p></div></div><button type="button" onClick={()=>setOpen(true)} className="inline-flex min-h-9 shrink-0 items-center rounded-lg border border-[#d3e4ff] bg-white px-3 py-2 text-[12px] font-[650] text-[#075bff] transition-colors duration-180 hover:bg-[#f1f7ff] motion-reduce:transition-none">Xem tất cả</button></header>
  <div className="divide-y divide-[#edf2fb]">{ranked.length?rows(ranked.slice(0,5)):<p className="flex min-h-60 items-center justify-center p-6 text-center text-[13px] text-[#7387aa]">Chưa có dữ liệu tour.</p>}</div>
  {open&&<AdminModalShell title="Bảng xếp hạng tất cả tour" icon={<Award size={20}/>} onClose={()=>setOpen(false)} maxWidthClassName="max-w-3xl"><div className="p-4"><p className="mb-3 text-xs text-[#7387aa]">Xếp theo lượt đặt giảm dần, sau đó doanh thu trong khoảng thời gian đang chọn trên Dashboard.</p><div className="divide-y divide-[#edf2fb]">{rows(ranked)}</div>{!ranked.length&&<p className="py-8 text-center text-sm text-[#7387aa]">Chưa có tour.</p>}</div></AdminModalShell>}
 </section>;
}
