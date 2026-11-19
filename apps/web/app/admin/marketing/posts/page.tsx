"use client";

import { AdminStatGrid } from "@/components/common/admin_shared/cards/AdminStatGrid";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CustomDropdown from "@/components/common/form_controls/CustomDropdown";
import { PostCategoriesModal } from "@/components/posts/post_management/AdminPostCategoriesModal";
import { PostLayoutManager } from "@/components/posts/post_editor/AdminPostLayoutManager";
import { PostManagementTable } from "@/components/posts/post_management/AdminPostManagementTable";
import { ConfirmDialog } from "@/components/common/dialogs_and_feedback/dialogs/ConfirmDialog";
import { AdminPageHeader } from "@/components/common/admin_shared/layout/AdminPageHeader";
import { AdminSearchInput } from "@/components/common/admin_shared/tables/AdminSearchInput";
import {
  createAdminPostCategory,
  deleteAdminPost,
  getAdminPostCategories,
  getAdminPosts,
} from "@/lib/posts/admin/api";
import { createDefaultPostCategoryDraft, matchesPostSearch } from "@/lib/posts/admin/forms";
import { useToast } from "@/lib/notifications/useToast";
import { CheckCircle2, FileEdit, FileText, LayoutGrid, Plus, Settings2, Trash2 } from "lucide-react";
import type { PostCategory, PostCategoryDraft, PostItem } from "shared";

type PostsTab = "list" | "layout";

export default function AdminPostsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[300px] items-center justify-center rounded-[14px] border border-[#e1edfc] bg-white p-6 shadow-2xs">
          <div className="text-sm font-medium text-slate-500">Đang tải quản lý bài viết…</div>
        </div>
      }
    >
      <AdminPostsContent />
    </Suspense>
  );
}

function AdminPostsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab: PostsTab = tabParam === "layout" ? "layout" : "list";

  const [activeTab, setActiveTab] = useState<PostsTab>(initialTab);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState<PostCategoryDraft>(
    createDefaultPostCategoryDraft
  );
  const [savingCategory, setSavingCategory] = useState(false);
  const [pendingDeletePostId, setPendingDeletePostId] = useState<number | null>(null);
  const [deletingPost, setDeletingPost] = useState(false);

  const { success, error: showError } = useToast();

  useEffect(() => {
    if (tabParam === "layout") {
      setActiveTab("layout");
    } else {
      setActiveTab("list");
    }
  }, [tabParam]);

  const handleTabChange = (nextTab: PostsTab) => {
    setActiveTab(nextTab);
    const params = new URLSearchParams(searchParams.toString());
    if (nextTab === "list") {
      params.delete("tab");
    } else {
      params.set("tab", nextTab);
    }
    const qs = params.toString();
    router.replace(`/admin/marketing/posts${qs ? `?${qs}` : ""}`, { scroll: false });
  };

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [postsData, categoriesData] = await Promise.all([
        getAdminPosts(),
        getAdminPostCategories(),
      ]);
      setPosts(postsData);
      setCategories(categoriesData);
    } catch {
      showError("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredPosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          matchesPostSearch(post, searchTerm) &&
          (statusFilter === "" || String(post.status) === statusFilter) &&
          (categoryFilter === "" || String(post.category_id) === categoryFilter)
      ),
    [posts, searchTerm, statusFilter, categoryFilter]
  );

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      showError("Tên danh mục không được để trống");
      return;
    }

    setSavingCategory(true);
    try {
      await createAdminPostCategory(newCategory);
      success("Đã thêm danh mục mới");
      setShowCategoryModal(false);
      setNewCategory(createDefaultPostCategoryDraft());
      setCategories(await getAdminPostCategories());
    } catch {
      showError("Lỗi khi thêm danh mục");
    } finally {
      setSavingCategory(false);
    }
  };

  const executeDelete = async () => {
    if (!pendingDeletePostId) return;
    setDeletingPost(true);
    try {
      await deleteAdminPost(pendingDeletePostId);
      success("Đã xóa bài viết");
      setPendingDeletePostId(null);
      void loadData();
    } catch {
      showError("Lỗi khi xóa");
    } finally {
      setDeletingPost(false);
    }
  };

  return (
    <div className="space-y-3.5">
      <AdminPageHeader
        title="Quản lý Bài viết &amp; Bố cục"
        description="Viết bài, phân loại danh mục và thiết lập bố cục hiển thị trang bài viết cẩm nang."
        actions={
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 rounded-lg border border-[#e1edfc] bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 cursor-pointer"
          >
            <Settings2 size={16} /> Danh mục
          </button>
        }
        primaryAction={
          activeTab === "list"
            ? {
                label: "Viết bài mới",
                onClick: () => router.push("/admin/marketing/posts/new"),
                icon: <Plus size={16} />,
              }
            : undefined
        }
      />

      {/* Tab Navigation */}
      <div className="flex border-b border-[#e1edfc]">
        <button
          type="button"
          onClick={() => handleTabChange("list")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "list"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
          }`}
        >
          <FileText size={16} />
          Danh sách bài viết ({posts.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("layout")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "layout"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
          }`}
        >
          <LayoutGrid size={16} className={activeTab === "layout" ? "text-blue-600" : "text-slate-500"} />
          Bố cục trang bài viết
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "list" && (
        <div className="space-y-3.5">
          <AdminStatGrid
            label="Thống kê bài viết"
            loading={loading}
            items={[
              { id: "total", title: "Tất cả bài viết", value: posts.length, icon: FileText, tone: "blue" },
              { id: "published", title: "Đã xuất bản", value: posts.filter((post) => post.status === 1).length, icon: CheckCircle2, tone: "green" },
              { id: "draft", title: "Bản nháp", value: posts.filter((post) => post.status === 0).length, icon: FileEdit, tone: "amber" },
            ]}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <AdminSearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Tìm tiêu đề bài viết..."
              />
            </div>
            <CustomDropdown
              ariaLabel="Lọc theo trạng thái xuất bản"
              variant="compact"
              matchTriggerWidth
              selectedValue={statusFilter}
              onSelect={setStatusFilter}
              options={[
                { value: "", label: "Tất cả trạng thái" },
                { value: "1", label: "Đã xuất bản" },
                { value: "0", label: "Bản nháp" },
              ]}
              className="w-full sm:w-[175px] shrink-0"
            />
            <CustomDropdown
              ariaLabel="Lọc theo danh mục bài viết"
              variant="compact"
              matchTriggerWidth
              selectedValue={categoryFilter}
              onSelect={setCategoryFilter}
              options={[
                { value: "", label: "Tất cả danh mục" },
                ...categories.map((item) => ({
                  value: String(item.category_id),
                  label: item.name,
                })),
              ]}
              className="w-full sm:w-[195px] shrink-0"
            />
          </div>

          <PostManagementTable
            posts={filteredPosts}
            loading={loading}
            onDelete={(id) => setPendingDeletePostId(id)}
          />
        </div>
      )}

      {activeTab === "layout" && <PostLayoutManager />}

      <PostCategoriesModal
        open={showCategoryModal}
        categories={categories}
        newCategory={newCategory}
        saving={savingCategory}
        onClose={() => setShowCategoryModal(false)}
        onCreate={handleCreateCategory}
        onDraftChange={setNewCategory}
      />

      <ConfirmDialog
        open={pendingDeletePostId !== null}
        icon={<Trash2 size={32} className="text-rose-600" />}
        title="Xóa bài viết?"
        description="Bạn có chắc chắn muốn xóa bài viết này khỏi hệ thống? Hành động này không thể hoàn tác."
        confirmLabel={deletingPost ? "Đang xóa..." : "Xác nhận xóa"}
        cancelLabel="Hủy bỏ"
        onConfirm={() => void executeDelete()}
        onCancel={() => !deletingPost && setPendingDeletePostId(null)}
      />
    </div>
  );
}
