"use client";

import CustomDropdown from "@/components/common/forms/CustomDropdown";

import { PostCategoriesModal } from "@/components/admin/posts/categories/PostCategoriesModal";
import { AdminRowActions } from "@/components/admin/common/AdminRowActions";
import { AdminPageHeader } from "@/components/admin/common/AdminPageHeader";
import { AdminSearchInput } from "@/components/admin/common/AdminSearchInput";
import { AdminTable } from "@/components/admin/common/AdminTable";
import { createAdminPostCategory, deleteAdminPost, getAdminPostCategories, getAdminPosts } from "@/lib/admin/posts/api";
import { createDefaultPostCategoryDraft, matchesPostSearch } from "@/lib/admin/posts/forms";
import { useToast } from "@/lib/notifications/useToast";
import { confirmAction } from "@/lib/utils/confirm";
import { Calendar, Edit, ExternalLink, FileText, Plus, Settings2, Tag, Trash2, } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PostCategory, PostCategoryDraft, PostItem } from "shared";

export default function AdminPostsPage() {
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState<PostCategoryDraft>(
    createDefaultPostCategoryDraft,
  );
  const [savingCategory, setSavingCategory] = useState(false);

  const { success, error: showError } = useToast();
  const router = useRouter();

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
    () => posts.filter((post) => matchesPostSearch(post, searchTerm) && (statusFilter === '' || post.status === Number(statusFilter)) && (!categoryFilter || post.category_id === Number(categoryFilter))),
    [posts, searchTerm, statusFilter, categoryFilter],
  );

  const handleCreateCategory = async () => {
    if (!newCategory.name) {
      return;
    }

    setSavingCategory(true);

    try {
      await createAdminPostCategory(newCategory);
      success("Đã thêm danh mục mới");
      setNewCategory(createDefaultPostCategoryDraft());
      void loadData();
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

  const columns = [
    {
      header: "STT",
      render: (_: PostItem, index: number) => (
        <span className="font-medium text-slate-400">{String(index + 1).padStart(2, "0")}</span>
      ),
    },
    {
      header: "Bài viết",
      render: (post: PostItem) => (
        <div className="flex items-center gap-4">
          {post.thumbnail ? (
            <img
              src={post.thumbnail}
              className="h-10 w-16 rounded-lg object-cover shadow-sm"
              alt=""
            />
          ) : (
            <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <FileText size={16} />
            </div>
          )}
          <div className="space-y-0.5">
            <p className="line-clamp-1 font-bold text-slate-900">{post.title}</p>
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight text-slate-400">
              <span className="flex items-center gap-1">
                <Tag size={12} /> {post.category?.name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {post.created_at ? new Date(post.created_at).toLocaleDateString("vi-VN") : "---"}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      align: "center" as const,
      render: (post: PostItem) => (
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
            post.status === 1
              ? "border-green-100 bg-green-50 text-green-600"
              : "border-slate-100 bg-slate-50 text-slate-400"
          }`}
        >
          {post.status === 1 ? "Công khai" : "Nháp"}
        </span>
      ),
    },
    {
      header: "Thao tác",
      align: "right" as const,
      render: (post: PostItem) => (
        <div className="flex justify-end">
          <AdminRowActions label={`Thao tác với ${post.title}`} actions={[
            ...(post.status === 1 ? [{
              label: 'Xem bài viết',
              icon: <ExternalLink size={16} />,
              onClick: () => { window.open(`/blog/${post.slug}`, '_blank', 'noopener,noreferrer'); },
            }] : []),
            { label: 'Chỉnh sửa bài viết', icon: <Edit size={16} />, href: `/admin/marketing/posts/${post.post_id}` },
            { label: 'Xóa bài viết', icon: <Trash2 size={16} />, danger: true, onClick: () => { void handleDelete(post.post_id); } },
          ]} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Quản lý Bài viết"
        description="Viết và quản lý các bài viết tin tức, cẩm nang du lịch."
        actions={
          <div className="flex flex-wrap gap-2">
          <button onClick={() => router.push('/admin/marketing/posts/layout')} className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"><Settings2 size={18} /> Bố cục trang bài viết</button>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
          >
            <Settings2 size={18} /> Danh mục
          </button>
          </div>
        }
        primaryAction={{
          label: "Viết bài mới",
          onClick: () => router.push("/admin/marketing/posts/new"),
          icon: <Plus size={18} />,
        }}
      />

      <div className="grid grid-cols-3 gap-3">{[{ name: 'Tất cả bài viết', value: posts.length }, { name: 'Đã xuất bản', value: posts.filter(post => post.status === 1).length }, { name: 'Bản nháp', value: posts.filter(post => post.status === 0).length }].map(item => <div key={item.name} className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs text-slate-500">{item.name}</p><p className="mt-1 text-2xl font-bold text-slate-900">{item.value}</p></div>)}</div>
      <div className="flex flex-wrap items-center gap-3"><CustomDropdown variant="compact" matchTriggerWidth selectedValue={statusFilter} onSelect={setStatusFilter} options={[{ value: '', label: 'Tất cả trạng thái' }, { value: '1', label: 'Đã xuất bản' }, { value: '0', label: 'Bản nháp' }]} /><CustomDropdown variant="compact" matchTriggerWidth selectedValue={categoryFilter} onSelect={setCategoryFilter} options={[{ value: '', label: 'Tất cả danh mục' }, ...categories.map(item => ({ value: String(item.category_id), label: item.name }))]} /><span className="text-xs text-slate-500">{filteredPosts.length} bài viết</span></div>
      <AdminSearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Tìm tiêu đề bài viết..."
      />

      <AdminTable
        items={filteredPosts}
        columns={columns}
        loading={loading}
        rowKey={(post) => post.post_id}
        emptyMessage="Chưa có bài viết nào"
      />

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
