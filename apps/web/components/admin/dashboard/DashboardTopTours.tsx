"use client";
import { useState } from "react";
import { Award } from "lucide-react";
import Link from "next/link";
import { formatVND } from "@/lib/utils/currency";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { AdminModalShell } from "@/components/common/AdminModalShell";
import type { DashboardTopToursProps } from "shared";

export function DashboardTopTours({ topTours }: DashboardTopToursProps) {
 const [open,setOpen]=useState(false);
 const ranked=[...(topTours||[])].sort((a,b)=>b.bookingsCount-a.bookingsCount||b.revenue-a.revenue||a.tourId-b.tourId);
 const rows=(items:typeof ranked)=>items.map((tour,index)=><div key={tour.tourId} className="flex items-center gap-2.5 py-3">
  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${index===0?"bg-amber-100 text-amber-800":"bg-blue-50 text-slate-500"}`}>{index+1}</span>
  <ImageWithFallback src={tour.featuredImage||undefined} alt={tour.name} className="h-11 w-11 shrink-0 rounded-xl object-cover" loading="lazy"/>
  <div className="min-w-0 flex-1"><Link href={`/admin/tours/${tour.tourId}`} className="block truncate text-xs font-bold text-slate-900 hover:text-blue-600" title={tour.name}>{tour.name}</Link><p className="mt-1 text-[10px] text-slate-400">{tour.code}</p></div>
  <div className="shrink-0 text-right"><p className="text-xs font-bold text-slate-900">{formatVND(tour.revenue)}</p><p className="mt-1 text-[11px] font-semibold text-emerald-600">{tour.bookingsCount} lượt đặt</p></div>
 </div>);
 return <section className="h-full min-w-0 rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm">
  <header className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3"><div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Award size={18}/></span><div><h2 className="text-base font-black tracking-tight text-slate-900">Tour Bán Chạy Nhất</h2><p className="mt-0.5 text-[11px] text-slate-400">Theo lượt đặt, sau đó doanh thu trong kỳ</p></div></div><button type="button" onClick={()=>setOpen(true)} className="shrink-0 text-xs font-bold text-blue-600 hover:underline">Xem tất cả</button></header>
  <div className="divide-y divide-slate-100">{ranked.length?rows(ranked.slice(0,5)):<p className="py-10 text-center text-xs text-slate-400">Chưa có dữ liệu tour.</p>}</div>
  {open&&<AdminModalShell title="Bảng xếp hạng tất cả tour" icon={<Award size={20}/>} onClose={()=>setOpen(false)} maxWidthClassName="max-w-3xl"><div className="p-5"><p className="mb-3 text-xs text-slate-500">Xếp theo lượt đặt giảm dần, sau đó doanh thu trong khoảng thời gian đang chọn trên Dashboard.</p><div className="divide-y divide-slate-100">{rows(ranked)}</div>{!ranked.length&&<p className="py-8 text-center text-sm text-slate-400">Chưa có tour.</p>}</div></AdminModalShell>}
 </section>;
}
