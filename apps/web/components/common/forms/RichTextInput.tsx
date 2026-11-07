"use client";

import { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Link2, List, ListOrdered, Redo2, Undo2 } from 'lucide-react';
import { isArticleUrl } from 'shared';
import { escapeRichText, richTextNodeToText, richTextToHtml } from '@/lib/utils/richText';

export function RichTextInput({ value, onChange, label = 'Đoạn văn', placeholder, disabled = false, extended = false, compact = false, fillHeight = false, editorClassName = '' }: {
  value: string; onChange: (value: string) => void; label?: string; placeholder?: string;
  disabled?: boolean; extended?: boolean; compact?: boolean; fillHeight?: boolean; editorClassName?: string;
}) {
  const editor = useRef<HTMLDivElement>(null);
  const last = useRef<string | null>(null);
  const range = useRef<Range | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    if (editor.current && value !== last.current) {
      editor.current.innerHTML = richTextToHtml(value);
      last.current = value;
    }
  }, [value]);
  function save() {
    if (!editor.current || disabled) return;
    const text = Array.from(editor.current.childNodes).map(richTextNodeToText).join('').replace(/\u00a0/g, ' ').replace(/^\n/, '').replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '');
    last.current = text;
    onChange(text);
  }
  function rememberSelection() {
    const selection = window.getSelection();
    if (selection?.rangeCount && editor.current?.contains(selection.anchorNode)) range.current = selection.getRangeAt(0).cloneRange();
  }
  function format(command: string, parameter?: string) {
    if (disabled) return;
    editor.current?.focus();
    if (command === 'createLink' && range.current && editor.current?.contains(range.current.commonAncestorContainer)) {
      const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range.current);
    }
    if (command === 'createLink' && window.getSelection()?.isCollapsed && parameter) {
      document.execCommand('insertHTML', false, `<a href="${escapeRichText(parameter)}">${escapeRichText(parameter)}</a>`);
    } else document.execCommand(command, false, parameter);
    save(); rememberSelection();
  }
  const buttonClass = `rounded-lg text-[#52627e] transition-colors hover:bg-blue-100 hover:text-blue-600 focus-visible:outline-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-40 ${compact ? 'p-1.5' : 'p-2'}`;
  return <div className={`overflow-hidden rounded-[11px] border border-[#d9e3f1] bg-white focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-50 ${fillHeight ? 'lg:flex lg:min-h-0 lg:flex-1 lg:flex-col' : ''}`}>
    <div role="toolbar" aria-label={`Định dạng ${label}`} className={`flex shrink-0 flex-wrap items-center gap-1 border-b border-[#e4ebf5] bg-[#f8faff] px-2 ${compact ? 'py-1.5' : 'py-2'}`}>
      <button type="button" disabled={disabled} aria-label="In đậm" title="In đậm" onMouseDown={event => event.preventDefault()} onClick={() => format('bold')} className={buttonClass}><Bold size={17} /></button>
      <button type="button" disabled={disabled} aria-label="In nghiêng" title="In nghiêng" onMouseDown={event => event.preventDefault()} onClick={() => format('italic')} className={buttonClass}><Italic size={17} /></button>
      {extended && <><span aria-hidden="true" className="mx-1 h-5 w-px bg-[#e1e8f2]" /><button type="button" disabled={disabled} aria-label="Danh sách dấu đầu dòng" title="Danh sách dấu đầu dòng" onMouseDown={event => event.preventDefault()} onClick={() => format('insertUnorderedList')} className={buttonClass}><List size={18} /></button><button type="button" disabled={disabled} aria-label="Danh sách đánh số" title="Danh sách đánh số" onMouseDown={event => event.preventDefault()} onClick={() => format('insertOrderedList')} className={buttonClass}><ListOrdered size={18} /></button><span aria-hidden="true" className="mx-1 h-5 w-px bg-[#e1e8f2]" /></>}
      <button type="button" disabled={disabled} aria-label="Chèn liên kết" title="Chèn liên kết" onMouseDown={event => event.preventDefault()} onClick={() => { rememberSelection(); setLinkOpen(previous => !previous); setError(''); }} className={buttonClass}><Link2 size={17} /></button>
      {extended && <div className="ml-auto flex items-center gap-1"><button type="button" disabled={disabled} aria-label="Hoàn tác" title="Hoàn tác" onMouseDown={event => event.preventDefault()} onClick={() => format('undo')} className={buttonClass}><Undo2 size={17} /></button><button type="button" disabled={disabled} aria-label="Làm lại" title="Làm lại" onMouseDown={event => event.preventDefault()} onClick={() => format('redo')} className={buttonClass}><Redo2 size={17} /></button></div>}
    </div>
    {linkOpen && <div className="space-y-2 border-b border-blue-100 bg-blue-50/70 p-3"><div className="flex flex-wrap gap-2"><input type="url" aria-label="Địa chỉ liên kết" disabled={disabled} value={url} onChange={event => setUrl(event.target.value)} placeholder="https://... hoặc /tours" className="min-w-0 flex-1 rounded-lg border border-[#d9e3f1] bg-white px-3 py-2 text-[13px] outline-none focus:border-blue-400" /><button type="button" disabled={disabled} onClick={() => { const address = url.trim(); if (!isArticleUrl(address)) { setError('Vui lòng nhập liên kết hợp lệ.'); return; } format('createLink', address); setLinkOpen(false); setUrl(''); setError(''); }} className="rounded-lg bg-blue-600 px-3 py-2 text-[12px] font-semibold text-white">Gắn liên kết</button></div>{error && <p role="alert" className="text-[12px] text-rose-600">{error}</p>}</div>}
    <div className={`relative ${fillHeight ? 'lg:min-h-0 lg:flex-1 lg:overflow-hidden' : ''}`}>
      {!value.trim() && placeholder && <p aria-hidden="true" className={`pointer-events-none absolute text-[13px] leading-6 text-[#a0adbf] ${compact ? 'left-4 right-4 top-3' : 'left-5 right-5 top-4'}`}>{placeholder}</p>}
      <div ref={editor} contentEditable={!disabled} suppressContentEditableWarning role="textbox" aria-label={label} aria-multiline="true" aria-disabled={disabled} onInput={save} onBlur={save} onKeyUp={rememberSelection} onMouseUp={rememberSelection} onPaste={event => { event.preventDefault(); if (!disabled) { document.execCommand('insertText', false, event.clipboardData.getData('text/plain')); save(); } }} className={`min-h-36 whitespace-pre-wrap break-words text-[#26324e] outline-none [&_a]:text-blue-600 [&_a]:underline [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 ${compact ? 'px-4 py-3 text-[13px] leading-6' : 'px-5 py-4 text-[14px] leading-7'} ${fillHeight ? 'lg:h-full lg:min-h-0 lg:overflow-y-auto' : ''} ${editorClassName}`} />
    </div>
  </div>;
}
