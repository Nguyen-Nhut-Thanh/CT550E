"use client";

import { AlignLeft, Type } from "lucide-react";
import type { PostEditorContentProps as Props } from 'shared';
import { PostBlockEditor } from './PostBlockEditor';
import { articleText } from 'shared';

export function PostEditorContent({ form, onFormChange }: Props) {
  return (
    <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">
          Tiêu đề bài viết
        </label>
        <div className="relative">
          <Type className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            aria-label="Tiêu đề bài viết"
            maxLength={255}
            type="text"
            className="w-full rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Ví dụ: Kinh nghiệm du lịch Đà Lạt tự túc 2026"
            value={form.title}
            onChange={(event) =>
              onFormChange((prev) => ({ ...prev, title: event.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="ml-1 text-xs font-bold uppercase tracking-wider text-slate-500">
          Tóm tắt ngắn
        </label>
        <div className="relative">
          <AlignLeft className="absolute left-3 top-3 text-slate-400" size={18} />
          <textarea
            aria-label="Tóm tắt ngắn"
            className="min-h-[100px] w-full resize-none rounded-xl border border-slate-100 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
            placeholder="Mô tả ngắn gọn về bài viết (hiển thị ở trang danh sách)..."
            value={form.summary}
            onChange={(event) =>
              onFormChange((prev) => ({ ...prev, summary: event.target.value }))
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <PostBlockEditor value={form.content_blocks} onChange={content_blocks => onFormChange(previous => ({ ...previous, content_blocks, content: articleText(content_blocks) }))} />
      </div>
    </div>
  );
}
