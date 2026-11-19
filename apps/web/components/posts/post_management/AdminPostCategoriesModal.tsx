"use client";

import { AdminModalShell } from "@/components/common/admin_shared/layout/AdminModalShell";
import { Loader2, Save, Tag } from "lucide-react";
import type { PostCategoriesModalProps as Props } from 'shared';

export function PostCategoriesModal({
  open,
  categories,
  newCategory,
  saving,
  onClose,
  onCreate,
  onDraftChange,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <AdminModalShell
      title="Danh mục bài viết"
      icon={<Tag size={20} />}
      onClose={onClose}
      maxWidthClassName="max-w-lg"
    >
      <div className="space-y-4 p-5">
        <div className="space-y-3 rounded-xl border border-[#e1edfc] bg-slate-50/70 p-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Thêm danh mục mới
          </p>
          <input
            type="text"
            placeholder="Tên danh mục (VD: Kinh nghiệm du lịch)"
            className="w-full rounded-lg border border-[#e1edfc] bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50"
            value={newCategory.name}
            onChange={(event) =>
              onDraftChange({ ...newCategory, name: event.target.value })
            }
          />
          <button
            onClick={onCreate}
            disabled={saving || !newCategory.name}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            Lưu danh mục
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Danh sách hiện có
          </p>
          <div className="custom-scrollbar max-h-60 space-y-1.5 overflow-y-auto pr-1">
            {categories.map((category) => (
              <div
                key={category.category_id}
                className="flex items-center justify-between rounded-lg border border-[#e1edfc] bg-white p-2.5 shadow-2xs"
              >
                <div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">{category.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {category._count?.posts || 0} bài viết
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminModalShell>
  );
}
