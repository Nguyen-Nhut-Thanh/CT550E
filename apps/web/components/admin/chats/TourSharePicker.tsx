"use client";

import { AdminModalShell } from "@/components/admin/common/AdminModalShell";
import { CalendarDays } from "lucide-react";
import { getPublicTours } from "@/lib/tours/api";
import { Search, SendHorizontal, Map } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChatWorkspaceProps, PublicTourCard } from "shared";

/** Finds public tours and sends a tour card in the current conversation. */
export function TourSharePicker({ disabled, onSend, customerId }: {
  disabled: boolean;
  customerId: number;
  onSend: ChatWorkspaceProps["onSend"];
}) {
  const [mode, setMode] = useState<"share" | "booking">("share");
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tours, setTours] = useState<PublicTourCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const sendingRef = useRef(false);
  useEffect(() => {
    if (!open) return;
    input.current?.focus();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError("");
    const timer = setTimeout(() => {
      void getPublicTours({ search, take: 8, skip: page * 8 })
        .then(result => { if (active) { setTours(result.items); setTotal(result.total); } })
        .catch(e => { if (active) setError(e instanceof Error ? e.message : "Không tải được danh sách tour"); })
        .finally(() => { if (active) setLoading(false); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [open, search, page]);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  const send = async (tour: PublicTourCard) => {
    if (disabled || sendingRef.current) return;
    sendingRef.current = true;
    setSending(tour.tour_id);
    setError("");
    try {
      await onSend(tour.name, "CONTEXT", { tour_id: tour.tour_id });
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không gửi được tour, hãy thử lại");
    } finally {
      sendingRef.current = false;
      setSending(null);
    }
  };
  return <div className="space-y-2">
    <button ref={trigger} type="button" disabled={disabled} aria-expanded={open} aria-controls="tour-share-panel" onClick={() => {setMode("share");setOpen(true);}} className="flex w-full items-center gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-600 hover:bg-blue-100 disabled:opacity-40"><Map size={14}/>Gửi thông tin tour</button>
    <button type="button" disabled={disabled} onClick={() => {setMode("booking");setOpen(true);}} className="flex w-full items-center gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-600 hover:bg-blue-100 disabled:opacity-40"><CalendarDays size={14}/>Tạo booking</button>
    {open && <AdminModalShell title={mode === "share" ? "Gửi thông tin tour" : "Chọn tour để tạo booking"} onClose={() => {if(sending === null) close();}}><section id="tour-share-panel" className="p-5">
      <label className="mb-2 flex items-center gap-2 rounded-lg border border-blue-100 px-2"><Search size={15} className="text-blue-400"/><input ref={input} aria-label="Tìm tour để gửi" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder="Tìm tên tour, điểm đến…" className="min-w-0 flex-1 py-2 text-xs outline-none"/></label>
      {error && <p role="alert" className="mb-2 text-xs text-red-500">{error}</p>}
      <div className="max-h-96 space-y-3 overflow-y-auto">
        {loading ? <p className="p-4 text-center text-xs text-slate-400">Đang tìm tour…</p> : !tours.length ? <p className="p-4 text-center text-xs text-slate-400">Không tìm thấy tour phù hợp.</p> : tours.map(tour => <div key={tour.tour_id} className="flex items-center gap-3 rounded-lg bg-blue-50/40 p-3">
          {tour.cover_image && <img src={tour.cover_image} alt="" className="h-14 w-16 shrink-0 rounded-lg object-cover"/>}
          <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-blue-950">{tour.name}</p><p className="mt-0.5 text-[10px] text-slate-400">{tour.duration_days} ngày {tour.duration_nights} đêm{tour.next_schedule && <> · Khởi hành: {new Date(tour.next_schedule.start_date).toLocaleDateString("vi-VN", {timeZone:"Asia/Ho_Chi_Minh"})}</>}</p><p className="mt-0.5 text-xs font-semibold text-blue-600">{(tour.next_schedule?.price ?? tour.base_price).toLocaleString("vi-VN")} đ</p></div>
          {mode === "booking" && tour.next_schedule ? <a href={`/booking?tourId=${tour.tour_id}&scheduleId=${tour.next_schedule.tour_schedule_id}&customerId=${customerId}`} className="shrink-0 rounded-lg bg-blue-500 px-3 py-2 text-xs text-white">Tạo booking</a> : <button type="button" disabled={disabled || sending !== null || !tour.next_schedule} onClick={() => void send(tour)} aria-label={`Gửi tour ${tour.name}`} className="flex shrink-0 items-center gap-1 rounded-lg bg-blue-500 px-2.5 py-2 text-xs text-white disabled:opacity-40"><SendHorizontal size={13}/>{sending === tour.tour_id ? "Đang gửi…" : "Gửi"}</button>}
        </div>)}
      </div>
      {total > 8 && <div className="mt-2 flex items-center justify-between text-xs text-slate-500"><button type="button" disabled={page === 0 || loading} onClick={() => setPage(p => p - 1)} className="p-1 disabled:opacity-30">Trước</button><span>{page + 1} / {Math.ceil(total / 8)}</span><button type="button" disabled={(page + 1) * 8 >= total || loading} onClick={() => setPage(p => p + 1)} className="p-1 disabled:opacity-30">Sau</button></div>}
    </section></AdminModalShell>}
  </div>;
}
