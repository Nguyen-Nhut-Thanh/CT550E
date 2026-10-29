"use client";

import { Dialog } from "@/components/common/Dialog";
import { getPublicTours } from "@/lib/tours/api";
import { ImageIcon, LoaderCircle, Map, Search, SendHorizontal, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { ChatContextInput, PublicTourCard } from "shared";

export function CustomerTourPicker({ disabled, onSend, onClose }: {
  disabled: boolean;
  onSend: (content: string, type: "CONTEXT", context: ChatContextInput) => Promise<void>;
  onClose: () => void;
}) {
  const titleId = useId();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [tours, setTours] = useState<PublicTourCard[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const sendingRef = useRef(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { input.current?.focus(); }, []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    const timer = setTimeout(() => {
      void getPublicTours({ search, take: 6, skip: page * 6 })
        .then(result => {
          if (active) { setTours(result.items); setTotal(result.total); }
        })
        .catch(() => { if (active) setError("Chưa tải được danh sách tour. Bạn thử lại nhé."); })
        .finally(() => { if (active) setLoading(false); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [search, page, reload]);

  const send = async (tour: PublicTourCard) => {
    if (disabled || sendingRef.current || !tour.next_schedule) return;
    sendingRef.current = true;
    setSending(tour.tour_id);
    setError("");
    try {
      await onSend(tour.name, "CONTEXT", { tour_id: tour.tour_id });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không gửi được tour. Bạn thử lại nhé.");
    } finally {
      sendingRef.current = false;
      setSending(null);
    }
  };

  return (
    <Dialog labelledBy={titleId} onClose={() => { if (!sendingRef.current) onClose(); }}>
      <section className="flex max-h-[min(520px,calc(100dvh-64px))] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl">
        <header className="flex shrink-0 items-center gap-3 border-b border-blue-50 p-4">
          <span className="rounded-2xl bg-blue-50 p-3 text-blue-600"><Map size={22} /></span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="font-bold text-blue-950">Gửi tour nhờ tư vấn</h2>
            <p className="mt-1 text-xs text-slate-500">Chọn tour bạn quan tâm để gửi cho tư vấn viên.</p>
          </div>
          <button type="button" disabled={sending !== null} onClick={onClose} aria-label="Đóng chọn tour" className="rounded-full p-2 text-slate-500 hover:bg-blue-50 disabled:opacity-40"><X size={20} /></button>
        </header>
        <div className="shrink-0 p-4 pb-2">
          <label className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-slate-50 px-3 focus-within:ring-2 focus-within:ring-blue-200">
            <Search size={18} className="shrink-0 text-blue-400" />
            <input ref={input} value={search} disabled={sending !== null} onChange={event => { setSearch(event.target.value); setPage(0); setLoading(true); }} aria-label="Tìm tour để gửi" placeholder="Tìm tên tour, điểm đến…" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" />
          </label>
        </div>
        {error && <div role="alert" className="mx-4 mb-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-600">{error} <button type="button" disabled={sending !== null} onClick={() => setReload(value => value + 1)} className="font-semibold underline">Thử lại</button></div>}
        <div aria-busy={loading} className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-2">
          {loading ? <p className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin" />Đang tìm tour…</p> : !tours.length ? <p className="py-12 text-center text-sm text-slate-500">Không tìm thấy tour phù hợp.</p> : tours.map(tour => (
            <article key={tour.tour_id} className="flex items-center gap-3 rounded-2xl border border-blue-50 bg-sky-50/50 p-2.5">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-100 text-blue-400">
                {tour.cover_image ? <img src={tour.cover_image} alt="" className="h-full w-full object-cover" /> : <ImageIcon size={24} />}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-sm font-semibold text-blue-950">{tour.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{tour.duration_days} ngày {tour.duration_nights} đêm</p>
                <p className="mt-1 text-xs font-semibold text-blue-600">{tour.next_schedule ? `${tour.next_schedule.price.toLocaleString("vi-VN")} đ` : "Chưa có lịch khởi hành"}</p>
              </div>
              <button type="button" disabled={disabled || sending !== null || !tour.next_schedule} onClick={() => void send(tour)} aria-label={`Gửi tour ${tour.name}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40">
                {sending === tour.tour_id ? <LoaderCircle size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
              </button>
            </article>
          ))}
        </div>
        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-blue-50 px-4 py-3 text-xs text-slate-500">
          <span>{disabled ? "Đang kết nối lại, vui lòng đợi để gửi tour…" : "Tour được gửi dưới dạng thẻ trong hội thoại."}</span>
          {total > 6 && <div className="flex items-center gap-2">
            <button type="button" disabled={page === 0 || loading || sending !== null} onClick={() => { setPage(value => value - 1); setLoading(true); }} className="rounded-lg p-1.5 hover:bg-blue-50 disabled:opacity-30">Trước</button>
            <span>{page + 1}/{Math.ceil(total / 6)}</span>
            <button type="button" disabled={(page + 1) * 6 >= total || loading || sending !== null} onClick={() => { setPage(value => value + 1); setLoading(true); }} className="rounded-lg p-1.5 hover:bg-blue-50 disabled:opacity-30">Sau</button>
          </div>}
        </footer>
      </section>
    </Dialog>
  );
}
