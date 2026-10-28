"use client";
import { formatConversationTime, getConversationPreview } from "@/lib/chat/format";
import { RefreshCw, Search } from "lucide-react";
import type { ConversationSidebarProps } from "shared";
export function ConversationSidebar({ conversations, selectedId, loading, searchTerm, onSearchChange, onRefresh, onSelect }: ConversationSidebarProps) {
    return <aside className={`${selectedId ? "hidden md:flex" : "flex"} w-full shrink-0 flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white md:w-64 lg:w-72`}>
 <div className="space-y-3 p-4">
 <div className="flex items-center justify-between"><h1 className="text-lg font-bold text-blue-950">Hỗ trợ khách hàng</h1><button type="button" onClick={onRefresh} aria-label="Làm mới hội thoại" className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"><RefreshCw size={16}/></button></div>
 <p className="!mt-0 text-xs leading-5 text-slate-400">Quản lý và hỗ trợ khách hàng của bạn.</p>
 <label className="flex items-center gap-2 rounded-lg border border-blue-100 px-3"><Search size={15} className="text-blue-300"/><input value={searchTerm} onChange={e => onSearchChange(e.target.value)} placeholder="Tìm tên khách, tin nhắn…" aria-label="Tìm hội thoại" className="min-w-0 flex-1 bg-transparent py-2 text-xs outline-none"/></label>
 </div>
 <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">{loading && <p className="p-5 text-sm text-slate-400">Đang tải…</p>}{!loading && !conversations.length && <p className="px-4 py-10 text-center text-xs text-slate-400">Không có hội thoại phù hợp.</p>}
 {conversations.map(item => <button type="button" key={item.conversation_id} onClick={() => onSelect(item.conversation_id)} className={`flex w-full gap-3 rounded-xl p-4 text-left transition ${selectedId === item.conversation_id ? "bg-blue-50" : "hover:bg-slate-50"}`}>
 <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-bold text-blue-600">{item.users?.avatar_url ? <img src={item.users.avatar_url} alt="" className="h-full w-full object-cover"/> : (item.users?.full_name || "K").charAt(0)}</span>
 <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="flex-1 truncate text-xs font-bold text-blue-950">{item.users?.full_name || `Khách #${item.user_id}`}</span><time className="text-[9px] text-slate-400">{formatConversationTime(item.last_message_at)}</time></div>
 <div className="my-1.5 flex items-center gap-2"><p className="flex-1 truncate text-[11px] text-slate-400">{getConversationPreview(item)}</p>{item.unread_count > 0 && <span className="rounded-full bg-rose-500 px-1.5 text-[10px] text-white">{item.unread_count}</span>}</div>
</div></button>)}
 </div></aside>;
}
