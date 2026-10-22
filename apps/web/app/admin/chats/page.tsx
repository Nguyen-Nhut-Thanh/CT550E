"use client";

import { useChatConversation } from '@/lib/client/hooks/useChatConversation';
import { useChatSession } from '@/lib/client/hooks/useChatSession';
import { chatApi } from '@/lib/chatApi';
import { useEffect, useMemo, useState } from 'react';
import type { ChatManageInput, ChatStaff } from 'shared';
import { ChatWorkspace } from './ChatWorkspace';
import { ConversationSidebar } from './ConversationSidebar';

export default function AdminChatsPage() {
  const session = useChatSession();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('WAITING');
  const [staff, setStaff] = useState<ChatStaff[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const chat = useChatConversation(session.token, session.actor, selectedId);
  const selected = session.conversations.find(item => item.conversation_id === selectedId) ?? null;
  useEffect(() => {
    if (!session.actor?.isStaff) return;
    let active = true;
    void chatApi.staff().then(items => { if (active) setStaff(items); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [session.actor]);
  const visible = useMemo(() => session.conversations.filter(item => {
    const matches = filter === 'ALL' || (filter === 'MINE' ? item.assigned_staff_id === session.actor?.userId && item.status !== 'CLOSED' : filter === 'UNREAD' ? item.unread_count > 0 : item.status === filter);
    return matches && `${item.users?.full_name ?? ''} ${item.last_message ?? ''} ${item.user_id}`.toLocaleLowerCase('vi').includes(search.toLocaleLowerCase('vi'));
  }), [session.conversations, session.actor, filter, search]);
  const manage = async (input: ChatManageInput) => {
    if (!selectedId || busy) return;
    setBusy(true); setError('');
    try { await chatApi.manage(selectedId, input); await session.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không thực hiện được'); }
    finally { setBusy(false); }
  };
  return <div className="flex h-full min-h-0 flex-col">
    {(error || session.error || chat.error) && <div role="alert" className="flex items-center gap-3 border-b bg-amber-50 px-4 py-2 text-xs text-amber-800"><span className="flex-1">{error || session.error || chat.error}</span><button type="button" onClick={() => { setError(''); chat.reload(); void session.refresh(); }} className="font-semibold underline">Làm mới</button></div>}
    <div className="flex min-h-0 flex-1">
      <ConversationSidebar conversations={visible} unreadTotal={session.conversations.reduce((total, item) => total + item.unread_count, 0)} selectedId={selectedId} loading={!session.actor && !session.error} searchTerm={search} filter={filter} onFilterChange={setFilter} onSearchChange={setSearch} onRefresh={() => void session.refresh()} onSelect={setSelectedId} />
      <ChatWorkspace conversation={selected} actor={session.actor} messages={chat.messages} loading={chat.loading} hasMore={chat.hasMore} connected={chat.connected} typing={chat.typing} staff={staff} busy={busy} onBack={() => setSelectedId(null)} onManage={manage} onSend={chat.send} onTyping={chat.sendTyping} onLoadMore={() => void chat.loadMore()} onRetry={chat.retry} onVisible={chat.markRead} />
    </div>
  </div>;
}
