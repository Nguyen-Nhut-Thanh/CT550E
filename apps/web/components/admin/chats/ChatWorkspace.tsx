"use client";
import { TourSharePicker } from "./TourSharePicker";
import { ConversationContexts } from "./ConversationContexts";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { ChatTimeline } from "@/components/chat/ChatTimeline";
import { ArrowLeft, MessageCircle, Phone, Mail, MapPin, CalendarDays } from "lucide-react";
import { useId, useState } from "react";
import type { ChatWorkspaceProps } from "shared";
export function ChatWorkspace({ conversation, messages, loading, hasMore, connected, typing, busy, onBack, onSend, onTyping, onLoadMore, onRetry, onVisible }: ChatWorkspaceProps) {
    const [showInfo, setShowInfo] = useState(false);
    const infoId = useId();
    if (!conversation)
        return <div className="hidden flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl border border-blue-100 bg-white text-slate-400 md:flex"><MessageCircle size={48}/><p className="text-sm">Chọn một hội thoại để hỗ trợ khách hàng.</p></div>;
    const customer = conversation.users;
    const name = customer?.full_name || `Khách #${conversation.user_id}`;
    const avatar = <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-bold text-blue-600">{customer?.avatar_url ? <img src={customer.avatar_url} alt="" className="h-full w-full object-cover"/> : name.charAt(0)}</span>;
    return <div className="relative flex min-w-0 flex-1 gap-1.5">
 <section className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white">
 <header className="flex items-center gap-3 border-b border-blue-50 px-4 py-3"><button type="button" onClick={onBack} aria-label="Quay lại danh sách" className="md:hidden"><ArrowLeft size={20}/></button>{avatar}<div className="min-w-0 flex-1"><h2 className="truncate text-sm font-bold text-blue-950">{name}</h2><p className="mt-1 text-[11px] text-slate-400">{typing ? "Khách đang nhập…" : "Khách hàng"}</p></div><button type="button" onClick={() => setShowInfo(value => !value)} aria-expanded={showInfo} aria-controls={infoId} aria-label={showInfo ? "Ẩn thông tin khách hàng" : "Hiện thông tin khách hàng"} title={showInfo ? "Ẩn thông tin khách hàng" : "Hiện thông tin khách hàng"} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-blue-600 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${showInfo ? "bg-blue-100" : "bg-blue-50"}`}><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="2" width="18" height="20" rx="2" stroke="currentColor" strokeWidth="1.8"/><path d="M14 3h5a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-5V3Z" fill="currentColor"/></svg></button></header>
 <ChatTimeline key={`timeline:${conversation.conversation_id}`} messages={messages} isStaff loading={loading} hasMore={hasMore} onLoadMore={onLoadMore} onRetry={onRetry} onVisible={onVisible}/>
 <p className="px-3 py-1 text-[10px] text-slate-400" role="status">{!connected ? "Đang kết nối lại…" : typing ? "Khách đang nhập…" : "Đã kết nối"}</p>
 <ChatComposer key={`composer:${conversation.conversation_id}`} placeholder="Nhập tin nhắn…" disabled={!connected || busy} onSend={onSend} onTyping={onTyping}/>
 </section>
 <aside id={infoId} aria-label="Thông tin khách hàng" className={`${showInfo ? "absolute inset-y-16 right-0 z-10 flex shadow-xl xl:static xl:shadow-none" : "hidden"} w-64 shrink-0 flex-col gap-1.5 overflow-y-auto bg-blue-50 p-0.5`}>
 <section className="rounded-2xl border border-blue-100 bg-white p-4"><h3 className="mb-4 text-xs font-bold text-blue-950">Thông tin khách hàng</h3><div className="mb-4 flex items-center gap-3">{avatar}<div className="min-w-0"><p className="truncate text-xs font-bold text-blue-950">{name}</p><span className="mt-1 inline-flex rounded-full bg-blue-50 px-2 py-1 text-[10px] text-blue-500">Khách hàng</span></div></div><div className="space-y-3 text-xs text-slate-500"><p className="flex items-center gap-2"><Phone size={14}/>{customer?.phone || "Chưa có số điện thoại"}</p><p className="flex items-center gap-2 break-all"><Mail size={14}/>{customer?.accounts?.email || "Chưa có email"}</p><p className="flex items-center gap-2"><MapPin size={14}/>{customer?.address || "Chưa có địa chỉ"}</p>{customer?.created_at && <p className="flex items-center gap-2 text-[10px] text-slate-400"><CalendarDays size={14}/>Thành viên từ: {new Date(customer.created_at).toLocaleDateString("vi-VN")}</p>}</div></section>
 <ConversationContexts key={conversation.conversation_id} id={conversation.conversation_id} messages={messages}/>
 <section className="rounded-2xl border border-blue-100 bg-white p-4"><h3 className="mb-3 text-xs font-bold text-blue-950">Thao tác nhanh</h3><TourSharePicker key={`tour-picker:${conversation.conversation_id}`} disabled={!connected || busy} onSend={onSend} customerId={conversation.user_id} /></section>
 </aside></div>;
}
