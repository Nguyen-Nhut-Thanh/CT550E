"use client";

import { formatMessageTime } from '@/lib/chat';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { ChatTimelineProps } from 'shared';

export function ChatTimeline({ messages, isStaff, loading, hasMore, onLoadMore, onRetry, onVisible }: ChatTimelineProps) {
  const container = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const previous = useRef({ first: 0, height: 0 });
  const latest = Math.max(0, ...messages.map(item => item.message_id));
  const markVisible = useCallback(() => { if (nearBottom.current && latest) onVisible(latest); }, [latest, onVisible]);

  useLayoutEffect(() => {
    const el = container.current; if (!el) return;
    const first = messages.find(item => item.message_id > 0)?.message_id ?? 0;
    if (previous.current.first && first && first < previous.current.first) el.scrollTop += el.scrollHeight - previous.current.height;
    else if (nearBottom.current) el.scrollTop = el.scrollHeight;
    previous.current = { first, height: el.scrollHeight };
    markVisible();
  }, [messages, markVisible]);
  useEffect(() => {
    window.addEventListener('focus', markVisible); document.addEventListener('visibilitychange', markVisible);
    return () => { window.removeEventListener('focus', markVisible); document.removeEventListener('visibilitychange', markVisible); };
  }, [markVisible]);

  return <div ref={container} onScroll={() => {
    const el = container.current; if (!el) return;
    nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 70; markVisible();
  }} className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4" aria-label="Lịch sử tin nhắn">
    {hasMore && <button type="button" onClick={onLoadMore} className="mx-auto block rounded-full border bg-white px-4 py-1.5 text-xs text-blue-600">Xem tin nhắn trước</button>}
    {loading && <p className="py-3 text-center text-sm text-slate-400">Đang tải tin nhắn…</p>}
    {!loading && !messages.length && <p className="mx-auto max-w-xs py-12 text-center text-sm leading-6 text-slate-500">Gửi lời nhắn để nhân viên tiếp nhận và tư vấn chuyến đi cho bạn.</p>}
    {messages.map(message => {
      const own = isStaff ? message.sender_role !== 'USER' : message.sender_role === 'USER';
      return <div key={message.client_message_id || message.message_id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${own ? 'bg-blue-600 text-white' : 'border border-slate-200 bg-white text-slate-800'}`}>
          {!own && !isStaff && <p className="mb-1 text-[10px] font-semibold text-blue-600">Nhân viên tư vấn</p>}
          {message.message_type === 'IMAGE' ? <a href={message.content} target="_blank" rel="noopener noreferrer" aria-label="Mở ảnh đầy đủ">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={message.content} alt="Ảnh trong hội thoại" className="max-h-64 max-w-full rounded-lg object-contain" loading="lazy" onLoad={() => { const el = container.current; if (el && nearBottom.current) el.scrollTop = el.scrollHeight; }} />
          </a> : message.message_type === 'CONTEXT' ? <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase opacity-70">{message.context?.kind === 'booking' ? 'Hỗ trợ đơn đặt tour' : 'Tư vấn tour'}</p>
            {message.context && !(isStaff && message.context.kind === 'booking') ? <a href={message.context.url} className="font-semibold underline underline-offset-2">{message.content}</a> : <p className="font-semibold">{message.content}</p>}
          </div> : <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{message.content}</p>}
          <div className={`mt-1 flex justify-end gap-1.5 text-[10px] ${own ? 'text-blue-100' : 'text-slate-400'}`}>
            <time dateTime={message.created_at}>{formatMessageTime(message.created_at)}</time>
            {own && <span>{message.delivery_status === 'sending' ? 'Đang gửi…' : message.delivery_status === 'failed' ? 'Chưa gửi' : message.is_read ? 'Đã đọc' : 'Đã gửi'}</span>}
          </div>
          {message.delivery_status === 'failed' && <button type="button" onClick={() => onRetry(message)} className="mt-1 text-xs font-semibold underline">Gửi lại</button>}
        </div>
      </div>;
    })}
  </div>;
}
