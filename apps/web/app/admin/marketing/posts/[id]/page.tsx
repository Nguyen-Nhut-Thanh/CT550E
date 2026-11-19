"use client";

import { PostEditorContent } from "@/components/posts/post_editor/AdminPostEditorContent";
import { PostEditorSidebar } from "@/components/posts/post_editor/AdminPostEditorSidebar";
import { AdminPageHeader } from "@/components/common/admin_shared/layout/AdminPageHeader";
import {
  createAdminPostCategory,
  getAdminPostCategories,
  saveAdminPost,
} from "@/lib/posts/admin/api";
import { requestAdminJson } from "@/lib/http/requestAdminJson";
import { PostCategoriesModal } from "@/components/posts/post_management/AdminPostCategoriesModal";
import {
  buildPostEditorForm,
  createDefaultPostEditorForm,
} from "@/lib/posts/admin/forms";
import { useToast } from "@/lib/notifications/useToast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import type {
  PostCategory,
  PostCategoryDraft,
  PostEditorForm,
  PostItem,
} from "shared";
import { articleText, hasArticleContent } from "shared";

export default function AdminPostEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState<PostCategoryDraft>({
    name: "",
    description: "",
  });
  const [savedForm, setSavedForm] = useState("");
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [form, setForm] = useState<PostEditorForm>(createDefaultPostEditorForm);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const [items, post] = await Promise.all([
          getAdminPostCategories(),
          isNew
            ? Promise.resolve(null)
            : requestAdminJson<PostItem>(
                `/admin/posts/${id}`,
                { method: "GET" },
                "Không thể tải bài viết.",
              ),
        ]);
        setCategories(items);
        const initial = post
          ? buildPostEditorForm(post)
          : createDefaultPostEditorForm();
        setForm(initial);
        setSavedForm(JSON.stringify(initial));
      } catch (cause) {
        setLoadError(
          cause instanceof Error
            ? cause.message
            : "Không thể tải thông tin bài viết.",
        );
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [id, isNew, showError]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (savedForm && savedForm !== JSON.stringify(form)) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [savedForm, form]);

  async function addCategory() {
    if (!newCategory.name.trim()) return;
    setSavingCategory(true);
    try {
      await createAdminPostCategory({
        ...newCategory,
        name: newCategory.name.trim(),
      });
      const items = await getAdminPostCategories();
      setCategories(items);
      const created = items.find(
        (item) => item.name === newCategory.name.trim(),
      );
      if (created)
        setForm((previous) => ({
          ...previous,
          category_id: String(created.category_id),
        }));
      setNewCategory({ name: "", description: "" });
      setShowCategories(false);
      success("Đã thêm danh mục.");
    } catch (cause) {
      showError(
        cause instanceof Error ? cause.message : "Không thể thêm danh mục.",
      );
    } finally {
      setSavingCategory(false);
    }
  }

  const handleSave = async () => {
    if (!form.category_id) {
      showError("Vui lòng chọn danh mục trước khi lưu.");
      return;
    }
    if (
      form.status === 1 &&
      (!form.title.trim() ||
        !form.thumbnail ||
        !hasArticleContent(form.content_blocks))
    ) {
      showError(
        "Để đăng công khai, vui lòng nhập tiêu đề, tải ảnh bìa và thêm nội dung bài viết.",
      );
      return;
    }

    setSaving(true);
    try {
      const url = isNew ? "/admin/posts" : `/admin/posts/${id}`;
      const method = isNew ? "POST" : "PATCH";

      await saveAdminPost(url, method, {
        ...form,
        content: articleText(form.content_blocks),
      });
      success(
        form.status === 0
          ? "Đã lưu bản nháp"
          : isNew
            ? "Đã đăng bài viết mới"
            : "Đã cập nhật bài viết",
      );
      router.push("/admin/marketing/posts");
    } catch (cause) {
      showError(
        cause instanceof Error ? cause.message : "Không thể lưu bài viết.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-[14px] border border-[#e1edfc] bg-white p-8 shadow-2xs">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-xs sm:text-sm font-medium">Đang tải thông tin bài viết...</span>
        </div>
      </div>
    );
  }
  if (loadError)
    return (
      <div role="alert" className="flex items-center justify-between rounded-[14px] border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 shadow-2xs">
        <span>{loadError}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="font-bold underline cursor-pointer"
          >
            Tải lại
          </button>
          <button
            onClick={() => router.push("/admin/marketing/posts")}
            className="underline cursor-pointer"
          >
            Về danh sách
          </button>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          aria-label="Quay lại danh sách bài viết"
          onClick={() => router.push("/admin/marketing/posts")}
          className="grid size-9 shrink-0 place-items-center rounded-xl border border-[#dce6f4] bg-white text-[#627491] shadow-2xs transition-colors hover:border-[#98bcfb] hover:text-[#1260eb] cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <AdminPageHeader
            title={isNew ? "Viết bài mới" : "Chỉnh sửa bài viết"}
            description="Tạo nội dung thu hút để tiếp cận nhiều khách hàng hơn."
          />
        </div>
      </div>

      <PostCategoriesModal
        open={showCategories}
        categories={categories}
        newCategory={newCategory}
        saving={savingCategory}
        onClose={() => setShowCategories(false)}
        onCreate={addCategory}
        onDraftChange={setNewCategory}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#e1edfc] bg-gradient-to-r from-blue-50/70 via-sky-50/50 to-indigo-50/50 px-4 py-3 text-xs leading-5 text-blue-800 shadow-2xs">
        <p>
          {isNew
            ? "Đã tạo sẵn mẫu giới thiệu điểm đến. Điền nội dung vào từng khối hoặc thêm, di chuyển và xóa khối theo ý bạn."
            : "Nội dung được chia thành các khối. Mỗi khối sẽ hiển thị theo giao diện chung của trang bài viết."}
        </p>
        <button
          onClick={() => setShowCategories(true)}
          className="font-bold text-blue-700 underline hover:text-blue-900 cursor-pointer"
        >
          Thêm / quản lý danh mục
        </button>
      </div>
      <div className="grid gap-[22px] lg:grid-cols-[minmax(0,1.9fr)_minmax(290px,1fr)]">
        <PostEditorContent form={form} onFormChange={setForm} />

        <PostEditorSidebar
          isNew={isNew}
          saving={saving}
          categories={categories}
          form={form}
          onSave={handleSave}
          onCancel={() => router.push("/admin/marketing/posts")}
          onFormChange={setForm}
        />
      </div>
    </div>
  );
}
