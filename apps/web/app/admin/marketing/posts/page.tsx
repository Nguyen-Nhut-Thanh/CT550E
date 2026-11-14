"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CustomDropdown from "@/components/common/forms/CustomDropdown";
import { PostCategoriesModal } from "@/components/admin/posts/categories/PostCategoriesModal";
import { PostLayoutManager } from "@/components/admin/posts/layout/PostLayoutManager";
import { PostManagementTable } from "@/components/admin/posts/PostManagementTable";
import { AdminPageHeader } from "@/components/admin/common/AdminPageHeader";
import { AdminSearchInput } from "@/components/admin/common/AdminSearchInput";
import {
  createAdminPostCategory,
  deleteAdminPost,
  getAdminPostCategories,
  getAdminPosts,
} from "@/lib/admin/posts/api";
import { createDefaultPostCategoryDraft, matchesPostSearch } from "@/lib/admin/posts/forms";
import { useToast } from "@/lib/notifications/useToast";
import { confirmAction } from "@/lib/utils/confirm";
import { FileText, LayoutGrid, Plus, Settings2 } from "lucide-react";
import type { PostCategory, PostCategoryDraft, PostItem } from "shared";

type PostsTab = "list" | "layout";

export default function AdminPostsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-slate-100 bg-white p-8">
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

  const handleDelete = async (postId: number) => {
    if (!confirmAction("Bạn có chắc chắn muốn xóa bài viết này?")) {
      return;
    }

    try {
      await deleteAdminPost(postId);
      success("Đã xóa bài viết");
      void loadData();
    } catch {
      showError("Lỗi khi xóa");
    }
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Quản lý Bài viết &amp; Bố cục"
        description="Viết bài, phân loại danh mục và thiết lập bố cục hiển thị trang bài viết cẩm nang."
        actions={
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-xs transition-all hover:bg-slate-50 cursor-pointer"
          >
            <Settings2 size={18} /> Danh mục
          </button>
        }
        primaryAction={
          activeTab === "list"
            ? {
                label: "Viết bài mới",
                onClick: () => router.push("/admin/marketing/posts/new"),
                icon: <Plus size={18} />,
              }
            : undefined
        }
      />

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => handleTabChange("list")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "list"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
          }`}
        >
          <FileText size={16} />
          Danh sách bài viết ({posts.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("layout")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "layout"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
          }`}
        >
          <LayoutGrid size={16} className={activeTab === "layout" ? "text-blue-600" : "text-slate-500"} />
          Bố cục trang bài viết
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "list" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: "Tất cả bài viết", value: posts.length },
              { name: "Đã xuất bản", value: posts.filter((post) => post.status === 1).length },
              { name: "Bản nháp", value: posts.filter((post) => post.status === 0).length },
            ].map((item) => (
              <div key={item.name} className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-500">{item.name}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
            />
            <span className="text-xs text-slate-500">{filteredPosts.length} bài viết</span>
          </div>

          <AdminSearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Tìm tiêu đề bài viết..."
          />

          <PostManagementTable
            posts={filteredPosts}
            loading={loading}
            onDelete={(id) => void handleDelete(id)}
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
    </div>
  );
}
