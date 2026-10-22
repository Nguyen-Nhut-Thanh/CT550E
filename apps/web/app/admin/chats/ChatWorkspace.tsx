"use client";

import { ChatComposer } from '@/components/chat/ChatComposer';
import { ChatTimeline } from '@/components/chat/ChatTimeline';
import { chatStatusLabel } from '@/lib/supportChat';
import { ArrowLeft, CheckCheck, MessageCircle } from 'lucide-react';
import type { ChatWorkspaceProps } from 'shared';

export function ChatWorkspace({ conversation, actor, messages, loading, hasMore, connected, typing, staff, busy, onBack, onManage, onSend, onTyping, onLoadMore, onRetry, onVisible }: ChatWorkspaceProps) {
  if (!conversation) return <div className="hidden flex-1 flex-col items-center justify-center gap-3 bg-slate-50 p-10 text-slate-400 md:flex"><MessageCircle size={48} /><p className="text-sm">Chọn một hội thoại để hỗ trợ khách hàng.</p></div>;
  const mine = conversation.assigned_staff_id === actor?.userId;
  const canReply = mine && conversation.status === 'IN_PROGRESS';
  const contexts = messages.filter(message => message.context).slice(-5).reverse();
  return <div className="flex min-w-0 flex-1">
    <section className="flex min-w-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b bg-white px-4 py-3">
        <button type="button" onClick={onBack} aria-label="Quay lại danh sách" className="md:hidden"><ArrowLeft size={20} /></button>
        <div className="min-w-0 flex-1"><h2 className="truncate font-bold">{conversation.users?.full_name || `Khách #${conversation.user_id}`}</h2><p className="text-xs text-slate-500">{chatStatusLabel(conversation.status)} · {conversation.assigned_staff?.full_name || 'Chưa phân công'}</p></div>
        {!mine ? <button type="button" disabled={busy} onClick={() => void onManage({ action: 'claim' })} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">{conversation.assigned_staff_id ? 'Thử tiếp nhận' : 'Tiếp nhận'}</button> : <>
          <select aria-label="Chuyển cho nhân viên" value="" disabled={busy} onChange={event => { if (event.target.value) void onManage({ action: 'transfer', staff_id: Number(event.target.value) }); }} className="max-w-40 rounded-lg border bg-white p-2 text-xs"><option value="">Chuyển nhân viên</option>{staff.filter(item => item.user_id !== actor?.userId).map(item => <option value={item.user_id} key={item.user_id}>{item.full_name}</option>)}</select>
          <button type="button" disabled={busy} onClick={() => void onManage({ action: conversation.status === 'CLOSED' ? 'reopen' : 'close' })} className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 disabled:opacity-40"><CheckCheck size={15} />{conversation.status === 'CLOSED' ? 'Mở lại' : 'Giải quyết'}</button>
        </>}
      </header>
      <ChatTimeline key={`timeline:${conversation.conversation_id}`} messages={messages} isStaff loading={loading} hasMore={hasMore} onLoadMore={onLoadMore} onRetry={onRetry} onVisible={canReply ? onVisible : () => {}} />
      <p className="bg-slate-50 px-4 py-1 text-xs text-slate-500">{!connected ? 'Đang kết nối lại…' : typing ? 'Khách đang nhập…' : canReply ? 'Đã kết nối' : conversation.status === 'CLOSED' ? 'Mở lại hội thoại để tiếp tục trả lời' : 'Chỉ nhân viên phụ trách được trả lời hội thoại này'}</p>
      <ChatComposer key={`composer:${conversation.conversation_id}`} placeholder="Nhắn cho khách hàng…" disabled={!connected || !canReply || busy} onSend={onSend} onTyping={onTyping} />
    </section>
    <aside className="hidden w-64 shrink-0 space-y-6 overflow-y-auto border-l bg-white p-5 xl:block">
      <div><h3 className="text-xs font-semibold uppercase text-slate-400">Khách hàng</h3><p className="mt-2 font-bold">{conversation.users?.full_name}</p><p className="mt-1 text-xs text-slate-500">Mã khách: #{conversation.user_id}</p></div>
      <div><h3 className="text-xs font-semibold uppercase text-slate-400">Thông tin đang trao đổi</h3><div className="mt-3 space-y-3">{contexts.length ? contexts.map(message => <div key={message.message_id} className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-800">{message.context?.kind === 'tour' ? <a href={message.context.url} target="_blank" rel="noopener noreferrer" className="font-semibold underline">{message.context.title}</a> : <p className="font-semibold">{message.context?.title}</p>}</div>) : <p className="text-xs leading-5 text-slate-400">Tour hoặc đơn đặt tour khách gửi sẽ hiển thị tại đây.</p>}</div></div>
      <p className="text-[11px] leading-5 text-slate-400">Lịch sử được giữ lại sau khi giải quyết. Tin nhắn mới của khách sẽ mở lại hội thoại.</p>
    </aside>
  </div>;
}
