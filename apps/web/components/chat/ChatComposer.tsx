"use client";

import { chatApi } from "@/lib/chat/api";
import { ImagePlus, LoaderCircle, Map, Paperclip, SendHorizontal, Smile, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { ChatComposerProps, PendingImage } from "shared";

const emojis = ["😊", "❤️", "👍", "👋", "✨", "🎉", "🙏", "✈️"];

export function ChatComposer({
  disabled,
  placeholder = "Nhắn tin…",
  onSend,
  onTyping,
  onShareTour,
}: ChatComposerProps) {
  const [input, setInput] = useState("");
  const [image, setImage] = useState<PendingImage | null>(null);
  const [uploaded, setUploaded] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [menu, setMenu] = useState<"attachments" | "emoji" | null>(null);
  const menuId = useId();
  const root = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const attachmentButton = useRef<HTMLButtonElement>(null);
  const emojiButton = useRef<HTMLButtonElement>(null);
  const sending = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(112, Math.max(36, textarea.scrollHeight))}px`;
  }, [input]);
  useEffect(() => () => { if (image) URL.revokeObjectURL(image.previewUrl); }, [image]);
  useEffect(() => {
    if (!menu) return;
    menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const dismiss = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setMenu(null);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [menu]);
  useEffect(() => { if (disabled || busy) setMenu(null); }, [disabled, busy]);

  const selectImage = (file: File) => {
    if (disabled || sending.current) return;
    setMenu(null);
    if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Chọn ảnh JPG, PNG, GIF hoặc WebP tối đa 5 MB");
      return;
    }
    setError("");
    setImage({ file, previewUrl: URL.createObjectURL(file) });
    setUploaded("");
    inputRef.current?.focus();
  };

  const send = async () => {
    if (disabled || sending.current || (!input.trim() && !image)) return;
    sending.current = true;
    setBusy(true);
    setMenu(null);
    setError("");
    onTyping(false);
    try {
      if (image) {
        const url = uploaded || (await chatApi.upload(image.file));
        setUploaded(url);
        await onSend(url, "IMAGE");
        setImage(null);
        setUploaded("");
      }
      if (input.trim()) {
        await onSend(input.trim(), "TEXT");
        setInput("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không gửi được, hãy thử lại");
    } finally {
      sending.current = false;
      setBusy(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  return (
    <div ref={root} onKeyDown={event => {
      if (event.key === "Escape" && menu) {
        event.preventDefault();
        event.stopPropagation();
        (menu === "attachments" ? attachmentButton : emojiButton).current?.focus();
        setMenu(null);
      }
    }} className="relative shrink-0 rounded-t-2xl border-t border-blue-100/70 bg-white px-2.5 py-2 shadow-[0_-8px_28px_-16px_#b1d3f4]">
      {image && (
        <div className="mb-3 flex items-center gap-3 rounded-2xl border border-blue-100 bg-sky-50/60 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.previewUrl} alt="Ảnh chuẩn bị gửi" className="h-14 w-16 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium text-blue-950">{image.file.name}</p><p className="mt-1 text-[11px] text-slate-500">Ảnh sẽ được gửi khi bạn nhấn nút gửi.</p></div>
          <button type="button" disabled={busy} aria-label="Bỏ ảnh" onClick={() => { setImage(null); setUploaded(""); }} className="rounded-full p-2 text-slate-500 hover:bg-blue-100"><X size={16} /></button>
        </div>
      )}
      {error && <p role="alert" className="mb-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</p>}
      {menu && (
        <div ref={menuRef} id={menuId} role="dialog" aria-label={menu === "attachments" ? "Đính kèm tin nhắn" : "Chọn biểu cảm"} className={`absolute bottom-full z-20 mb-2 rounded-2xl border border-blue-100 bg-white p-2 shadow-xl ${menu === "attachments" ? "left-3 w-60" : "right-3 grid w-56 grid-cols-4 gap-1"}`}>
          {menu === "attachments" ? <>
            <button type="button" onClick={() => { setMenu(null); fileRef.current?.click(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-blue-950 hover:bg-sky-50"><span className="rounded-xl bg-sky-100 p-2 text-blue-600"><ImagePlus size={18} /></span><span>Tải ảnh lên<span className="mt-0.5 block text-[11px] text-slate-500">JPG, PNG, GIF, WebP · tối đa 5 MB</span></span></button>
            {onShareTour && <button type="button" onClick={() => { setMenu(null); attachmentButton.current?.focus(); onShareTour(); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-blue-950 hover:bg-sky-50"><span className="rounded-xl bg-indigo-50 p-2 text-indigo-500"><Map size={18} /></span><span>Gửi tour nhờ tư vấn<span className="mt-0.5 block text-[11px] text-slate-500">Tìm và chia sẻ tour bạn quan tâm</span></span></button>}
          </> : emojis.map(emoji => <button key={emoji} type="button" aria-label={`Thêm ${emoji}`} onClick={() => {
            const textarea = inputRef.current;
            const start = textarea?.selectionStart ?? input.length;
            const end = textarea?.selectionEnd ?? start;
            const next = input.slice(0, start) + emoji + input.slice(end);
            if (next.length > 4000) return;
            setInput(next); onTyping(true); setMenu(null);
            requestAnimationFrame(() => { textarea?.focus(); textarea?.setSelectionRange(start + emoji.length, start + emoji.length); });
          }} className="rounded-xl p-2 text-xl hover:bg-sky-50">{emoji}</button>)}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" aria-label="Chọn ảnh đính kèm" className="hidden" onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) selectImage(file); }} />
        <button ref={attachmentButton} type="button" disabled={disabled || busy} aria-label="Đính kèm ảnh hoặc tour" aria-haspopup="dialog" aria-expanded={menu === "attachments"} aria-controls={menu === "attachments" ? menuId : undefined} onClick={() => setMenu(menu === "attachments" ? null : "attachments")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-white text-[#547aa7] shadow-sm transition hover:bg-sky-50 disabled:opacity-40"><Paperclip size={18} /></button>
        <div className="flex min-w-0 flex-1 items-center rounded-3xl border border-blue-100 bg-white pl-1 pr-1 shadow-[0_2px_12px_-6px_#b4d6ff] focus-within:ring-2 focus-within:ring-blue-200">
          <textarea ref={inputRef} rows={1} maxLength={4000} value={input} disabled={disabled || busy} aria-label="Nội dung tin nhắn" title="Enter để gửi · Shift + Enter để xuống dòng" placeholder={placeholder} className="h-9 max-h-28 min-h-9 min-w-0 flex-1 resize-none rounded-3xl bg-transparent px-2 py-2 text-[13px] leading-5 text-slate-700 outline-none placeholder:text-slate-400 disabled:opacity-50" onFocus={() => setMenu(null)} onChange={event => { setInput(event.target.value); onTyping(Boolean(event.target.value.trim())); }} onBlur={() => onTyping(false)} onPaste={event => { const file = Array.from(event.clipboardData.files).find(item => item.type.startsWith("image/")); if (file) { event.preventDefault(); selectImage(file); } }} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(); } }} />
          <button ref={emojiButton} type="button" disabled={disabled || busy} aria-label="Chọn biểu cảm" aria-haspopup="dialog" aria-expanded={menu === "emoji"} aria-controls={menu === "emoji" ? menuId : undefined} onClick={() => setMenu(menu === "emoji" ? null : "emoji")} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-sky-50 disabled:opacity-40"><Smile size={18} /></button>
        </div>
        <button type="button" disabled={disabled || busy || (!input.trim() && !image)} onClick={() => void send()} aria-label={busy ? "Đang gửi tin nhắn" : "Gửi tin nhắn"} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-[0_4px_12px_-4px_#2385ff] transition hover:brightness-105 disabled:opacity-40">{busy ? <LoaderCircle size={18} className="animate-spin" /> : <SendHorizontal size={19} />}</button>
      </div>
    </div>
  );
}
