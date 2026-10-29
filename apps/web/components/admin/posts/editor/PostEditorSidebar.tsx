"use client";

import CustomDropdown from "@/components/common/forms/CustomDropdown";

import { ImageUpload } from "@/components/common/forms/ImageUpload";
import { Loader2, Save } from "lucide-react";
import type { PostEditorSidebarProps as Props } from "shared";
import { slugify } from "shared";
import { PostTagsInput } from "./PostTagsInput";

export function PostEditorSidebar({
  isNew,
  saving,
  categories,
  form,
  onSave,
  onCancel,
  onFormChange,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
          Ảnh bìa · dùng làm ảnh đại diện
        </label>
        <ImageUpload
          endpoint="/admin/posts/upload-image"
          value={form.thumbnail}
          onChange={(url) =>
            onFormChange((prev) => ({
              ...prev,
              thumbnail: Array.isArray(url) ? url[0] || "" : url,
            }))
          }
        />
        <div>
          <CustomDropdown
            label="Vị trí căn ảnh bìa"
            variant="compact"
            matchTriggerWidth
            selectedValue={form.cover_position}
            onSelect={(value) =>
              onFormChange((previous) => ({
                ...previous,
                cover_position: value as typeof form.cover_position,
              }))
            }
            options={[
              { value: "top", label: "Phía trên" },
              { value: "center", label: "Ở giữa" },
              { value: "bottom", label: "Phía dưới" },
            ]}
          />
        </div>
      </div>

      <div className="space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <CustomDropdown
            label="Danh mục"
            placeholder="Chọn danh mục"
            variant="compact"
            matchTriggerWidth
            selectedValue={form.category_id}
            onSelect={(value) =>
              onFormChange((previous) => ({ ...previous, category_id: value }))
            }
            options={[
              { value: "", label: "-- Chọn danh mục --" },
              ...categories.map((category) => ({
                value: String(category.category_id),
                label: category.name,
              })),
            ]}
          />
          {categories.length === 0 && (
            <p className="text-xs leading-5 text-amber-700">
              Bấm “Thêm / quản lý danh mục” ở phía trên để tạo danh mục trước
              khi đăng bài.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Trạng thái
          </label>
          <div className="flex gap-2 rounded-xl border border-slate-100 bg-slate-50 p-1">
            <button
              onClick={() => onFormChange((prev) => ({ ...prev, status: 1 }))}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${form.status === 1 ? "bg-white text-green-600 shadow-sm" : "text-slate-400"}`}
            >
              Công khai
            </button>
            <button
              onClick={() => onFormChange((prev) => ({ ...prev, status: 0 }))}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${form.status === 0 ? "bg-white text-slate-600 shadow-sm" : "text-slate-400"}`}
            >
              Bản nháp
            </button>
          </div>
        </div>
      </div>

      <div className="ui-post-editor-sidebar-publishPanel flex flex-col gap-[24px] min-[1024px]:sticky min-[1024px]:top-[16px] min-[1024px]:max-h-[calc(100dvh_-_32px)]">
        <div className="ui-post-editor-sidebar-publishDetails min-[1024px]:min-h-0 min-[1024px]:overflow-y-auto space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <label className="block space-y-2 text-xs font-semibold text-slate-600">
            <span>Tên tác giả hiển thị</span>
            <input
              aria-label="Tên tác giả hiển thị"
              maxLength={150}
              value={form.author_display_name}
              onChange={(event) =>
                onFormChange((previous) => ({
                  ...previous,
                  author_display_name: event.target.value,
                }))
              }
              placeholder="Để trống để dùng tên tài khoản"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </label>
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-600">
              Thẻ bài viết
            </span>
            <PostTagsInput
              value={form.tags}
              onChange={(tags) =>
                onFormChange((previous) => ({ ...previous, tags }))
              }
            />
          </div>
          <div className="space-y-1 text-xs">
            <p className="font-semibold text-slate-600">Đường dẫn bài viết</p>
            <p className="break-all rounded-lg bg-slate-50 p-2 text-slate-500">
              /blog/{form.slug || slugify(form.title) || "tieu-de-bai-viet"}
            </p>
            <p className="leading-5 text-slate-400">
              Ngày xuất bản được ghi khi công khai lần đầu. Thời gian đọc tự
              tính theo nội dung.
            </p>
          </div>
        </div>
        <div className="ui-post-editor-sidebar-publishActions shrink-0 flex flex-col gap-3">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 text-[13px] font-black uppercase tracking-widest text-white shadow-xl shadow-blue-100 transition-all hover:bg-blue-700"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {form.status === 0
              ? "Lưu bản nháp"
              : isNew
                ? "Đăng bài viết"
                : "Lưu thay đổi"}
          </button>
          <button
            onClick={onCancel}
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
}
