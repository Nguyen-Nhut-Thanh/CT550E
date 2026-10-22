"use client";

import { chatApi } from '@/lib/chatApi';
import { ImagePlus, SendHorizontal, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChatComposerProps, PendingImage } from 'shared';

export function ChatComposer({ disabled, placeholder = 'Nhắn cho nhân viên tư vấn…', onSend, onTyping }: ChatComposerProps) {
  const [input, setInput] = useState('');
  const [image, setImage] = useState<PendingImage | null>(null);
  const [uploaded, setUploaded] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => () => { if (image) URL.revokeObjectURL(image.previewUrl); }, [image]);

  const send = async () => {
    if (disabled || busy || (!input.trim() && !image)) return;
    setBusy(true); setError(''); onTyping(false);
    try {
      if (image) {
        const url = uploaded || await chatApi.upload(image.file);
        setUploaded(url);
        await onSend(url, 'IMAGE'); setImage(null); setUploaded('');
      }
      if (input.trim()) { await onSend(input.trim(), 'TEXT'); setInput(''); }
      inputRef.current?.focus();
    } catch (e) { setError(e instanceof Error ? e.message : 'Không gửi được, hãy thử lại'); }
    finally { setBusy(false); }
  };

  return <div className="border-t border-slate-200 bg-white p-3">
    {image && <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.previewUrl} alt="Ảnh chuẩn bị gửi" className="h-16 w-20 rounded-lg object-cover" />
      <span className="min-w-0 flex-1 truncate text-xs">{image.file.name}</span>
      <button type="button" disabled={busy} aria-label="Bỏ ảnh" onClick={() => { setImage(null); setUploaded(''); }}><X size={18} /></button>
    </div>}
    {error && <p role="alert" className="mb-2 text-xs text-red-600">{error}</p>}
    <div className="flex items-end gap-2">
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={event => {
        const file = event.target.files?.[0]; event.target.value = '';
        if (!file) return;
        if (!['image/jpeg','image/png','image/gif','image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError('Chọn ảnh JPG, PNG, GIF hoặc WebP tối đa 5 MB'); return; }
        setError(''); setImage({ file, previewUrl: URL.createObjectURL(file) }); setUploaded('');
      }} />
      <button type="button" disabled={disabled || busy} aria-label="Gửi ảnh" onClick={() => fileRef.current?.click()} className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40"><ImagePlus size={20} /></button>
      <textarea ref={inputRef} rows={2} maxLength={4000} value={input} disabled={disabled || busy} aria-label="Nội dung tin nhắn" placeholder={placeholder} className="max-h-32 min-h-12 flex-1 resize-none rounded-xl bg-slate-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50" onChange={event => { setInput(event.target.value); onTyping(Boolean(event.target.value.trim())); }} onBlur={() => onTyping(false)} onKeyDown={event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); }
      }} />
      <button type="button" disabled={disabled || busy || (!input.trim() && !image)} onClick={() => void send()} aria-label="Gửi tin nhắn" className="rounded-xl bg-blue-600 p-3 text-white hover:bg-blue-700 disabled:opacity-40">{busy ? <span className="text-xs">Đang gửi</span> : <SendHorizontal size={19} />}</button>
    </div>
    <p className="mt-1 pl-12 text-[10px] text-slate-400">Enter để gửi · Shift + Enter để xuống dòng</p>
  </div>;
}
