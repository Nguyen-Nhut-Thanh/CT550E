'use client';
import { useRef, useState } from 'react';
import { Bold, Heading2, ImagePlus, Italic, List, ListOrdered, Link2, Quote } from 'lucide-react';
import { ImageUpload } from '@/components/common/ImageUpload';

export function PostContentEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const selection = useRef({ start: value.length, end: value.length });
  const [imageOpen, setImageOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState('');
  const [linkError, setLinkError] = useState('');
  function insert(before: string, after = '', placeholder = '') {
    const { start, end } = selection.current;
    const text = value.slice(start, end) || placeholder;
    onChange(value.slice(0, start) + before + text + after + value.slice(end));
    requestAnimationFrame(() => { textarea.current?.focus(); textarea.current?.setSelectionRange(start + before.length, start + before.length + text.length); });
  }
  function prefix(mark: string) {
    const { start, end } = selection.current;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const nextLine = value.indexOf('\n', end);
    const lineEnd = nextLine === -1 ? value.length : nextLine;
    onChange(value.slice(0, lineStart) + value.slice(lineStart, lineEnd).split('\n').map(line => mark + line).join('\n') + value.slice(lineEnd));
    requestAnimationFrame(() => textarea.current?.focus());
  }
  const tools = [
    { label: 'Tiêu đề mục', icon: Heading2, action: () => prefix('## ') },
    { label: 'In đậm', icon: Bold, action: () => insert('**', '**', 'Nội dung in đậm') },
    { label: 'In nghiêng', icon: Italic, action: () => insert('*', '*', 'Nội dung in nghiêng') },
    { label: 'Danh sách', icon: List, action: () => prefix('- ') },
    { label: 'Danh sách đánh số', icon: ListOrdered, action: () => prefix('1. ') },
    { label: 'Trích dẫn', icon: Quote, action: () => prefix('> ') },
    { label: 'Chèn liên kết', icon: Link2, action: () => { setLinkOpen(!linkOpen); setImageOpen(false); } },
    { label: 'Chèn ảnh', icon: ImagePlus, action: () => { setImageOpen(!imageOpen); setLinkOpen(false); } },
  ];
  return <div className="overflow-hidden rounded-xl border border-slate-200">
    <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
      {tools.map(tool => <button key={tool.label} type="button" title={tool.label} aria-label={tool.label} onMouseDown={event => event.preventDefault()} onClick={tool.action} className="rounded-lg p-2 text-slate-600 hover:bg-blue-100 hover:text-blue-700 disabled:opacity-30"><tool.icon size={17} /></button>)}
    </div>
    {linkOpen && <div className="space-y-2 border-b bg-sky-50 p-4"><label className="text-xs font-semibold" htmlFor="post-link">Địa chỉ liên kết</label><input id="post-link" type="url" value={linkUrl} onChange={event => setLinkUrl(event.target.value)} placeholder="https://..." className="w-full rounded-lg border p-2 text-sm" />{linkError && <p role="alert" className="text-xs text-red-600">{linkError}</p>}<button type="button" onClick={() => {
      if (!/^(https?:\/\/|\/(?!\/))[^\s)]+$/i.test(linkUrl)) { setLinkError('Nhập địa chỉ bắt đầu bằng https:// hoặc /'); return; }
      insert('[', `](${linkUrl})`, 'Nội dung liên kết'); setLinkOpen(false); setLinkUrl(''); setLinkError('');
    }} className="rounded-lg bg-blue-600 px-3 py-2 text-xs text-white">Chèn liên kết</button></div>}
    {imageOpen && <div className="space-y-3 border-b bg-sky-50 p-4"><p className="text-xs font-semibold">Tải ảnh cho nội dung bài viết</p><ImageUpload endpoint="/admin/posts/upload-image" value={image} onChange={url => setImage(Array.isArray(url) ? url[0] || '' : url)} /><input aria-label="Chú thích ảnh" value={caption} onChange={event => setCaption(event.target.value)} placeholder="Chú thích / mô tả ảnh" className="w-full rounded-lg border p-2 text-sm" /><button type="button" disabled={!image} onClick={() => { insert(`\n\n![${caption.replace(/[\[\]\n]/g, '')}](${image})\n\n`); setImageOpen(false); setImage(''); setCaption(''); }} className="rounded-lg bg-blue-600 px-3 py-2 text-xs text-white disabled:opacity-40">Chèn vào bài</button></div>}
    <textarea ref={textarea} aria-label="Nội dung chi tiết" value={value} onChange={event => onChange(event.target.value)} onSelect={event => { selection.current = { start: event.currentTarget.selectionStart, end: event.currentTarget.selectionEnd }; }} className="min-h-[420px] w-full resize-y bg-white p-4 text-sm leading-7 text-slate-800 outline-none focus:ring-2 focus:ring-inset focus:ring-blue-200" placeholder={'Chia sẻ kinh nghiệm du lịch của bạn...\n\nDùng thanh công cụ để tạo tiêu đề mục, danh sách và chèn ảnh.'} />
    <p className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-500">{value.trim() ? value.trim().split(/\s+/).length : 0} từ · {Math.max(1, Math.ceil(value.split(/\s+/).length / 220))} phút đọc</p>
  </div>;
}
