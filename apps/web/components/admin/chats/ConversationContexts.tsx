"use client";
import { useEffect, useState } from "react";
import { chatApi } from "@/lib/chat/api";
import { AdminModalShell } from "@/components/admin/common/AdminModalShell";
import type { ChatContextCard, ChatDisplayMessage } from "shared";

/** Shows the three latest shared items and the full conversation history in a popup. */
export function ConversationContexts({ id, messages }: { id: number; messages: ChatDisplayMessage[] }) {
 const [items, setItems] = useState<ChatContextCard[]>([]);
 const [open, setOpen] = useState(false);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const latest = Math.max(0, ...messages.filter(m => m.context).map(m => m.message_id));
 useEffect(() => {
  let active = true;
  setLoading(true);
  void chatApi.contexts(id).then(rows => { if (active) {setItems(rows);setError("");} }).catch(e => { if(active) setError(e.message); }).finally(() => {if(active) setLoading(false);});
  return () => {active=false;};
 }, [id, latest]);
 const cards = (rows: ChatContextCard[]) => rows.map(context => <div key={`${context.kind}:${context.id}`} className="rounded-xl border border-blue-100 bg-blue-50/40 p-3"><p className="mb-2 text-[10px] text-blue-500">{context.kind === "tour" ? "Tư vấn tour" : "Đơn đặt tour"}</p><a href={context.kind === "tour" ? context.url : `/admin/bookings?bookingId=${context.id}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold leading-6 text-blue-950 hover:underline">{context.title} →</a></div>);
 return <section className="rounded-2xl border border-blue-100 bg-white p-4"><div className="mb-3 flex items-center justify-between gap-2"><h3 className="text-xs font-bold text-blue-950">Tour và đơn đang trao đổi</h3><button type="button" onClick={() => setOpen(true)} className="shrink-0 text-[10px] text-blue-500 hover:underline">Xem tất cả</button></div><div className="space-y-2">{loading && !items.length ? <p className="text-xs text-slate-400">Đang tải…</p> : error ? <p role="alert" className="text-xs text-red-500">{error}</p> : items.length ? cards(items.slice(0,3)) : <p className="text-xs leading-5 text-slate-400">Chưa có tour hoặc đơn đặt tour được chia sẻ.</p>}</div>{open && <AdminModalShell title="Tất cả tour và đơn đang trao đổi" onClose={() => setOpen(false)}><div className="space-y-3 p-5">{cards(items)}{!items.length && <p className="text-sm text-slate-400">Chưa có thông tin được chia sẻ.</p>}</div></AdminModalShell>}</section>;
}
