"use client";

import { getToken } from '@/lib/auth';
import { chatApi } from '@/lib/chatApi';
import { disconnectSocket, getSocket } from '@/lib/socket';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatActor, Conversation } from 'shared';

export function useChatSession() {
  const [token, setToken] = useState<string | null>(null);
  const [actor, setActor] = useState<ChatActor | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const request = useRef(0);
  const hadToken = useRef(false);
  const refresh = useCallback(async () => {
    const version = generation.current;
    const sequence = ++request.current;
    if (!getToken()) return;
    try {
      const [user, rows] = await Promise.all([chatApi.me(), chatApi.list()]);
      if (version !== generation.current || sequence !== request.current) return;
      setActor(previous => previous && JSON.stringify(previous) === JSON.stringify(user) ? previous : user);
      setConversations(rows); setError('');
    } catch (e) {
      if (version === generation.current && sequence === request.current) setError(e instanceof Error ? e.message : 'Không tải được hội thoại');
    }
  }, []);

  useEffect(() => {
    const auth = () => { setToken(getToken()); };
    auth(); window.addEventListener('auth-change', auth); window.addEventListener('storage', auth);
    return () => { window.removeEventListener('auth-change', auth); window.removeEventListener('storage', auth); };
  }, []);

  useEffect(() => {
    generation.current += 1; setActor(null); setConversations([]); setError('');
    if (!token) {
      if (hadToken.current) disconnectSocket();
      hadToken.current = false;
      return;
    }
    hadToken.current = true;
    const socket = getSocket(token);
    const update = () => { void refresh(); };
    socket.on('chat:conversation:updated', update); socket.on('connect', update);
    void refresh();
    return () => {
      generation.current += 1;
      socket.off('chat:conversation:updated', update); socket.off('connect', update);
    };
  }, [token, refresh]);
  return { token, actor, conversations, error, refresh };
}
