"use client";

import { useToast } from '@/components/common/Toast';
import { useChatSession } from '@/lib/client/hooks/useChatSession';
import { getSocket } from '@/lib/socket';
import { MessageCircle, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { ChatUpdate } from 'shared';

export function ChatInboxNotification() {
  const session = useChatSession();
  const pathname = usePathname();
  const { info } = useToast();
  const [sound, setSound] = useState(false);
  const lastNotice = useRef(new Map<number, number>());
  const audio = useRef<AudioContext | null>(null);
  useEffect(() => () => { void audio.current?.close(); }, []);
  useEffect(() => {
    if (!session.token || !session.actor?.isStaff) return;
    const socket = getSocket(session.token);
    const update = (event: ChatUpdate) => {
      if (event.sender_role !== 'USER' || Date.now() - (lastNotice.current.get(event.conversation_id) ?? 0) < 3000) return;
      lastNotice.current.set(event.conversation_id, Date.now());
      if (!pathname.startsWith('/admin/chats') || document.visibilityState !== 'visible') info('Có tin nhắn tư vấn mới từ khách hàng');
      if (sound && audio.current) {
        const ctx = audio.current;
        const oscillator = ctx.createOscillator(); const gain = ctx.createGain();
        oscillator.connect(gain); gain.connect(ctx.destination);
        oscillator.frequency.value = 660; gain.gain.setValueAtTime(0.06, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        oscillator.start(); oscillator.stop(ctx.currentTime + 0.15);
      }
    };
    socket.on('chat:conversation:updated', update);
    return () => { socket.off('chat:conversation:updated', update); };
  }, [session.token, session.actor, pathname, sound, info]);
  const unread = session.conversations.reduce((total, item) => total + item.unread_count, 0);
  return <div className="flex items-center gap-1">
    <Link href="/admin/chats" aria-label={`Hộp thư tư vấn, ${unread} tin chưa đọc`} className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100"><MessageCircle size={20} />{unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px] text-white">{unread > 99 ? '99+' : unread}</span>}</Link>
    <button type="button" aria-label={sound ? 'Tắt âm báo chat' : 'Bật âm báo chat'} aria-pressed={sound} className="rounded-full p-2 text-slate-400 hover:bg-slate-100" onClick={() => {
      if (!sound) { audio.current ??= new AudioContext(); void audio.current.resume(); }
      setSound(value => !value);
    }}>{sound ? <Volume2 size={16} /> : <VolumeX size={16} />}</button>
  </div>;
}
