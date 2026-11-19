"use client";

import { AdminRowActions } from "@/components/common/admin_shared/tables/AdminRowActions";
import { AdminTable } from "@/components/common/admin_shared/tables/AdminTable";
import { Calendar, Edit, ExternalLink, FileText, Tag, Trash2 } from "lucide-react";
import type { PostItem } from "shared";

export interface PostManagementTableProps {
  posts: PostItem[];
  loading: boolean;
  onDelete: (postId: number) => void;
}

export function PostManagementTable({
  posts,
  loading,
  onDelete,
}: PostManagementTableProps) {
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
        <div className="flex items-center gap-3">
          {post.thumbnail ? (
            <img
              src={post.thumbnail}
              className="h-10 w-16 shrink-0 rounded-lg border border-[#e1edfc] object-cover shadow-2xs"
              alt=""
            />
          ) : (
            <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg border border-[#e1edfc] bg-slate-100 text-slate-400">
              <FileText size={16} />
            </div>
          )}
          <div className="space-y-0.5 min-w-0">
            <p className="line-clamp-1 text-[13px] font-bold text-slate-900 hover:text-blue-600">{post.title}</p>
            <div className="flex items-center gap-2.5 text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1">
                <Tag size={12} className="text-slate-400" /> {post.category?.name || "Chưa phân loại"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-slate-400" />
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
          className={`inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-semibold ${
            post.status === 1
              ? "border-emerald-100 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-slate-100 text-slate-600"
          }`}
        >
          {post.status === 1 ? "Công khai" : "Bản nháp"}
        </span>
      ),
    },
    {
      header: "Thao tác",
      align: "right" as const,
      render: (post: PostItem) => (
        <div className="flex justify-end">
          <AdminRowActions
            label={`Thao tác với ${post.title}`}
            actions={[
              ...(post.status === 1
                ? [
                    {
                      label: "Xem bài viết",
                      access: "view" as const,
                      icon: <ExternalLink size={16} />,
                      onClick: () => {
                        window.open(`/blog/${post.slug}`, "_blank", "noopener,noreferrer");
                      },
                    },
                  ]
                : []),
              {
                label: "Chỉnh sửa bài viết",
                icon: <Edit size={16} />,
                href: `/admin/marketing/posts/${post.post_id}`,
              },
              {
                label: "Xóa bài viết",
                icon: <Trash2 size={16} />,
                danger: true,
                onClick: () => onDelete(post.post_id),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <AdminTable
      items={posts}
      columns={columns}
      loading={loading}
      rowKey={(post) => post.post_id}
      pageSize={10}
      itemLabel="bài viết"
      emptyMessage="Không tìm thấy bài viết nào phù hợp."
    />
  );
}

