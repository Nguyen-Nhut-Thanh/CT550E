"use client";

import { chatApi } from '@/lib/chatApi';
import { getSocket } from '@/lib/socket';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatAck, ChatActor, ChatContextInput, ChatDisplayMessage, ChatTypingEvent, ChatUpdate, RealtimeMessage, SendPayload } from 'shared';

function mergeMessages(current: ChatDisplayMessage[], incoming: ChatDisplayMessage[]) {
  const result = [...current];
  for (const message of incoming) {
    const index = result.findIndex(item => (message.message_id > 0 && item.message_id === message.message_id) || Boolean(message.client_message_id && item.client_message_id === message.client_message_id));
    if (index >= 0) result[index] = { ...result[index], ...message, is_read: result[index].is_read || message.is_read, delivery_status: message.message_id > 0 ? undefined : message.delivery_status };
    else result.push(message);
  }
  return result.sort((a, b) => a.message_id > 0 && b.message_id > 0 ? a.message_id - b.message_id : a.message_id > 0 ? -1 : b.message_id > 0 ? 1 : new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export function useChatConversation(token: string | null, actor: ChatActor | null, id: number | null) {
  const [messages, setMessages] = useState<ChatDisplayMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const messagesRef = useRef(messages); messagesRef.current = messages;
  const generation = useRef(0);
  const drafts = useRef(new Map<string, SendPayload>());
  const lastRead = useRef(0);
  const lastTyping = useRef(0);
  const loadingOlder = useRef(false);
  const resync = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    const version = ++generation.current;
    setMessages([]); messagesRef.current = []; setHasMore(false); setTyping(false); setError(''); setConnected(false);
    lastRead.current = 0; drafts.current.clear(); loadingOlder.current = false;
    if (!token || !actor || !id) { setLoading(false); return; }
    setLoading(true);
    const socket = getSocket(token);
    let typingTimer: ReturnType<typeof setTimeout>;
    let syncing = false;
    let loaded = false;
    const receive = (message: RealtimeMessage) => {
      if (message.conversation_id === id && generation.current === version) setMessages(current => mergeMessages(current, [message]));
    };
    const update = (event: ChatUpdate) => {
      if (event.conversation_id !== id || !event.read) return;
      setMessages(current => current.map(item => item.message_id <= (event.through_message_id ?? 0) && (event.reader_role === 'USER' ? item.sender_role !== 'USER' : item.sender_role === 'USER') ? { ...item, is_read: true } : item));
    };
    const remoteTyping = (event: ChatTypingEvent) => {
      if (event.conversation_id !== id || event.user_id === actor.userId) return;
      setTyping(event.is_typing); clearTimeout(typingTimer); typingTimer = setTimeout(() => setTyping(false), 3000);
    };
    const sync = async () => {
      if (syncing) return; syncing = true;
      try {
        const ack = await socket.timeout(10000).emitWithAck('chat:join', { conversation_id: id }) as ChatAck;
        if (ack.error) throw new Error(ack.error);
        if (generation.current !== version) return;
        setConnected(true);
        let latest = loaded ? Math.max(0, ...messagesRef.current.map(item => item.message_id)) : 0;
        do {
          const page = await chatApi.messages(id, latest ? `?after=${latest}` : '');
          if (generation.current !== version) return;
          setMessages(current => mergeMessages(current, page.items));
          if (!latest) { setHasMore(page.has_more); loaded = true; break; }
          if (!page.has_more || !page.next_cursor) break;
          latest = page.next_cursor;
        } while (socket.connected);
        setError('');
      } catch (e) { if (generation.current === version) setError(e instanceof Error ? e.message : 'Không tải được tin nhắn'); }
      finally { syncing = false; if (generation.current === version) setLoading(false); }
    };
    resync.current = sync;
    const offline = () => { setConnected(false); setTyping(false); };
    const failed = () => { setConnected(false); setLoading(false); setError('Chưa kết nối được chat. Đang thử lại…'); };
    socket.on('connect', sync); socket.on('disconnect', offline); socket.on('connect_error', failed);
    socket.on('chat:message', receive); socket.on('chat:typing', remoteTyping); socket.on('chat:conversation:updated', update);
    if (socket.connected) void sync();
    return () => {
      generation.current += 1; clearTimeout(typingTimer); resync.current = null;
      socket.off('connect', sync); socket.off('disconnect', offline); socket.off('connect_error', failed);
      socket.off('chat:message', receive); socket.off('chat:typing', remoteTyping); socket.off('chat:conversation:updated', update);
      socket.emit('chat:leave');
    };
  }, [token, actor, id]);

  const transmit = useCallback(async (payload: SendPayload) => {
    if (!token || !actor || !id || !connected) throw new Error('Chat đang kết nối lại, vui lòng thử sau');
    const version = generation.current;
    const draft: ChatDisplayMessage = { message_id: -Date.now(), conversation_id: id, sender_id: actor.userId, sender_role: actor.isStaff ? 'STAFF' : 'USER', message_type: payload.message_type ?? 'TEXT', content: payload.content, client_message_id: payload.client_message_id, is_read: false, created_at: new Date().toISOString(), delivery_status: 'sending' };
    drafts.current.set(payload.client_message_id!, payload);
    setMessages(current => mergeMessages(current, [draft]));
    try {
      const result = await getSocket(token).timeout(12000).emitWithAck('chat:send', payload) as ChatAck;
      if (result.error || !result.message) throw new Error(result.error || 'Chưa xác nhận được tin nhắn');
      if (version === generation.current) { setMessages(current => mergeMessages(current, [result.message!])); drafts.current.delete(payload.client_message_id!); setError(''); }
    } catch (e) {
      if (version === generation.current && messagesRef.current.some(item => item.client_message_id === payload.client_message_id && item.message_id > 0)) {
        drafts.current.delete(payload.client_message_id!);
        return;
      }
      if (version === generation.current) setMessages(current => current.map(item => item.client_message_id === payload.client_message_id && item.message_id < 0 ? { ...item, delivery_status: 'failed' } : item));
      throw new Error(e instanceof Error ? e.message : 'Gửi thất bại');
    }
  }, [token, actor, id, connected]);

  const send = useCallback(async (content: string, type: 'TEXT' | 'IMAGE' | 'CONTEXT' = 'TEXT', context?: ChatContextInput) => {
    const failed = messagesRef.current.find(item => item.delivery_status === 'failed' && item.content === content && item.message_type === type);
    const existing = failed?.client_message_id ? drafts.current.get(failed.client_message_id) : undefined;
    return transmit(existing ?? { conversation_id: id!, content, message_type: type, context, client_message_id: crypto.randomUUID() });
  }, [id, transmit]);

  const retry = useCallback((message: ChatDisplayMessage) => {
    const payload = message.client_message_id ? drafts.current.get(message.client_message_id) : undefined;
    if (payload) void transmit(payload).catch(e => setError(e.message));
  }, [transmit]);

  const loadMore = useCallback(async () => {
    if (!id || loadingOlder.current) return;
    const oldest = Math.min(...messagesRef.current.filter(item => item.message_id > 0).map(item => item.message_id));
    if (!Number.isFinite(oldest)) return;
    const version = generation.current; loadingOlder.current = true;
    try { const page = await chatApi.messages(id, `?before=${oldest}`); if (version === generation.current) { setMessages(current => mergeMessages(current, page.items)); setHasMore(page.has_more); } }
    catch (e) { if (version === generation.current) setError(e instanceof Error ? e.message : 'Không tải được lịch sử'); }
    finally { loadingOlder.current = false; }
  }, [id]);

  const markRead = useCallback((through: number) => {
    if (!token || !id || !connected || through <= lastRead.current || document.visibilityState !== 'visible' || !document.hasFocus()) return;
    const version = generation.current;
    lastRead.current = through;
    void getSocket(token).timeout(10000).emitWithAck('chat:read', { conversation_id: id, through_message_id: through }).then((ack: ChatAck) => { if (ack.error && version === generation.current) lastRead.current = 0; }).catch(() => { if (version === generation.current) lastRead.current = 0; });
  }, [token, id, connected]);

  const sendTyping = useCallback((value: boolean) => {
    if (!token || !id || !connected || (value && Date.now() - lastTyping.current < 600)) return;
    lastTyping.current = Date.now(); getSocket(token).emit('chat:typing', { conversation_id: id, is_typing: value });
  }, [token, id, connected]);
  const reload = useCallback(() => { void resync.current?.(); }, []);
  return { messages, loading, hasMore, connected, typing, error, send, retry, loadMore, markRead, sendTyping, reload };
}
