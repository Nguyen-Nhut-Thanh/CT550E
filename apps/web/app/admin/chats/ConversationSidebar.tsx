"use client";

import { formatConversationTime, getConversationPreview } from '@/lib/chat';
import { chatStatusLabel } from '@/lib/supportChat';
import { RefreshCw, Search } from 'lucide-react';
import type { ConversationSidebarProps } from 'shared';

export function ConversationSidebar({ conversations, unreadTotal, selectedId, loading, searchTerm, filter, onFilterChange, onSearchChange, onRefresh, onSelect }: ConversationSidebarProps) {
  return <aside className={`${selectedId ? 'hidden md:flex' : 'flex'} w-full shrink-0 flex-col border-r border-slate-200 bg-white md:w-72 lg:w-80`}>
    <div className="space-y-3 border-b p-4">
      <div className="flex items-center justify-between"><h1 className="text-lg font-bold">Hộp thư tư vấn <span className="text-sm text-blue-600">({unreadTotal})</span></h1><button type="button" onClick={onRefresh} aria-label="Làm mới hội thoại" className="rounded-lg p-2 hover:bg-slate-100"><RefreshCw size={17} /></button></div>
      <label className="flex items-center gap-2 rounded-xl bg-slate-100 px-3"><Search size={16} className="text-slate-400" /><input value={searchTerm} onChange={event => onSearchChange(event.target.value)} placeholder="Tìm khách hàng, tin nhắn…" aria-label="Tìm hội thoại" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none" /></label>
      <select aria-label="Lọc hội thoại" value={filter} onChange={event => onFilterChange(event.target.value)} className="w-full rounded-lg border bg-white p-2 text-sm">
        <option value="WAITING">Chờ tiếp nhận</option><option value="MINE">Tôi phụ trách</option><option value="UNREAD">Chưa đọc</option><option value="IN_PROGRESS">Đang hỗ trợ</option><option value="CLOSED">Đã giải quyết</option><option value="ALL">Tất cả hội thoại</option>
      </select>
    </div>
    <div className="min-h-0 flex-1 overflow-y-auto">
      {loading && <p className="p-5 text-sm text-slate-400">Đang tải…</p>}
      {!loading && !conversations.length && <p className="px-5 py-10 text-center text-sm text-slate-400">Không có hội thoại phù hợp.</p>}
      {conversations.map(item => <button type="button" key={item.conversation_id} onClick={() => onSelect(item.conversation_id)} className={`w-full border-b border-slate-100 p-4 text-left transition ${selectedId === item.conversation_id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
        <div className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate text-sm font-bold">{item.users?.full_name || `Khách #${item.user_id}`}</span><time className="text-[10px] text-slate-400">{formatConversationTime(item.last_message_at)}</time></div>
        <div className="mt-1 flex items-center gap-2"><p className="flex-1 truncate text-xs text-slate-500">{getConversationPreview(item)}</p>{item.unread_count > 0 && <span className="rounded-full bg-blue-600 px-1.5 text-[10px] text-white">{item.unread_count}</span>}</div>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]"><span className={`rounded-full px-2 py-0.5 ${item.status === 'WAITING' ? 'bg-amber-100 text-amber-800' : item.status === 'CLOSED' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'}`}>{chatStatusLabel(item.status)}</span>{item.assigned_staff && <span className="py-0.5 text-slate-400">{item.assigned_staff.full_name}</span>}</div>
      </button>)}
    </div>
  </aside>;
}
