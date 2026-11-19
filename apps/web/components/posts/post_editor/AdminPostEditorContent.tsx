"use client";

import { AlignLeft, Type } from "lucide-react";
import type { PostEditorContentProps as Props } from "shared";
import { PostBlockEditor } from "@/components/posts/post_editor/AdminPostBlockEditor";
import { PostEditorCard } from "@/components/posts/post_editor/AdminPostEditorCard";
import { articleText } from "shared";

export function PostEditorContent({ form, onFormChange }: Props) {
  return (
    <div className="flex min-w-0 flex-col gap-[22px]">
      {/* Card 1: Thông tin cơ bản */}
      <PostEditorCard
        id="post-basic-info"
        title="Thông tin cơ bản"
        description="Tiêu đề và tóm tắt giới thiệu bài viết."
        icon={Type}
      >
        <div className="space-y-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              Tiêu đề bài viết <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Type className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                aria-label="Tiêu đề bài viết"
                maxLength={255}
                type="text"
                className="w-full rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] py-2.5 pl-10 pr-4 text-sm font-bold text-slate-900 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_#e8f1ff]"
                placeholder="Ví dụ: Kinh nghiệm du lịch Đà Lạt tự túc 2026"
                value={form.title}
                onChange={(event) =>
                  onFormChange((prev) => ({ ...prev, title: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              Tóm tắt ngắn
            </label>
            <div className="relative">
              <AlignLeft className="pointer-events-none absolute left-3 top-3 text-slate-400" size={17} />
              <textarea
                aria-label="Tóm tắt ngắn"
                className="min-h-[96px] w-full resize-none rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] py-2.5 pl-10 pr-4 text-xs sm:text-sm text-slate-800 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_#e8f1ff]"
                placeholder="Mô tả ngắn gọn về bài viết (hiển thị ở trang danh sách và thẻ xem trước)..."
                value={form.summary}
                onChange={(event) =>
                  onFormChange((prev) => ({ ...prev, summary: event.target.value }))
                }
              />
            </div>
          </div>
        </div>
      </PostEditorCard>

      {/* Card 2: Nội dung bài viết */}
      <PostEditorCard
        id="post-content"
        title="Nội dung bài viết"
        description="Điền nội dung theo từng khối (đoạn văn, ảnh, lưu ý, nút kêu gọi...)."
        icon={AlignLeft}
      >
        <PostBlockEditor
          value={form.content_blocks}
          onChange={(content_blocks) =>
            onFormChange((previous) => ({
              ...previous,
              content_blocks,
              content: articleText(content_blocks),
            }))
          }
        />
      </PostEditorCard>
    </div>
  );
}
