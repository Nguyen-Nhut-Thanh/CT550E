"use client";

import { useAdminContentReadOnly } from "@/components/common/admin_shared/guards/AdminContentPermission";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { ImageUpload } from "@/components/common/form_controls/ImageUpload";
import { Image as ImageIcon, Loader2, Save, Sparkles, Tag } from "lucide-react";
import type { PostEditorSidebarProps as Props } from "shared";
import { slugify } from "shared";
import { PostTagsInput } from "@/components/posts/post_editor/AdminPostTagsInput";
import { PostEditorCard } from "@/components/posts/post_editor/AdminPostEditorCard";

export function PostEditorSidebar({
  isNew,
  saving,
  categories,
  form,
  onSave,
  onCancel,
  onFormChange,
}: Props) {
  const readOnly = useAdminContentReadOnly();
  return (
    <aside
      className="flex min-w-0 flex-col gap-[22px] lg:self-stretch"
      aria-label="Hình ảnh, phân loại và xuất bản bài viết"
    >
      {/* Card 1: Ảnh bìa */}
      <PostEditorCard
        id="post-media"
        title="Ảnh bìa đại diện"
        description="Ảnh đại diện hiển thị cho bài viết trên website."
        icon={ImageIcon}
      >
        <div className="space-y-3.5">
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
      </PostEditorCard>

      {/* Card 2: Phân loại & Trạng thái */}
      <PostEditorCard
        id="post-classification"
        title="Phân loại & Trạng thái"
        description="Chọn danh mục và chế độ xuất bản."
        icon={Tag}
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
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

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              Trạng thái xuất bản
            </label>
            <div className="flex gap-1.5 rounded-xl border border-[#dfe6f1] bg-[#f8faff] p-1">
              <button
                type="button"
                onClick={() => onFormChange((prev) => ({ ...prev, status: 1 }))}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                  form.status === 1
                    ? "bg-white text-emerald-700 shadow-2xs border border-emerald-100"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Công khai
              </button>
              <button
                type="button"
                onClick={() => onFormChange((prev) => ({ ...prev, status: 0 }))}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                  form.status === 0
                    ? "bg-white text-slate-700 shadow-2xs border border-slate-200"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Bản nháp
              </button>
            </div>
          </div>
        </div>
      </PostEditorCard>

      {/* Card 3: Thông tin bổ sung & Nút Lưu (Cố định khi cuộn tới) */}
      <div className="lg:sticky lg:top-4 lg:z-10">
        <PostEditorCard
          id="post-publish"
          title="Thông tin xuất bản"
          description="Tác giả, thẻ gắn và liên kết trang."
          icon={Sparkles}
          className="shadow-[0_4px_16px_#3869a712]"
        >
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Tên tác giả hiển thị
              </label>
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
                className="w-full rounded-[11px] border border-[#dfe6f1] bg-[#f8faff] px-3 py-2 text-xs sm:text-sm text-slate-800 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_3px_#e8f1ff]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Thẻ bài viết
              </label>
              <PostTagsInput
                value={form.tags}
                onChange={(tags) =>
                  onFormChange((previous) => ({ ...previous, tags }))
                }
              />
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-600">Đường dẫn bài viết</p>
              <p className="break-all rounded-lg border border-[#e1edfc] bg-slate-50/80 p-2 text-slate-600 font-mono text-[11px]">
                /blog/{form.slug || slugify(form.title) || "tieu-de-bai-viet"}
              </p>
              <p className="leading-relaxed text-slate-400 text-[11px]">
                Ngày xuất bản được ghi khi công khai lần đầu. Thời gian đọc tự
                tính theo nội dung.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={onSave}
                disabled={readOnly || saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                {form.status === 0
                  ? "Lưu bản nháp"
                  : isNew
                    ? "Đăng bài viết"
                    : "Lưu thay đổi"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full rounded-xl border border-[#e1edfc] bg-white py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 transition hover:bg-slate-50 cursor-pointer"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </PostEditorCard>
      </div>
    </aside>
  );
}
