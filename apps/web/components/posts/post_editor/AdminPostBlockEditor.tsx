"use client";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  articleText,
  createArticleBlock,
  createDestinationTemplate,
  type ArticleBlock,
  type ArticleDocument,
} from "shared";
import { PostBlockFields } from "@/components/posts/post_editor/AdminPostBlockFields";

const names: Record<ArticleBlock["type"], string> = {
  paragraph: "Đoạn văn",
  heading: "Tiêu đề mục",
  image: "Ảnh",
  experiences: "Nhóm trải nghiệm",
  callout: "Lưu ý / mẹo du lịch",
  list: "Danh sách",
  cta: "Nút hành động",
};
export function PostBlockEditor({
  value,
  onChange,
}: {
  value: ArticleDocument;
  onChange: (value: ArticleDocument) => void;
}) {
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [templateConfirm, setTemplateConfirm] = useState(false);
  function update(blocks: ArticleBlock[]) {
    onChange({ version: 1, blocks });
  }
  function move(index: number, step: number) {
    const blocks = [...value.blocks];
    [blocks[index], blocks[index + step]] = [
      blocks[index + step],
      blocks[index],
    ];
    update(blocks);
  }
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900">Nội dung bài viết</h2>
          <p className="mt-1 text-xs text-slate-500">
            Điền nội dung theo từng khối. Các khối trống sẽ được bỏ qua khi hiển
            thị.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (value.blocks.length) setTemplateConfirm(true);
            else onChange(createDestinationTemplate());
          }}
          className="rounded-lg border border-[#e1edfc] bg-blue-50/70 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-100 cursor-pointer"
        >
          Dùng mẫu giới thiệu điểm đến
        </button>
      </div>
      {templateConfirm && (
        <div
          role="alert"
          className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900"
        >
          <p>
            Áp dụng mẫu sẽ thay nội dung các khối đang soạn. Thông tin đầu bài
            và ảnh bìa được giữ nguyên.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                onChange(createDestinationTemplate());
                setCollapsed([]);
                setTemplateConfirm(false);
              }}
              className="font-bold underline cursor-pointer"
            >
              Thay bằng mẫu
            </button>
            <button
              type="button"
              onClick={() => setTemplateConfirm(false)}
              className="underline cursor-pointer"
            >
              Giữ nội dung hiện tại
            </button>
          </div>
        </div>
      )}
      {value.blocks.map((block, index) => (
        <section
          key={block.id}
          className="overflow-hidden rounded-xl border border-[#e1edfc] bg-white shadow-2xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e1edfc] bg-slate-50/70 px-3.5 py-2.5">
            <button
              type="button"
              aria-expanded={!collapsed.includes(block.id)}
              onClick={() =>
                setCollapsed((previous) =>
                  previous.includes(block.id)
                    ? previous.filter((id) => id !== block.id)
                    : [...previous, block.id],
                )
              }
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 cursor-pointer"
            >
              <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                {String(index + 1).padStart(2, "0")}
              </span>
              {names[block.type]}
              {collapsed.includes(block.id) ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronUp size={14} />
              )}
            </button>
            <div className="flex gap-1">
              {[
                {
                  label: "Di chuyển lên",
                  Icon: ArrowUp,
                  disabled: index === 0,
                  action: () => move(index, -1),
                },
                {
                  label: "Di chuyển xuống",
                  Icon: ArrowDown,
                  disabled: index === value.blocks.length - 1,
                  action: () => move(index, 1),
                },
                {
                  label: "Nhân bản khối",
                  Icon: Copy,
                  disabled: value.blocks.length >= 80,
                  action: () => {
                    const copy = {
                      ...structuredClone(block),
                      id: crypto.randomUUID(),
                    };
                    update([
                      ...value.blocks.slice(0, index + 1),
                      copy,
                      ...value.blocks.slice(index + 1),
                    ]);
                  },
                },
                {
                  label: "Xóa khối",
                  Icon: Trash2,
                  disabled: false,
                  action: () =>
                    update(value.blocks.filter((item) => item.id !== block.id)),
                },
              ].map((action) => (
                <button
                  type="button"
                  key={action.label}
                  aria-label={`${action.label} ${index + 1}`}
                  title={action.label}
                  disabled={action.disabled}
                  onClick={action.action}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-blue-600 disabled:opacity-25 cursor-pointer"
                >
                  <action.Icon size={14} />
                </button>
              ))}
            </div>
          </div>
          {!collapsed.includes(block.id) && (
            <div className="p-3.5 sm:p-4">
              <PostBlockFields
                block={block}
                onChange={(next) =>
                  update(
                    value.blocks.map((item) =>
                      item.id === block.id ? next : item,
                    ),
                  )
                }
              />
            </div>
          )}
        </section>
      ))}
      <div className="space-y-2.5 rounded-xl border-2 border-dashed border-[#e1edfc] bg-[#f8fbff] p-4">
        <h3 className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
          <Plus size={15} className="text-blue-600" />
          Thêm khối nội dung
        </h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(names) as ArticleBlock["type"][]).map((type) => (
            <button
              type="button"
              key={type}
              disabled={value.blocks.length >= 80}
              onClick={() =>
                update([
                  ...value.blocks,
                  createArticleBlock(type, crypto.randomUUID()),
                ])
              }
              className="rounded-lg border border-[#e1edfc] bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-30 cursor-pointer"
            >
              + {names[type]}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-400">
          {value.blocks.length}/80 khối ·{" "}
          {articleText(value).trim()
            ? articleText(value).trim().split(/\s+/).length
            : 0}{" "}
          từ ·{" "}
          {Math.max(
            1,
            Math.ceil(articleText(value).trim().split(/\s+/).length / 220),
          )}{" "}
          phút đọc
        </p>
      </div>
    </section>
  );
}
