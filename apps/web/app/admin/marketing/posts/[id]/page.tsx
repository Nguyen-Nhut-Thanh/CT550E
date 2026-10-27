"use client";

import { PostEditorContent } from "@/components/admin/posts/PostEditorContent";
import { PostEditorSidebar } from "@/components/admin/posts/PostEditorSidebar";
import { AdminPageHeader } from "@/components/common/AdminPageHeader";
import {
  createAdminPostCategory,
  getAdminPostCategories,
  saveAdminPost,
} from "@/lib/admin/posts/api";
import { requestAdminJson } from "@/lib/http/requestAdminJson";
import { PostCategoriesModal } from "@/components/admin/posts/PostCategoriesModal";
import {
  buildPostEditorForm,
  createDefaultPostEditorForm,
} from "@/lib/admin/posts/forms";
import { useToast } from "@/lib/notifications/useToast";
import { ChevronLeft, Loader2 } from "lucide-react";
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
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }
  if (loadError)
    return (
      <div role="alert" className="rounded-xl bg-red-50 p-6 text-red-700">
        {loadError}
        <button
          onClick={() => window.location.reload()}
          className="ml-4 underline"
        >
          Tải lại
        </button>
        <button
          onClick={() => router.push("/admin/marketing/posts")}
          className="ml-4 underline"
        >
          Về danh sách
        </button>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-full p-2 text-slate-400 transition-all hover:bg-slate-100"
        >
          <ChevronLeft size={24} />
        </button>
        <AdminPageHeader
          title={isNew ? "Viết bài mới" : "Chỉnh sửa bài viết"}
          description="Tạo nội dung thu hút để tiếp cận nhiều khách hàng hơn."
        />
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
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-800">
        <p>
          {isNew
            ? "Đã tạo sẵn mẫu giới thiệu điểm đến. Điền nội dung vào từng khối hoặc thêm, di chuyển và xóa khối theo ý bạn."
            : "Nội dung được chia thành các khối. Mỗi khối sẽ hiển thị theo giao diện chung của trang bài viết."}
        </p>
        <button
          onClick={() => setShowCategories(true)}
          className="font-bold underline"
        >
          Thêm / quản lý danh mục
        </button>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PostEditorContent form={form} onFormChange={setForm} />
        </div>

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
